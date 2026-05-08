# EDITH 2.0 - API Reference & Usage Guide

## API Endpoints

### Base URL
```
http://localhost:8000
```

### 1. Get Orchestrator Status

**Endpoint**: `GET /api/orchestrator/status`

**Description**: Check system health and model availability

**Response**:
```json
{
  "status": "healthy",
  "active_system": "core",
  "models": {
    "primary": "nvidia",
    "nvidia": true,
    "groq": true,
    "available_systems": 11
  },
  "language_support": ["english", "hinglish", "hindi"],
  "conversation_turns": 0
}
```

---

### 2. Process User Input

**Endpoint**: `POST /api/orchestrator/think`

**Description**: Send a user query and get a response

**Request Body**:
```json
{
  "input": "YouTube kholo",
  "session_id": "user_123",
  "language": "auto"
}
```

**Parameters**:
- `input` (string, required): User query/command
- `session_id` (string, optional): Session identifier for context
- `language` (string, optional): Force language - "english", "hindi", "hinglish", "auto"

**Response**:
```json
{
  "reply": "Opening YouTube for you...",
  "language": "hinglish",
  "system": "os_control",
  "tools_executed": ["open_url"],
  "model_provider": "nvidia",
  "model_name": "deepseek-ai/deepseek-v4-pro",
  "execution_time_ms": 245
}
```

---

### 3. Streaming Response

**Endpoint**: `GET /api/orchestrator/stream`

**Description**: Get real-time streaming responses

**Query Parameters**:
- `input`: User query
- `session_id`: Session identifier
- `language`: Language preference

**Response**: Server-Sent Events (SSE) stream

**Example**:
```bash
curl "http://localhost:8000/api/orchestrator/stream?input=write+python+function&session_id=user_123"
```

**Stream Output**:
```
data: {"token":"def"}
data: {"token":" "}
data: {"token":"hello"}
...
```

---

### 4. Get Conversation History

**Endpoint**: `GET /api/orchestrator/history`

**Description**: Retrieve conversation history for a session

**Query Parameters**:
- `session_id`: Session identifier
- `limit`: Maximum number of messages (default: 10)

**Response**:
```json
{
  "session_id": "user_123",
  "messages": [
    {
      "role": "user",
      "content": "YouTube kholo",
      "language": "hinglish",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Opening YouTube for you...",
      "language": "hinglish",
      "timestamp": "2024-01-15T10:30:01Z"
    }
  ],
  "total_turns": 2
}
```

---

### 5. Clear Session

**Endpoint**: `POST /api/orchestrator/clear`

**Description**: Clear conversation history for a session

**Request Body**:
```json
{
  "session_id": "user_123"
}
```

**Response**:
```json
{
  "status": "cleared",
  "session_id": "user_123"
}
```

---

### 6. Set Language Preference

**Endpoint**: `POST /api/orchestrator/set-language`

**Description**: Set language for a session

**Request Body**:
```json
{
  "session_id": "user_123",
  "language": "hindi"
}
```

**Response**:
```json
{
  "status": "set",
  "language": "hindi",
  "session_id": "user_123"
}
```

---

## cURL Examples

### Example 1: Simple Query
```bash
curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{
    "input": "What time is it?",
    "session_id": "demo_session"
  }'
```

### Example 2: Hinglish Command
```bash
curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{
    "input": "YouTube kholo bhai",
    "session_id": "demo_session",
    "language": "hinglish"
  }'
```

### Example 3: Code Generation
```bash
curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Write a Python function to calculate factorial",
    "session_id": "demo_session"
  }'
```

### Example 4: Stream Response
```bash
curl -N http://localhost:8000/api/orchestrator/stream?input=tell+me+about+AI&session_id=demo_session
```

### Example 5: Get Status
```bash
curl http://localhost:8000/api/orchestrator/status
```

---

## Python Client Example

```python
import requests
import json

BASE_URL = "http://localhost:8000"
SESSION_ID = "user_123"

# Function 1: Simple query
def ask_edith(question):
    response = requests.post(
        f"{BASE_URL}/api/orchestrator/think",
        json={
            "input": question,
            "session_id": SESSION_ID
        }
    )
    return response.json()

# Function 2: Streaming response
def ask_edith_stream(question):
    response = requests.get(
        f"{BASE_URL}/api/orchestrator/stream",
        params={
            "input": question,
            "session_id": SESSION_ID
        },
        stream=True
    )
    for line in response.iter_lines():
        if line:
            data = json.loads(line.decode('utf-8').replace('data: ', ''))
            yield data.get('token', '')

# Function 3: Get history
def get_history():
    response = requests.get(
        f"{BASE_URL}/api/orchestrator/history",
        params={"session_id": SESSION_ID}
    )
    return response.json()

# Usage
if __name__ == "__main__":
    # Simple query
    result = ask_edith("YouTube kholo")
    print("Reply:", result['reply'])
    print("Language:", result['language'])
    print("System:", result['system'])
    
    # Streaming
    print("\nStreaming response:")
    for token in ask_edith_stream("Tell me about AI"):
        print(token, end='', flush=True)
    
    # Get history
    history = get_history()
    print(f"\nTotal conversation turns: {history['total_turns']}")
```

