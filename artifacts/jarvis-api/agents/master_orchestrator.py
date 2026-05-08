"""
EDITH Master Orchestrator v2 — Uses AgenticCore + OS Control
Routes requests to optimal models, maintains session history, streams responses
"""

import json
import os
import datetime
from typing import AsyncGenerator

from agents.agentic_core import edith
from agents.model_router import router
from agents.command_parser import parser as cmd_parser


class EDITHOrchestrator:
    """Main orchestrator using new agentic core"""

    def __init__(self):
        self._sessions: dict[str, list[dict]] = {}
        self._task_logs: dict[str, list[dict]] = {}
        self._active_system: dict[str, str] = {}
        self._active_language: dict[str, str] = {}

    def _get_history(self, session_id: str) -> list[dict]:
        return self._sessions.setdefault(session_id, [])

    def _get_task_log(self, session_id: str) -> list[dict]:
        return self._task_logs.setdefault(session_id, [])

    async def think_and_respond(
        self, user_input: str, session_id: str = "commander"
    ) -> dict:
        """Process user input with OS control check then agentic core"""
        history = self._get_history(session_id)
        task_log = self._get_task_log(session_id)
        
        # ── CHECK FOR OS COMMAND FIRST ──────────────────────────
        os_action = cmd_parser.parse(user_input)
        
        if os_action:
            try:
                # Execute OS action
                result = os_action.get("execute", lambda: {})()
                
                # Generate response
                action_type = os_action.get("type", "unknown")
                
                if result.get("success"):
                    if action_type == "open_app":
                        reply = f"Done! {result.get('message', 'App opened')}"
                    elif action_type == "search":
                        reply = f"Searching for '{os_action.get('query', 'query')}' on {os_action.get('engine', 'google')}."
                    elif action_type == "close_app":
                        reply = f"Closed {os_action.get('app', 'app')}."
                    elif action_type == "volume":
                        reply = f"Volume set to {os_action.get('level', 0)}%."
                    elif action_type == "screenshot":
                        reply = "Screenshot taken."
                    elif action_type == "system_info":
                        info = result
                        reply = f"System: CPU {info.get('cpu_percent', 0):.1f}% | RAM {info.get('memory_percent', 0):.1f}% | Disk {info.get('disk_percent', 0):.1f}%"
                    elif action_type == "running_apps":
                        apps = result.get("apps", [])[:5]
                        app_list = ", ".join(apps) if apps else "none"
                        reply = f"Running: {app_list} and {result.get('count', 0)} more."
                    elif action_type == "open_folder":
                        reply = f"Opened folder: {os_action.get('path', 'path')}"
                    elif action_type == "open_file":
                        reply = f"Opened file: {os_action.get('path', 'path')}"
                    else:
                        reply = result.get("message", "Command executed!")
                else:
                    reply = f"Could not complete: {result.get('message', 'Unknown error')}"
                
                # Add to history
                history.append({"role": "user", "content": user_input})
                history.append({"role": "assistant", "content": reply})
                
                # Log task
                task_entry = {
                    "id": len(task_log) + 1,
                    "input": user_input[:120],
                    "system": "os_control",
                    "status": "complete" if result.get("success") else "error",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "action_type": action_type,
                }
                task_log.append(task_entry)
                
                self._active_system[session_id] = "os_control"
                self._active_language[session_id] = "english"
                
                return {
                    "reply": reply,
                    "system": "os_control",
                    "language": "english",
                    "routing": {"system": "os_control"},
                    "tools_executed": ["os_command"],
                    "task_id": task_entry["id"],
                    "action": os_action,
                    "action_result": result,
                    "model_status": router.status(),
                }
            except Exception as e:
                print(f"⚠️ OS command error: {e}")
                # Fall through to LLM if OS command fails
        
        # ── NOT AN OS COMMAND → USE AGENTIC CORE ───────────────
        # Use agentic core for intelligent processing
        result = await edith.process(user_input, session_id)
        
        # Update local session tracking
        language = result.get("language", "english")
        system = result.get("system", "core")
        
        self._active_system[session_id] = system
        self._active_language[session_id] = language
        
        task_entry = {
            "id": len(task_log) + 1,
            "input": user_input[:120],
            "system": system,
            "status": "complete",
            "timestamp": datetime.datetime.now().isoformat(),
            "response": result.get("reply", "")[:100],
            "language": language,
            "tools_executed": len(result.get("tools_executed", [])),
        }
        task_log.append(task_entry)
        
        # Track conversation
        history.append({"role": "user", "content": user_input})
        history.append({"role": "assistant", "content": result.get("reply", "")})
        
        return {
            "reply": result.get("reply", ""),
            "system": system,
            "language": language,
            "routing": result.get("routing", {"system": system}),
            "tools_executed": result.get("tools_executed", []),
            "task_id": task_entry["id"],
            "model_status": router.status(),
        }

    async def stream_response(
        self, user_input: str, session_id: str = "commander"
    ) -> AsyncGenerator[dict, None]:
        """Stream response tokens as they arrive"""
        language = edith.detect_language(user_input)
        system = edith.detect_system(user_input)
        
        self._active_system[session_id] = system
        self._active_language[session_id] = language
        
        history = self._get_history(session_id)
        task_log = self._get_task_log(session_id)
        
        history.append({"role": "user", "content": user_input})
        
        task_entry = {
            "id": len(task_log) + 1,
            "input": user_input[:120],
            "system": system,
            "status": "streaming",
            "timestamp": datetime.datetime.now().isoformat(),
        }
        task_log.append(task_entry)
        
        full_reply = ""
        async for chunk in edith.stream_process(user_input):
            full_reply += chunk.get("token", "")
            
            yield {
                "token": chunk.get("token", ""),
                "system": system,
                "language": language,
                "done": chunk.get("done", False),
                "error": chunk.get("error"),
            }
        
        # Update history with full response
        history.append({"role": "assistant", "content": full_reply})
        task_entry["status"] = "complete"
        task_entry["response"] = full_reply[:100]

    async def respond(self, user_input: str, session_id: str = "commander") -> dict:
        """Get single response"""
        return await self.think_and_respond(user_input, session_id)

    def get_status(self, session_id: str = "commander") -> dict:
        """Get orchestrator and agent status"""
        history = self._get_history(session_id)
        task_log = self._get_task_log(session_id)
        turns = len([m for m in history if m["role"] == "user"])
        
        return {
            "status": "online",
            "system": "EDITH Master Orchestrator v2",
            "active_system": self._active_system.get(session_id, "core"),
            "active_language": self._active_language.get(session_id, "english"),
            "conversation_turns": turns,
            "tasks_completed": len([t for t in task_log if t["status"] == "complete"]),
            "task_log": task_log[-10:],
            "model_status": router.status(),
            "agent_status": edith.get_status(),
            "available_systems": list(router.list_models().get('nvidia_models', {}).keys()),
        }

    def get_history(self, session_id: str = "commander") -> list[dict]:
        """Get conversation history"""
        return self._get_history(session_id)

    def clear_history(self, session_id: str = "commander"):
        """Clear session history"""
        self._sessions[session_id] = []
        self._task_logs[session_id] = []
        self._active_system[session_id] = "core"
        self._active_language[session_id] = "english"
        edith.clear_history()


# Global orchestrator instance
orchestrator = EDITHOrchestrator()

__all__ = ["orchestrator", "EDITHOrchestrator"]
