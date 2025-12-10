# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                    (Next.js Frontend)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Email Writer Form                                 │     │
│  │  - Email Type (dropdown)                           │     │
│  │  - Context (textarea)                              │     │
│  │  - Tone (dropdown)                                │     │
│  │  - Additional Details (textarea, optional)         │     │
│  │  - Generate Button                                 │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS POST Request
                        │ Content-Type: application/json
                        │
                        │ {
                        │   emailType: "Follow-up",
                        │   context: "...",
                        │   tone: "Professional",
                        │   details: "..."
                        │ }
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    n8n CLOUD PLATFORM                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Webhook Node (Trigger)                            │     │
│  │  URL: /webhook-test/ai-email-writer-n8n            │     │
│  │  Method: POST                                      │     │
│  └───────────────────────┬────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Set/Process Node (Optional)                       │     │
│  │  - Extract and validate input                      │     │
│  │  - Prepare data for API calls                      │     │
│  └───────────────────────┬────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Split/Parallel Execution                          │     │
│  │  (3 parallel paths)                                │     │
│  └───────┬───────────────┬───────────────┬─────────────┘     │
│          │               │               │                   │
│          ▼               ▼               ▼                   │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │ HTTP Req  │  │ HTTP Req  │  │ HTTP Req  │               │
│  │ (Short)   │  │ (Conv.)   │  │ (Prof.)   │               │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │
│        │               │               │                     │
│        │               │               │                     │
│        └───────┬───────┴───────┬───────┘                     │
│                │               │                             │
│                ▼               ▼                             │
│        ┌───────────────────────────┐                         │
│        │  Merge/Combine Node       │                         │
│        │  - Combine 3 responses    │                         │
│        │  - Format as JSON         │                         │
│        └───────────┬───────────────┘                         │
│                    │                                         │
│                    ▼                                         │
│        ┌───────────────────────────┐                         │
│        │  Respond to Webhook        │                         │
│        │  Status: 200               │                         │
│        │  Body: {                   │                         │
│        │    short: "...",           │                         │
│        │    conversational: "...",  │                         │
│        │    professional: "..."     │                         │
│        │  }                         │                         │
│        └───────────┬───────────────┘                         │
└────────────────────┼─────────────────────────────────────────┘
                     │
                     │ HTTPS Response
                     │ Status: 200 OK
                     │ Content-Type: application/json
                     │
                     │ {
                     │   short: "...",
                     │   conversational: "...",
                     │   professional: "..."
                     │ }
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Results Display                                    │     │
│  │  - Short Email (with Copy button)                  │     │
│  │  - Conversational Email (with Copy button)          │     │
│  │  - Professional Email (with Copy button)            │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. User Input → Frontend Processing

**Location:** `app/page.tsx`

**Process:**
- User fills form fields
- React state management (`useState` hooks)
- Form validation (required fields check)
- Button click triggers `handleGenerate()`

**Code Reference:**
```typescript
const handleGenerate = async () => {
  // Validation
  if (!emailType || !context || !tone) {
    alert("Please fill all required fields!");
    return;
  }
  
  // API call
  const response = await axios.post(WEBHOOK_URL, {
    emailType,
    context,
    tone,
    details,
  });
}
```

---

### 2. Frontend → n8n Webhook

**Protocol:** HTTPS POST

**Endpoint:** `https://ksaremo23.app.n8n.cloud/webhook-test/ai-email-writer-n8n`

**Request Format:**
```json
{
  "emailType": "Follow-up",
  "context": "Following up on our meeting yesterday",
  "tone": "Professional",
  "details": "Need to discuss project timeline"
}
```

**Headers:**
```
Content-Type: application/json
```

**Implementation:**
- Uses `axios` library for HTTP requests
- Handles loading states
- Error handling with try/catch

---

### 3. n8n Workflow Processing

**Components:**
1. **Webhook Trigger** - Receives POST request
2. **Data Processing** - Extracts and validates input
3. **AI Generation** - Three parallel/serial HTTP requests to Groq API
4. **Response Formatting** - Combines results into JSON

**See:** [N8N_WORKFLOW.md](./N8N_WORKFLOW.md) for detailed node configuration

---

### 4. n8n → Groq API

**Protocol:** HTTPS POST

**Endpoint:** `https://api.groq.com/openai/v1/chat/completions`

**Authentication:** Bearer token in Authorization header