---

## JavaScript/TypeScript Client Example

```typescript
// Function 1: Send query
async function askEdith(question: string): Promise<any> {
  const response = await fetch('http://localhost:8000/api/orchestrator/think', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: question,
      session_id: 'user_123'
    })
  });
  return response.json();
}

// Function 2: Streaming response
async function* streamEdith(question: string): AsyncGenerator<string> {
  const response = await fetch(
    `http://localhost:8000/api/orchestrator/stream?input=${encodeURIComponent(question)}&session_id=user_123`
  );
  
  const reader = response.body?.getReader();
  if (!reader) return;
  
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = JSON.parse(line.slice(6));
        yield json.token;
      }
    }
  }
}

// Function 3: Get status
async function getStatus(): Promise<any> {
  const response = await fetch('http://localhost:8000/api/orchestrator/status');
  return response.json();
}

// Usage
(async () => {
  // Check status
  const status = await getStatus();
  console.log('System Status:', status);
  
  // Ask question
  const result = await askEdith('YouTube kholo');
  console.log('Reply:', result.reply);
  console.log('Language:', result.language);
  
  // Streaming
  console.log('Streaming:');
  for await (const token of streamEdith('Tell me about AI')) {
    process.stdout.write(token);
  }
})();
```

---

## Command Examples by Language

### English
```bash
curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{"input": "Open YouTube", "session_id": "demo"}'

curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{"input": "Search for AI news", "session_id": "demo"}'

curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{"input": "Write a Python function", "session_id": "demo"}'
```

### Hindi
```bash
curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{"input": "यूट्यूब खोलो", "session_id": "demo"}'

curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{"input": "AI की खबर खोजो", "session_id": "demo"}'
```

### Hinglish
```bash
curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{"input": "YouTube kholo bhai", "session_id": "demo"}'

curl -X POST http://localhost:8000/api/orchestrator/think \
  -H "Content-Type: application/json" \
  -d '{"input": "AI ke baare mein search karo", "session_id": "demo"}'
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Endpoint not found |
| 500 | Server error |
| 503 | Service unavailable (models not responding) |

---

## Error Handling

**Example Error Response**:
```json
{
  "error": "Model not responding",
  "code": "MODEL_UNAVAILABLE",
  "retry_in_seconds": 5,
  "fallback_available": true
}
```

**Common Errors**:
- `MODEL_UNAVAILABLE`: Both primary and fallback models are down
- `INVALID_SESSION`: Session ID format incorrect
- `LANGUAGE_NOT_SUPPORTED`: Language not in supported list
- `RATE_LIMITED`: Too many requests

---

## Performance Metrics

**Expected Response Times**:
- Simple query: 200-500ms
- Code generation: 1-3 seconds
- Vision analysis: 2-5 seconds
- Streaming (first token): 100-300ms

**Throughput**:
- Concurrent requests: 10-50 (depends on model)
- Requests per second: 5-20

---

## Best Practices

1. **Session Management**
   - Use consistent session_id for context
   - Clear old sessions to free memory
   - Save important conversations

2. **Language Handling**
   - Let system auto-detect when possible
   - For voice input, specify language explicitly
   - Hindi text should use UTF-8 encoding

3. **Error Recovery**
   - Implement retry logic with exponential backoff
   - Check model status before critical queries
   - Use streaming for long responses

4. **Performance**
   - Use session_id for conversation continuity
   - Batch requests when possible
   - Enable HTTP/2 for better performance

---

## Troubleshooting

### Issue: Connection Refused
```
Error: Cannot connect to http://localhost:8000
```
**Solution**: Ensure backend is running
```bash
cd artifacts/jarvis-api
python main.py
```

### Issue: Model Timeout
```
Error: Model response timeout after 30s
```
**Solution**: Try fallback model or simpler query
```json
{"input": "Hello", "session_id": "test"}
```

### Issue: Language Not Detected
```
Response: "language": "english" (but expected Hindi)
```
**Solution**: Explicitly set language
```json
{"input": "query", "language": "hindi", "session_id": "test"}
```

---

## Additional Resources

- **Documentation**: [EDITH_2.0_ADVANCED_UPGRADE.md](EDITH_2.0_ADVANCED_UPGRADE.md)
- **Test Suite**: [test_edith_upgrade.py](test_edith_upgrade.py)
- **Source Code**: [agents/agentic_core.py](artifacts/jarvis-api/agents/agentic_core.py)
- **Model Router**: [agents/model_router.py](artifacts/jarvis-api/agents/model_router.py)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test suite: `python3 test_edith_upgrade.py`
3. Check logs: `artifacts/jarvis-api/logs/`
