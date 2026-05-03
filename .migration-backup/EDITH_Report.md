# EDITH 2.0 Technical Report

This report is written to start from zero knowledge and progress to advanced technical depth. Where the repository does not provide explicit details, assumptions are clearly labeled.

## Assumptions and Data Gaps (Explicit)
- No training pipelines or datasets are present in the repository; model training details are inferred as external to this project.
- Several backend services (Redis, ChromaDB, Supabase, Groq) are present as stubs; they indicate intent but not full implementations.
- Some subsystems expose only status endpoints; feature depth for those is described as planned or placeholder.

---

## 1. Project Overview

### Project name
- EDITH 2.0 (Exceptional Digital Intelligence for Task Handling)

### Problem statement
- Teams often need multiple specialized AI tools (chat, planning, code, files, vision, security) that are siloed, hard to integrate, and inconsistent in UX.
- The project aims to consolidate those capabilities into one coherent system with modular departments.

### Objective and goals
- Provide a multi-department AI assistant with a unified interface and consistent data flow.
- Enable streaming responses for a responsive UX.
- Integrate external AI model providers for specialized tasks.
- Keep architecture modular so new systems can be added with minimal refactor.

### Real-world use case
- A technical team uses EDITH 2.0 as a single console to:
  - Ask complex questions and receive streamed responses.
  - Analyze images or diagrams using a vision model.
  - Perform document Q/A across PDFs and text files.
  - Access specialized modes (planning, security, satellite) when needed.

---

## 2. Beginner-Level Explanation (ELI5)

EDITH 2.0 is like a control room with 15 expert helpers. You type a question, and the system decides which helper is best suited. If you upload a document or image, EDITH sends it to the right expert and gives you the answer back quickly.

Analogies:
- Think of EDITH as a library with multiple librarians:
  - One reads documents for you.
  - One looks at pictures and explains them.
  - One helps you plan tasks.
  - One is a security specialist.
- You just ask once, and the system routes it to the right expert.

---

## 3. System Architecture

### High-level architecture diagram explanation (textual)
- Client UI (Next.js) communicates with a FastAPI backend.
- The backend routes requests to department-specific endpoints.
- For AI outputs, the backend calls external AI APIs (NVIDIA, Groq).
- The system streams responses to the UI for near real-time updates.

### Components and their roles
- Frontend (Next.js + React): UI, chat view, department selection, file and image upload.
- Backend (FastAPI): API routing, streaming responses, file handling, vision analysis.
- External AI Providers:
  - NVIDIA API for multimodal and LLM tasks.
  - Groq API for document Q/A (used in files module).
- Optional Data Services (stubs): Redis, ChromaDB, Supabase.
- WebSocket layer: basic echo server for real-time messaging (currently minimal).

### Data flow between components
1. User sends a message in the UI.
2. UI calls `/api/edith/chat` to stream a response.
3. Backend builds a prompt based on the selected department.
4. Backend calls NVIDIA AI API and streams tokens back to the client.
5. UI appends tokens to the live message bubble.

For file analysis:
1. User uploads files.
2. UI sends files to `/api/files/qa`.
3. Backend extracts text, chunks it, queries Groq for partial answers, then synthesizes a final answer.

For vision:
1. User uploads images.
2. UI sends images to `/api/vision/analyze`.
3. Backend encodes the image, calls the NVIDIA vision model, returns results.

---

## 4. Technology Stack

### Frontend
- Next.js 15, React 19, TypeScript
- Zustand for state management (chat store)
- Tailwind CSS and Radix UI components for UI
- Framer Motion for animations

Why chosen (assumptions based on common practice):
- Next.js provides SSR/CSR flexibility and easy routing.
- React + TypeScript supports fast UI iteration with type safety.
- Zustand is lightweight and simple for app state.

### Backend
- FastAPI for REST and streaming endpoints
- Uvicorn as ASGI server
- Pydantic for request validation
- WebSockets for real-time communication

Why chosen (assumptions):
- FastAPI supports async streaming and file uploads out of the box.
- Pydantic provides strong data validation.