**Request Format (Example - Short Email):**
```json
{
  "model": "llama-3.1-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert email writer. Generate concise, short emails."
    },
    {
      "role": "user",
      "content": "Write a SHORT Follow-up email. Context: Following up on our meeting. Tone: Professional. Additional details: Need to discuss timeline. Keep it brief and to the point."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 200
}
```

**Response Format:**
```json
{
  "id": "...",
  "choices": [
    {
      "message": {
        "content": "Generated email text here..."
      }
    }
  ]
}
```

---

### 5. n8n → Frontend Response

**Protocol:** HTTPS Response

**Status Code:** 200 OK

**Response Format:**
```json
{
  "short": "Brief email version...",
  "conversational": "Conversational email version...",
  "professional": "Professional email version..."
}
```

---

### 6. Frontend Display

**Location:** `app/page.tsx`

**Process:**
- Receives JSON response
- Updates React state with results
- Renders three email cards
- Each card has copy-to-clipboard functionality

**Code Reference:**
```typescript
setResults(response.data);

// Display
{results.short && (
  <div>
    {["short", "conversational", "professional"].map((key) => (
      <div>
        <p>{results[key]}</p>
        <button onClick={() => handleCopy(results[key])}>
          Copy
        </button>
      </div>
    ))}
  </div>
)}
```

---

## 🔐 Security Considerations

### Frontend
- **No sensitive data exposed**: Webhook URL is hardcoded (consider env vars for production)
- **Client-side validation**: Prevents unnecessary API calls
- **Error handling**: Graceful error messages without exposing internals

### n8n
- **API Key Security**: Groq API key stored in n8n credentials (encrypted)
- **Webhook Security**: Consider adding authentication/authorization
- **Rate Limiting**: Consider implementing rate limits on webhook

### API Communication
- **HTTPS Only**: All communication over encrypted connections
- **CORS**: Configure CORS if deploying frontend separately

---

## 📊 Component Responsibilities

### Frontend (Next.js)
- ✅ User interface and form handling
- ✅ Input validation
- ✅ API communication with n8n
- ✅ Result display and user interaction
- ✅ Copy-to-clipboard functionality
- ❌ AI processing (delegated to n8n)
- ❌ Business logic (minimal, mostly UI)

### n8n Workflow
- ✅ Webhook endpoint management
- ✅ Request routing and processing
- ✅ AI API integration (Groq)
- ✅ Response formatting
- ✅ Error handling and logging
- ❌ UI/UX (handled by frontend)
- ❌ Data persistence (optional, not implemented)

### Groq API
- ✅ AI email generation
- ✅ Natural language processing
- ❌ Request validation (handled by n8n)
- ❌ Response formatting (handled by n8n)

---

## 🚀 Deployment Architecture

### Development
```
Local Machine
├── Next.js Dev Server (localhost:3000)
└── n8n Cloud (ksaremo23.app.n8n.cloud)
    └── Groq API (api.groq.com)
```

### Production (Recommended)
```
Vercel/Netlify
├── Next.js App (Static/SSR)
└── n8n Cloud (ksaremo23.app.n8n.cloud)
    └── Groq API (api.groq.com)
```

### Alternative Production
```
Self-Hosted
├── Next.js App (VPS/Cloud)
└── Self-Hosted n8n (VPS/Cloud)
    └── Groq API (api.groq.com)
```

---

## 🔄 Error Handling Flow

```
Frontend Error
    ↓
try/catch block
    ↓
console.error(err)
    ↓
alert("Error generating emails. Check console.")
    ↓
User sees error message
```

```
n8n Workflow Error
    ↓
n8n execution logs
    ↓
Error node (optional)
    ↓
Respond to Webhook with error
    ↓
Frontend receives error response
    ↓
Displays error to user
```

---

## 📈 Scalability Considerations

### Current Setup
- **Frontend**: Stateless, can scale horizontally
- **n8n**: Cloud-hosted, managed scaling
- **Groq API**: Managed service, handles scaling

### Potential Improvements
- Add caching layer (Redis) for common requests
- Implement request queuing for high traffic
- Add database for storing generated emails
- Implement rate limiting
- Add monitoring and analytics

---

## 🔍 Verification Checklist

- [x] Frontend sends POST request to n8n webhook
- [x] n8n webhook receives and processes request
- [x] n8n calls Groq API with correct prompts
- [x] Groq API returns generated emails
- [x] n8n formats and returns JSON response
- [x] Frontend receives and displays results
- [x] Copy-to-clipboard functionality works
- [x] Error handling implemented at all levels

---

**Last Updated:** 2025-01-27

