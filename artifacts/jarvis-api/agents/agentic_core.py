"""
Agentic Core - Autonomous task execution with language detection
Handles tool calling, multi-language support, and intelligent routing
"""

import asyncio
import json
import os
import re
from agents.model_router import router
from agents.os_engine import os_engine
from agents.command_parser import parser

AGENTIC_SYSTEM_PROMPT = """You are EDITH — Earth's Digital Intelligence & Task Handler. 
You are a fully autonomous Jarvis-level AI agent.

CORE CAPABILITIES:
✓ Control computer: open apps, files, browser, settings
✓ Execute commands: terminal commands, scripts
✓ Search web in real time
✓ Create documents: text, PDFs, presentations
✓ System control: volume, brightness, wifi, display
✓ Screenshot & analysis
✓ Task execution: multi-step workflows
✓ Memory: remember everything in conversation

AGENTIC BEHAVIOR RULES:
1. Break complex tasks into steps automatically
2. Execute each step autonomously
3. Only confirm: sending messages, deleting files, making purchases
4. Report progress at each step
5. Never give up — always find alternative approaches
6. If approach fails, try different method

TOOL FORMAT (when you need tools):
<tool>tool_name</tool>
<params>{"key": "value"}</params>

IMPORTANT NOTES:
- Detect user language from input
- Reply ONLY in detected language
- For Hindi requests: reply ONLY in Hindi
- For English: reply ONLY in English
- For Hinglish: reply in Hinglish
- NEVER mix languages
"""

TOOL_EXECUTOR = {
    "open_app": lambda p: os_engine.open_app(p.get("app", "")),
    "open_url": lambda p: os_engine.open_url(p.get("url", "")),
    "search_web": lambda p: os_engine.search_web(p.get("query", ""), p.get("engine", "google")),
    "run_command": lambda p: os_engine.run_command(p.get("cmd", "")),
    "take_screenshot": lambda p: os_engine.take_screenshot(),
    "create_file": lambda p: os_engine.create_file(p.get("path", ""), p.get("content", "")),
    "list_files": lambda p: os_engine.list_files(p.get("path", ".")),
    "get_system_info": lambda p: os_engine.get_system_info(),
    "close_app": lambda p: os_engine.close_app(p.get("app", "")),
    "set_volume": lambda p: os_engine.set_volume(p.get("level", 50)),
    "set_brightness": lambda p: os_engine.set_brightness(p.get("level", 50)),
    "delete_file": lambda p: os_engine.delete_file(p.get("path", "")),
    "send_message": lambda p: os_engine.send_message(p.get("message", "")),
}