### External APIs
- NVIDIA API (LLM and vision)
- Groq API (document Q/A)
- Tavily (search) present in dependencies (usage not shown)

### Data / Storage (stubs)
- Redis, ChromaDB, Supabase clients exist but are stubbed

### Tooling and libraries (backend)
- pypdf for PDF parsing
- aiohttp and requests for external calls

---

## 5. Core Features

### Implemented
- Multi-department AI chat with streaming responses.
- Vision analysis for images (upload and prompt).
- File Q/A with chunking and synthesis.
- Backend health and subsystem status checks.
- WebSocket echo endpoint.

### Planned or placeholder (based on status-only endpoints)
- Code, memory, voice, ML, IoT, security, daily ops, hacker, satellite modules.

### User flow and interaction
1. Select a department.
2. Send a message or upload files/images.
3. Receive streaming responses with context.
4. Review summarized outputs in chat.

---

## 6. Algorithms and Logic

### A) Streaming response assembly (department chat)
- Builds a system prompt, appends recent history (last 10 messages), streams tokens to client.

Pseudocode:
```
messages = [system_prompt]
for msg in history[-10:]:
    messages.append(msg)
messages.append(user_message)
stream = nvidia.chat.completions.create(stream=true)
for token in stream:
    yield token to client
```
Time complexity: $O(n)$ for history length (n = messages in history window).
Space complexity: $O(n)$ for message construction.

### B) File Q/A chunking and synthesis
- Extracts text from file, splits into overlapping chunks, asks model for partial answers, then synthesizes.

Pseudocode:
```
chunks = chunk(text, size=8000, overlap=400)
partials = []
for chunk in chunks[:12]:
    partials.append(ask_model(question, chunk))
final = synthesize(partials)
```
Time complexity: $O(n)$ for text length n, plus model calls.
Space complexity: $O(n)$ for storing chunks.

### C) Vision analysis
- Base64 encodes images and calls NVIDIA vision model.

Pseudocode:
```
image_b64 = base64(image_bytes)
payload = {text_prompt, image_url: data_uri}
response = nvidia.chat.completions.create(payload)
return response
```
Time complexity: $O(n)$ for image size n.
Space complexity: $O(n)$ for encoded image.

### D) Chat store state management
- Zustand store tracks messages per department; updates and appends on streaming.

Pseudocode:
```
addMessage(dept, msg):
    state.messages[dept].append(msg)
appendToMessage(dept, id, delta):
    msg.content += delta
```
Time complexity: $O(m)$ to find and update message in a department list of size m.
Space complexity: $O(m)$.

---

## 7. Models Used (AI/ML)

### Model names and types
- NVIDIA (LLM and multimodal):
  - meta/llama-3.3-70b-instruct (general chat)
  - meta/llama-4-scout-17b-16e-instruct (vision lens persona)
  - meta/llama-3.2-90b-vision-instruct (vision analysis service)
- DeepSeek distill models for planning/security grid modes
- Mistral models for files, IoT, daily ops (as configured in department list)

### Training process (not in repo)
- No training pipeline is present. These are external pretrained models served via NVIDIA or other APIs.

### Dataset used
- Not specified in the repository; assumed to be the original training datasets used by model providers.

### Evaluation metrics
- Not specified in the repository.

### Why these models were selected (assumptions)
- Large LLMs are used for general reasoning and dialog.
- Specialized models are used for planning or smaller tasks to reduce cost and latency.
- Vision-specific model is used for multimodal image analysis.

---

## 8. Code-Level Explanation

### Folder structure (top-level)
- backend/: FastAPI server, routers, services, config
- frontend/: Next.js UI application
- systems/: system descriptors (mostly placeholders)
- types/: shared TypeScript types
- lib/: utilities (encryption, rate limiting stubs)
- config/: frontend config files

