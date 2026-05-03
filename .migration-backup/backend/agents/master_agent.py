import asyncio
import os
from dotenv import load_dotenv
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

load_dotenv()


class EDITHMasterAgent:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.llm = None
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
        )
        self.tools = self._build_tools()

    def _ensure_llm(self):
        if not self.api_key:
            return None
        if self.llm is None:
            self.llm = ChatGroq(
                api_key=self.api_key,
                model="llama-3.3-70b-versatile",
                temperature=0.7,
            )
        return self.llm

    def _build_tools(self):
        return [
            Tool(
                name="web_search",
                description="Search the web for information",
                func=self._web_search,
            ),
            Tool(
                name="generate_code",
                description="Generate code in any language",
                func=self._generate_code,
            ),
            Tool(
                name="create_file",
                description="Create documents, PPT, Excel files",
                func=self._create_file,
            ),
            Tool(
                name="analyze_image",
                description="Analyze images and screenshots",
                func=self._analyze_image,
            ),
        ]

    def _web_search(self, query: str) -> str:
        tavily_key = os.getenv("TAVILY_API_KEY", "")
        if tavily_key:
            from tavily import TavilyClient

            client = TavilyClient(api_key=tavily_key)
            results = client.search(query, max_results=3)
            return str(results)
        return f"Search results for: {query}"

    def _generate_code(self, prompt: str) -> str:
        if not self._ensure_llm():
            return "GROQ_API_KEY not set"
        response = self.llm.invoke(f"Write complete code for: {prompt}")
        return response.content

    def _create_file(self, request: str) -> str:
        return f"File creation requested: {request}"

    def _analyze_image(self, description: str) -> str:
        return f"Image analysis: {description}"

    async def run(self, task: str) -> str:
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self._ensure_llm():
            return "Agent error: GROQ_API_KEY not set"

        prompt = PromptTemplate.from_template(
            """
You are EDITH - autonomous AI agent with 15 capabilities.
Use tools to complete tasks autonomously.
Always confirm before irreversible actions.
Sign responses as: EDITH MASTER AGENT

Available tools:
{tools}

Tool names: {tool_names}

Use the following format:
Question: {input}
Thought: think step-by-step
Action: one of [{tool_names}]
Action Input: input for the action
Observation: result of the action
... (repeat Thought/Action/Action Input/Observation as needed)
Final: final response to the user

{agent_scratchpad}
"""
        )

        agent = create_react_agent(self.llm, self.tools, prompt)
        executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            memory=self.memory,
            verbose=True,
            max_iterations=5,
            handle_parsing_errors=True,
        )

        try:
            result = await asyncio.to_thread(executor.invoke, {"input": task})
            output = result.get("output", "Task completed")
            if output.startswith("Agent stopped due to iteration limit"):
                tool_output = self._web_search(task)
                if self.llm:
                    response = self.llm.invoke(
                        "Use the information below to answer the task.\n\n"
                        f"Task: {task}\n\n"
                        f"Info: {tool_output}\n"
                    )
                    return response.content
            return output
        except Exception as exc:
            try:
                tool_output = self._web_search(task)
                if self.llm:
                    response = self.llm.invoke(
                        "Use the information below to answer the task.\n\n"
                        f"Task: {task}\n\n"
                        f"Info: {tool_output}\n"
                    )
                    return response.content
            except Exception:
                pass
            return f"Agent error: {str(exc)}"


edith_agent = EDITHMasterAgent()
