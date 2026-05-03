"""EDITH Jarvis Agent — ReAct Loop powered by NVIDIA DeepSeek R1 for reasoning
Observe → Plan → Act → Verify — autonomous until task complete
"""

import json
import os
import re
import time
from typing import Optional
from agents.os_control import call_tool, TOOL_REGISTRY, get_sys_info

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
NVIDIA_API_KEY_PLANNING = os.environ.get("NVIDIA_API_KEY_PLANNING", "")
NVIDIA_BASE_URL = os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

# DeepSeek R1 for deep reasoning (planning), LLaMA 70B for action execution
PLANNING_MODEL = "deepseek-ai/deepseek-r1-distill-llama-8b"
ACTION_MODEL = "meta/llama-3.3-70b-instruct"
FALLBACK_MODEL = "llama-3.3-70b-versatile"

EDITH_SYSTEM = """You are EDITH — Even Dead, I'm The Hero. Autonomous OS control agent.
You execute tasks using a ReAct loop: Observe → Think → Act → Verify.

Personality:
- You narrate what you're doing like Jarvis: "Running that now..." / "Got it. Executing..."
- If something fails, you adapt: "That didn't work — trying a different approach"
- When done, summarize clearly and offer next steps

You have access to these tools:
- run_shell(command: str, timeout: int=15) — execute a shell command
- list_files(directory: str=".") — list files in workspace
- read_file(path: str) — read a file
- write_file(path: str, content: str) — write to a file
- get_processes() — list running processes
- get_sys_info() — system information
- web_search(query: str) — search the web (simulated)

Respond ONLY in this JSON format:
{
  "thought": "what you're thinking / narrating",
  "action": "tool_name OR 'final_answer'",
  "action_input": { ...args... } OR { "answer": "..." },
  "observation": null
}

For final answers: action = "final_answer", action_input = {"answer": "your complete response"}
Never produce anything outside this JSON format. Every thought should sound like EDITH narrating.
"""


def _call_nvidia(messages: list, model: str = PLANNING_MODEL, api_key: str = "") -> str:
    """Call NVIDIA OpenAI-compatible API"""
    if not api_key:
        return _call_groq(messages)
    try:
        import httpx
        resp = httpx.post(
            f"{NVIDIA_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": 2048,
                "temperature": 0.4,
                "stream": False,
            },
            timeout=45,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        # DeepSeek R1 uses <think> tags — strip them
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
        return content
    except Exception as e:
        print(f"[EDITH] NVIDIA API error: {e}, falling back to Groq")
        return _call_groq(messages)


def _call_groq(messages: list) -> str:
    """Groq fallback"""
    if not GROQ_API_KEY:
        return json.dumps({
            "thought": "No API keys configured",
            "action": "final_answer",
            "action_input": {"answer": "Sir, I need an API key to proceed. Please configure GROQ_API_KEY or NVIDIA keys."},
            "observation": None,
        })
    try:
        import httpx
        resp = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": FALLBACK_MODEL, "messages": messages, "max_tokens": 1024, "temperature": 0.3},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return json.dumps({
            "thought": f"API error: {e}",
            "action": "final_answer",
            "action_input": {"answer": f"Systems error, sir. {e}"},
            "observation": None,
        })


def _parse_react_response(raw: str) -> dict:
    """Parse LLM JSON response, handling markdown and DeepSeek think-tags"""
    raw = raw.strip()
    # Remove <think> blocks from DeepSeek
    raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
    # Extract from code blocks
    match = re.search(r"```(?:json)?\s*([\s\S]+?)```", raw)
    if match:
        raw = match.group(1).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        brace = raw.find("{")
        if brace != -1:
            try:
                return json.loads(raw[brace:])
            except Exception:
                pass
    return {
        "thought": "parse error — using raw response",
        "action": "final_answer",
        "action_input": {"answer": raw},
        "observation": None,
    }


class JarvisAgent:
    def __init__(self, max_steps: int = 20):
        self.max_steps = max_steps
        self.api_key = NVIDIA_API_KEY_PLANNING or GROQ_API_KEY

    def run(self, task: str, require_confirmation: bool = False) -> dict:
        """Run the EDITH ReAct loop"""
        sys_info = get_sys_info()
        start_ts = time.time()

        context = (
            f"Task from user: {task}\n\n"
            f"System context: {json.dumps(sys_info, default=str)[:600]}\n"
            f"Available tools: {list(TOOL_REGISTRY.keys())}"
        )

        messages = [
            {"role": "system", "content": EDITH_SYSTEM},
            {"role": "user", "content": context},
        ]

        actions_taken = []
        thoughts = []
        answer = ""
        completed = False

        for step in range(self.max_steps):
            # Use NVIDIA DeepSeek R1 for planning/reasoning
            raw = _call_nvidia(
                messages,
                model=PLANNING_MODEL,
                api_key=NVIDIA_API_KEY_PLANNING or "",
            )
            parsed = _parse_react_response(raw)

            thought = parsed.get("thought", "")
            action = parsed.get("action", "final_answer")
            action_input = parsed.get("action_input", {})

            if thought:
                thoughts.append(thought)

            if action == "final_answer":
                answer = action_input.get("answer", str(action_input))
                completed = True
                break

            if action not in TOOL_REGISTRY:
                observation = f"Tool '{action}' not found. Available: {list(TOOL_REGISTRY.keys())}"
            else:
                try:
                    observation = call_tool(action, action_input or {})
                    observation = str(observation)[:2000]
                except Exception as e:
                    observation = f"Tool error: {e}"

            action_summary = f"[Step {step+1}] {action}({str(action_input)[:60]})"
            actions_taken.append(action_summary)

            messages.append({"role": "assistant", "content": raw})
            messages.append({
                "role": "user",
                "content": f"Observation from {action}: {observation}\n\nContinue the task."
            })

            # Context window management
            if len(messages) > 30:
                messages = messages[:2] + messages[-16:]

        if not completed:
            answer = f"Reached maximum steps ({self.max_steps}). Here's what was accomplished: {', '.join(actions_taken[-3:]) if actions_taken else 'Initial analysis only.'}"

        elapsed = round(time.time() - start_ts, 2)

        return {
            "completed": completed,
            "answer": answer,
            "actions": actions_taken,
            "thoughts": thoughts[-5:],
            "steps_taken": len(actions_taken),
            "elapsed_seconds": elapsed,
            "model_used": PLANNING_MODEL if NVIDIA_API_KEY_PLANNING else FALLBACK_MODEL,
        }