### Key files and their roles
- backend/main.py: FastAPI app with all routers, health, WebSocket.
- backend/routers/edith.py: streaming chat endpoint with department model routing.
- backend/routers/files.py: file upload Q/A, chunking, Groq inference.
- backend/routers/vision.py: image analysis with NVIDIA vision model.
- backend/services/nvidia.py: NVIDIA API client (text and vision).
- frontend/src/lib/api.ts: API client for frontend.
- frontend/src/store/chatStore.ts: Zustand chat store and persistence.

### Important functions and classes
- stream_response (edith.py): builds prompt and streams responses.
- qa (files.py): chunking + Groq Q/A + synthesis.
- analyze (vision.py): image handling and vision model call.
- NvidiaClient (nvidia.py): unified NVIDIA API client.
- useChatStore (chatStore.ts): manages per-department chat state.

### API structure and endpoints (selected)
- GET /health
- WebSocket /ws/{session_id}
- POST /api/edith/chat (streaming)
- POST /api/files/qa
- POST /api/vision/analyze
- POST /api/vision/analyze-stream
- POST /api/vision/chat
- GET /api/*/status (for each department)

---

## 9. Implementation Details

### Step-by-step working process
1. User selects department in UI.
2. User sends message or uploads file/image.
3. Frontend calls appropriate backend API:
   - /api/edith/chat for general chat
   - /api/files/qa for document Q/A
   - /api/vision/analyze for image analysis
4. Backend processes request, calls external model APIs.
5. Streamed or final response is returned.
6. Frontend updates chat store and UI.

### Module interaction
- Frontend uses api.ts to call backend endpoints.
- Backend routers use services (NVIDIA, Groq) to generate outputs.
- Config provides environment keys and base URLs.
- Chat store handles streamed token append and persistence.

---

## 10. Challenges and Solutions (Assumptions)

- Challenge: Managing long document input sizes.
  - Solution: Chunking with overlap, truncation, and max chunk limits.

- Challenge: Real-time UX for AI responses.
  - Solution: Server-sent events and token streaming.

- Challenge: Multiple department behaviors.
  - Solution: Centralized department configuration with model and persona mapping.

---

## 11. Optimization and Performance

### Implemented
- History window limited to last 10 messages.
- Chunk size limits for file Q/A.
- Max chunk count to cap model calls.
- Streaming to reduce perceived latency.

### Scalability considerations (assumptions)
- Move from stubbed Redis/ChromaDB to full implementations for caching and memory.
- Add rate limiting (currently stubbed) for API abuse protection.
- Add background queues for long-running tasks.

---

## 12. Security Considerations

### Data protection
- API keys are loaded from environment variables.
- Encryption utilities exist as stubs (not yet implemented).

### Authentication and authorization
- No explicit auth is enforced in backend routes (risk area).
- Specialized modes (hacker/satellite) have token checks in core security.

### Vulnerabilities handled
- CORS is permissive (allow all origins) which is convenient for development but risky for production.
- File uploads are processed in-memory without storage, reducing persistence risk.

---

## 13. Testing and Validation

### Testing methods found
- No automated test suite in the repository.
- Manual endpoints are available for status checks.

### Validation tools
- Diagnostic scripts exist for vision integration.
- Health endpoint `/health` returns system status.

### Suggested tests (assumptions)
- Unit tests for chunking and synthesis logic.
- Integration tests for /api/edith/chat and /api/vision/analyze.
- Load tests for streaming endpoints.

---

## 14. Future Scope

Possible improvements (assumptions based on architecture):
- Implement Redis caching and ChromaDB memory retrieval.
- Add authentication (JWT or session-based).
- Add audit logging and rate limiting.
- Expand system modules beyond status endpoints.
- Add observability (metrics and tracing).
- Implement multi-tenant routing for enterprise use.

---

## 15. Conclusion

EDITH 2.0 is a modular, multi-department AI assistant system built on a modern web stack. It combines a rich frontend interface with a FastAPI backend that routes requests to specialized AI models and supports streaming responses. Core features like file Q/A and vision analysis are implemented, while several modules are structured for expansion. With additional security hardening and storage integrations, the architecture is ready for advanced, production-grade use cases.