class AgenticCore:
    """Autonomous agent core with multi-system intelligence"""

    def __init__(self):
        self.conversation_history = []
        self.task_queue = []
        self.completed_tasks = []
        self.active_system = "core"
        self.cache = {}
        self.user_language = "english"

    def detect_language(self, text: str) -> str:
        """Detect language from text: hindi/hinglish/english"""
        # Hindi character detection
        hindi_chars = set(
            'अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह'
        )
        hindi_count = sum(1 for c in text if c in hindi_chars)
        
        if hindi_count > len(text) * 0.1:  # >10% Hindi chars
            return "hindi"
        
        # Hinglish detection - expanded keywords
        hinglish_words = {
            "kya", "hai", "karo", "mein", "aur", "nahi", "hoga", "batao",
            "kholo", "chalao", "dikhao", "banda", "bhai", "dekho", "sunao",
            "iska", "sirf", "bilkul", "thik", "buss", "phir", "tab", "ab",
            "kal", "aaj", "din", "raat", "suno", "malum", "samjha", "karte",
            "likho", "banao", "dedo", "do", "le", "manga", "dhundo", "batana",
            "jaao", "aja", "aa", "gya", "lena", "dena"
        }
        hinglish_score = sum(
            1 for word in text.lower().split() 
            if word in hinglish_words
        )
        
        if hinglish_score >= 1:  # 1+ hinglish words (lowered threshold)
            return "hinglish"
        
        return "english"

    def detect_system(self, text: str) -> str:
        """Detect task type and route to appropriate model"""
        text_lower = text.lower()
        
        # Check os_control first (includes screenshot)
        if any(w in text_lower for w in [
            "open", "launch", "close", "volume", "screenshot",
            "kholo", "chalao", "band karo", "band", "volume",
            "take screenshot", "screen capture", "capture"
        ]):
            return "os_control"
        
        if any(w in text_lower for w in [
            "code", "program", "script", "function", "debug", "python",
            "javascript", "likhna", "likh", "code likho"
        ]):
            return "code"
        
        if any(w in text_lower for w in [
            "search", "news", "find", "latest", "information",
            "dhundho", "khabar", "search karo", "khoj"
        ]):
            return "search"
        
        if any(w in text_lower for w in [
            "plan", "strategy", "steps", "phases", "organize",
            "project", "plan karo", "socho"
        ]):
            return "planning"
        
        if any(w in text_lower for w in [
            "file", "document", "pdf", "ppt", "excel", "create",
            "likho", "banao", "document"
        ]):
            return "files"
        
        if any(w in text_lower for w in [
            "image", "photo", "analyze", "vision",
            "dekho", "dikhao", "photo dekho", "image analyze"
        ]):
            return "vision"
        
        if any(w in text_lower for w in [
            "security", "hack", "vulnerability", "threat", "scan",
            "protect", "suraksha"
        ]):
            return "security"
        
        if any(w in text_lower for w in [
            "हिंद", "हिन्द", "lang", "भाषा", "language"
        ]):
            return "multilingual"
        
        return "core"

    def parse_tool_calls(self, text: str) -> list:
        """Extract tool calls from AI response"""
        tools = []
        tool_pattern = re.findall(
            r'<tool>(.*?)</tool>\s*<params>(.*?)</params>',
            text, re.DOTALL
        )
        
        for tool_name, params_str in tool_pattern:
            try:
                params = json.loads(params_str.strip())
                tools.append({
                    "tool": tool_name.strip(),
                    "params": params
                })
            except json.JSONDecodeError:
                # Try to parse as dict-like string
                tools.append({
                    "tool": tool_name.strip(),
                    "params": {}
                })
        
        return tools

    def execute_tools(self, tools: list) -> list:
        """Execute tool calls locally"""
        results = []
        
        for tool in tools:
            tool_name = tool["tool"]
            params = tool["params"]
            executor = TOOL_EXECUTOR.get(tool_name)
            
            if executor:
                try:
                    result = executor(params)
                    results.append({
                        "tool": tool_name,
                        "params": params,
                        "result": result,
                        "success": True
                    })
                except Exception as e:
                    results.append({
                        "tool": tool_name,
                        "params": params,
                        "error": str(e),
                        "success": False
                    })
        
        return results

    async def process(
        self,
        user_input: str,
        session_id: str = "default"
    ) -> dict:
        """
        Process user input with autonomous execution
        
        Args:
            user_input: User message
            session_id: Conversation session ID
        
        Returns:
            Response with reply, tools executed, language
        """
        # Detect language
        language = self.detect_language(user_input)
        self.user_language = language
        
        # Try OS command first (for immediate actions)
        os_action = parser.parse(user_input)
        if os_action:
            result = os_action.get("execute", lambda: {})()
            return {
                "reply": result.get("message", "Done!"),
                "system": "os_control",
                "language": language,
                "tools_executed": [
                    {
                        "tool": os_action.get("type"),
                        "result": result,
                        "success": True
                    }
                ]
            }
        
        # Detect system/task type
        system = self.detect_system(user_input)
        self.active_system = system
        
        # Language instruction for model
        lang_instruction = {
            "hindi": "उत्तर सिर्फ हिंदी में दो। कोई अन्य भाषा न मिलाएं। (Reply ONLY in Hindi)",
            "hinglish": "Hinglish mein jawab do. Hindi + English mix kar sakte ho.",
            "english": "Reply ONLY in English."
        }
        
        # Build conversation context
        self.conversation_history.append({
            "role": "user",
            "content": user_input
        })
        
        messages = [
            {
                "role": "system",
                "content": (
                    AGENTIC_SYSTEM_PROMPT +
                    f"\n\nLANGUAGE RULE: {lang_instruction[language]}"
                )
            }
        ] + self.conversation_history[-10:]  # Keep last 10 messages
        
        # Get AI response
        try:
            response = await router.generate(
                messages=messages,
                system=system,
                max_tokens=1024,
                temperature=0.7
            )
            
            reply = response.choices[0].message.content
            
            # Execute any tool calls in response
            tools = self.parse_tool_calls(reply)
            tool_results = []
            
            if tools:
                tool_results = self.execute_tools(tools)
                # Clean up tool XML from visible reply
                reply = re.sub(
                    r'<tool>.*?</tool>\s*<params>.*?</params>',
                    '', reply, flags=re.DOTALL
                ).strip()
            
            # Add to history
            self.conversation_history.append({
                "role": "assistant",
                "content": reply
            })
            
            return {
                "reply": reply,
                "system": system,
                "language": language,
                "tools_executed": tool_results,
                "routing": {
                    "system": system,
                    "language": language,
                    "model_status": router.status()
                }
            }
        
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            return {
                "reply": error_msg,
                "system": system,
                "language": language,
                "error": str(e),
                "tools_executed": []
            }

    async def stream_process(
        self,
        user_input: str
    ):
        """
        Stream response tokens as they arrive
        
        Yields tokens for real-time UI updates
        """
        language = self.detect_language(user_input)
        self.user_language = language
        
        # Try OS command first
        os_action = parser.parse(user_input)
        if os_action:
            result = os_action.get("execute", lambda: {})()
            reply = result.get("message", "Done!")
            yield {
                "token": reply,
                "system": "os_control",
                "done": True,
                "language": language
            }
            return
        
        system = self.detect_system(user_input)
        self.active_system = system
        
        lang_instruction = {
            "hindi": "उत्तर सिर्फ हिंदी में दो।",
            "hinglish": "Hinglish mein jawab do.",
            "english": "Reply ONLY in English."
        }
        
        self.conversation_history.append({
            "role": "user",
            "content": user_input
        })
        
        messages = [
            {
                "role": "system",
                "content": (
                    AGENTIC_SYSTEM_PROMPT +
                    f"\n\nLANGUAGE: {lang_instruction[language]}"
                )
            }
        ] + self.conversation_history[-10:]
        
        full_reply = ""
        
        try:
            async for token in router.generate_stream(
                messages=messages,
                system=system,
                max_tokens=1024
            ):
                full_reply += token
                yield {
                    "token": token,
                    "system": system,
                    "done": False,
                    "language": language
                }
            
            # Check for tools in final reply
            tools = self.parse_tool_calls(full_reply)
            if tools:
                self.execute_tools(tools)
            
            self.conversation_history.append({
                "role": "assistant",
                "content": full_reply
            })
            
            yield {
                "token": "",
                "system": system,
                "done": True,
                "language": language
            }
        
        except Exception as e:
            yield {
                "token": f"Error: {str(e)}",
                "system": system,
                "done": True,
                "language": language,
                "error": str(e)
            }

    def get_status(self) -> dict:
        """Get agent status and statistics"""
        return {
            "active_system": self.active_system,
            "current_language": self.user_language,
            "conversation_turns": len([
                m for m in self.conversation_history
                if m["role"] == "user"
            ]),
            "tasks_completed": len(self.completed_tasks),
            "model_status": router.status(),
            "available_systems": [
                "code", "planning", "search", "vision", "os_control",
                "files", "security", "multilingual", "advanced", "daily", "core"
            ]
        }

    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        self.completed_tasks = []

    def get_history(self) -> list:
        """Get conversation history"""
        return self.conversation_history

    def set_system(self, system: str):
        """Manually set active system"""
        valid_systems = [
            "code", "planning", "search", "vision", "os_control",
            "files", "security", "multilingual", "advanced", "daily", "core"
        ]
        if system in valid_systems:
            self.active_system = system


# Global instance
edith = AgenticCore()

__all__ = ["edith", "AgenticCore"]
