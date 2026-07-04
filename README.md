# ShopEase AI Customer Support Agent

An AI-powered customer support agent service built with Node.js and Express. It uses LLM providers (Gemini/OpenAI) and tool-calling to resolve customer queries (check order status, check refund eligibility, search knowledge base, and escalate to human agents).

## How to Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env
   ```
   Provide either your `GEMINI_API_KEY` or `OPENAI_API_KEY`.
3. **Start the Server**:
   - For development (with hot reload):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     node src/server.js
     ```

## Testing the API

1. Start the Server

First, run the server locally:
```bash
npm run dev
```
You should see: `ShopEase Support Service listening on http://localhost:3000`

2. Test with Postman

Test the postman collection here: https://saryan182003-9278989.postman.co/workspace/Aryan-Shri's-Workspace~e261c8c3-3aec-4613-8a96-275b3708d045/collection/48559093-76b05126-b7c7-49a2-bf6b-87a9716cab69?action=share&source=copy-link&creator=48559093

### 3. Test with curl (Alternative)

```bash
# Create a session
curl -X POST http://localhost:3000/api/sessions

# Send a message (replace SESSION_ID)
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Where is my order ORD-1001?"}'

# Get chat history
curl http://localhost:3000/api/sessions/SESSION_ID/chat

# Health check
curl http://localhost:3000/health
```

## Error Handling

| Scenario | Status Code | Example Response |
|----------|-------------|------------------|
| Empty or missing message | 400 | `{"success": false, "error": "Request body must include a non-empty \"message\" string."}` |
| Session ID not found | 404 | `{"success": false, "error": "Session not found"}` |
| Agent timeout (>30 seconds) | 504 | `{"success": false, "error": "Agent response timed out."}` |
| LLM API unreachable | 503 | `{"success": false, "error": "I'm having trouble right now. Please try again."}` |

## Architecture

The project is structured following clean coding principles:
- **Routes (`src/routes/api.js`)**: Defines the HTTP API endpoints.
- **Controllers (`src/controllers/`)**: Handles HTTP request parsing, input validation, execution orchestration, and formats JSON responses.
- **Agent Loop (`src/agent/agent.js`)**: Coordinates the multi-turn agent logic, calling the LLM provider, executing tool actions, and logging/persisting intermediate steps.
- **Providers (`src/agent/providers/`)**: Abstracts model-specific formats for Gemini and OpenAI, translating unified messages/histories to specific API formats.
- **Services (`src/services/`)**: Core business logic and helper functions for each tool (FAQ search, order lookup, refund check, escalations).
- **Repositories (`src/repositories/`)**: Data access layer loading data from JSON database files in the `data/` folder.
- **Middlewares (`src/middlewares/`)**: Centralized error logging and JSON response formatting.

## API Documentation

### 1. Create Session
- **Method**: `POST`
- **Path**: `/api/sessions`
- **Request Example**:
  ```bash
  curl -X POST http://localhost:3000/api/sessions
  ```
- **Response Example**:
  ```json
  {
    "success": true,
    "sessionId": "bc4e4021-6e72-49e7-a277-90afff66a281",
    "createdAt": "2026-07-04T06:08:04.614Z"
  }
  ```

### 2. Send Message
- **Method**: `POST`
- **Path**: `/api/sessions/:sessionId/chat`
- **Request Example**:
  ```bash
  curl -X POST http://localhost:3000/api/sessions/bc4e4021-6e72-49e7-a277-90afff66a281/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "How do I check my order status?"}'
  ```
- **Response Example**:
  ```json
  {
    "success": true,
    "sessionId": "bc4e4021-6e72-49e7-a277-90afff66a281",
    "reply": "Hello! I am your ShopEase support agent. I received your message: \"How do I check my order status?\". How can I help you with your order or shipping?",
    "provider": "gemini",
    "escalations": []
  }
  ```

### 3. Get Chat History
- **Method**: `GET`
- **Path**: `/api/sessions/:sessionId/chat`
- **Request Example**:
  ```bash
  curl http://localhost:3000/api/sessions/bc4e4021-6e72-49e7-a277-90afff66a281/chat
  ```
- **Response Example**:
  ```json
  {
    "success": true,
    "sessionId": "bc4e4021-6e72-49e7-a277-90afff66a281",
    "messages": [
      {
        "role": "user",
        "content": "How do I check my order status?"
      },
      {
        "role": "assistant",
        "content": "Hello! I am your ShopEase support agent..."
      }
    ]
  }
  ```

### 4. Health Check
- **Method**: `GET`
- **Path**: `/health`
- **Request Example**:
  ```bash
  curl http://localhost:3000/health
  ```
- **Response Example**:
  ```json
  {
    "success": true,
    "status": "ok",
    "server": "up",
    "provider": "gemini",
    "llm": "reachable",
    "timestamp": "2026-07-04T06:07:51.495Z"
  }
  ```

## Design Choices & Rationale

- **Framework**: Express was chosen for its minimal layout, extensive middleware ecosystem, and simplicity in creating RESTful APIs quickly.
- **LLM Provider**: Chose Gemini/OpenAI for their robust function-calling support. Native SDKs were used directly rather than heavy frameworks like LangChain. A custom provider abstraction allows switching between them via environment variables with zero code changes.
- **Agent Loop**: Hand-crafted iterative loop keeps execution lightweight, fast, and simple to debug. The 30-second timeout prevents runaway tool calls.
- **Session Repository**: In-memory Map storage is sufficient for a prototype. Trade-off: data resets on server restart, but setup requires zero infrastructure. For production, Redis would enable stateless scaling.
- **Error Handling**: Centralized error middleware ensures consistent JSON responses across all endpoints. LLM failures return 503 with friendly messages instead of stack traces.

## What I Learned
- Implementing a multi-turn tool-calling loop using raw LLM API response streams.
- Normalizing message formatting (OpenAI vs Gemini history schemas).
- Structuring fallback actions for token limits or API issues.

## What's Incomplete or Rough
- Tool executions are currently synchronous. If a tool relies on a slow external database, it should be converted to asynchronous promises.
- Basic keyword/token-matching FAQ lookup instead of vector embeddings. Adding semantic search using a small model or database would improve query matches.

## 5-Minute Reflection
Given another day, I would implement:
1. **Semantic FAQ Search**: Using an embedding model to retrieve FAQ documents instead of substring matching.
2. **Persistent Store**: Migrating the session mapping to a Redis database to handle service scaling and stateless container instances.
3. **Comprehensive Tests**: Integrating unit and integration tests using Jest/Supertest to validate edge cases and loop limits automatically.
