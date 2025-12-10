# n8n Workflow Documentation

This document describes the n8n workflow required for the AI Email Writer application.

## 📋 Overview

The n8n workflow receives form data from the Next.js frontend, generates three email versions using Groq AI API, and returns them as a JSON response.

## 🔄 Workflow Structure

```
Webhook (Trigger)
    ↓
Set Variables / Process Input
    ↓
Split into 3 Parallel Paths
    ├─→ HTTP Request 1 (Short Email) → Groq API
    ├─→ HTTP Request 2 (Conversational Email) → Groq API
    └─→ HTTP Request 3 (Professional Email) → Groq API
    ↓
Merge Results
    ↓
Format Response
    ↓
Respond to Webhook
```

## 🛠️ Node-by-Node Setup

### 1. Webhook Node (Trigger)

**Node Type:** Webhook

**Configuration:**
- **HTTP Method:** POST
- **Path:** `/webhook-test/ai-email-writer-n8n` (or your custom path)
- **Response Mode:** "Respond to Webhook" (set to "Last Node")

**Output:**
The webhook receives the following JSON payload:
```json
{
  "emailType": "Follow-up",
  "context": "Following up on our meeting yesterday",
  "tone": "Professional",
  "details": "Need to discuss project timeline"
}
```

**Access in workflow:**
- `{{ $json.body.emailType }}`
- `{{ $json.body.context }}`
- `{{ $json.body.tone }}`
- `{{ $json.body.details }}`

---

### 2. Set Node (Optional - Process Input)

**Node Type:** Set

**Purpose:** Clean and prepare the input data

**Fields to Set:**
- `emailType`: `{{ $json.body.emailType }}`
- `context`: `{{ $json.body.context }}`
- `tone`: `{{ $json.body.tone }}`
- `details`: `{{ $json.body.details || "" }}`

---

### 3. HTTP Request Nodes (3 Parallel Requests)

You'll need **three separate HTTP Request nodes** running in parallel (or sequentially) to generate the three email versions.

#### HTTP Request 1: Short Email

**Node Type:** HTTP Request

**Configuration:**
- **Method:** POST
- **URL:** `https://api.groq.com/openai/v1/chat/completions`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_GROQ_API_KEY`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body:**
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
      "content": "Write a SHORT {{ $json.emailType }} email. Context: {{ $json.context }}. Tone: {{ $json.tone }}. Additional details: {{ $json.details }}. Keep it brief and to the point."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 200
}
```

**Output Processing:**
Extract the email text:
- `{{ $json.choices[0].message.content }}`

---

#### HTTP Request 2: Conversational Email

**Node Type:** HTTP Request

**Configuration:**
- **Method:** POST
- **URL:** `https://api.groq.com/openai/v1/chat/completions`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_GROQ_API_KEY`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body:**
```json
{
  "model": "llama-3.1-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert email writer. Generate conversational, friendly emails."
    },
    {
      "role": "user",
      "content": "Write a CONVERSATIONAL {{ $json.emailType }} email. Context: {{ $json.context }}. Tone: {{ $json.tone }}. Additional details: {{ $json.details }}. Make it friendly and engaging, like you're talking to a colleague."
    }
  ],
  "temperature": 0.8,
  "max_tokens": 400
}
```

**Output Processing:**
Extract the email text:
- `{{ $json.choices[0].message.content }}`

---

#### HTTP Request 3: Professional Email

**Node Type:** HTTP Request

**Configuration:**
- **Method:** POST
- **URL:** `https://api.groq.com/openai/v1/chat/completions`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_GROQ_API_KEY`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body:**
```json
{
  "model": "llama-3.1-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert email writer. Generate formal, professional emails."
    },
    {
      "role": "user",
      "content": "Write a PROFESSIONAL {{ $json.emailType }} email. Context: {{ $json.context }}. Tone: {{ $json.tone }}. Additional details: {{ $json.details }}. Make it formal, well-structured, and business-appropriate."
    }
  ],
  "temperature": 0.6,
  "max_tokens": 500
}
```

**Output Processing:**
Extract the email text:
- `{{ $json.choices[0].message.content }}`

---

### 4. Merge Node (Combine Results)

**Node Type:** Merge

**Mode:** "Merge By Index" or "Append"

**Purpose:** Combine the three email responses into a single object

**Alternative:** Use a "Code" node to manually combine:

```javascript
// Code Node
const items = $input.all();

return [{
  json: {
    short: items[0].json.choices[0].message.content,
    conversational: items[1].json.choices[0].message.content,
    professional: items[2].json.choices[0].message.content
  }
}];
```

---

### 5. Respond to Webhook Node

**Node Type:** Respond to Webhook

**Configuration:**
- **Response Code:** 200
- **Response Body:**
```json
{
  "short": "{{ $json.short }}",
  "conversational": "{{ $json.conversational }}",
  "professional": "{{ $json.professional }}"
}
```

**Important:** This must be the last node in the workflow.

---

## 🔑 Required Credentials

### Groq API Key

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key
3. Add it as a credential in n8n:
   - Go to Settings → Credentials
   - Add "Header Auth" credential
   - Name: `Authorization`
   - Value: `Bearer YOUR_GROQ_API_KEY`

---

## 📝 Alternative Workflow Approaches

### Option 1: Sequential Execution
Run the three HTTP requests one after another (simpler but slower).

### Option 2: Parallel Execution
Use n8n's "Split in Batches" or run nodes in parallel (faster).

### Option 3: Single Request with Multiple Prompts
Make one Groq API call with all three prompts, then parse the response.

---

## 🧪 Testing the Workflow

### Manual Test

1. Activate the workflow in n8n
2. Copy the webhook URL
3. Use a tool like Postman or curl:

```bash
curl -X POST https://ksaremo23.app.n8n.cloud/webhook-test/ai-email-writer-n8n \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "Follow-up",
    "context": "Following up on our meeting",
    "tone": "Professional",
    "details": "Need to discuss timeline"
  }'
```

**Expected Response:**
```json
{
  "short": "Brief email...",
  "conversational": "Conversational email...",
  "professional": "Professional email..."
}
```

---

## 🐛 Troubleshooting

### Issue: Webhook not receiving data
- **Check:** Webhook node is activated
- **Check:** Workflow is active
- **Check:** Correct HTTP method (POST)
- **Check:** Path matches the URL

### Issue: Groq API errors
- **Check:** API key is valid
- **Check:** API key format: `Bearer YOUR_KEY`
- **Check:** Model name is correct
- **Check:** Request body format matches Groq API spec

### Issue: Response not formatted correctly
- **Check:** "Respond to Webhook" node is last
- **Check:** Response body JSON structure matches expected format
- **Check:** All three email versions are being captured

### Issue: Timeout errors
- **Solution:** Increase timeout in HTTP Request nodes
- **Solution:** Use parallel execution instead of sequential
- **Solution:** Reduce `max_tokens` in Groq API requests

---

## 📊 Workflow Execution Flow Example

```
1. Frontend sends POST request
   ↓
2. Webhook receives: { emailType, context, tone, details }
   ↓
3. Set node processes input
   ↓
4. Three HTTP requests execute (parallel or sequential)
   - Request 1 → Groq → Short email
   - Request 2 → Groq → Conversational email
   - Request 3 → Groq → Professional email
   ↓
5. Merge/Code node combines results
   ↓
6. Respond to Webhook returns:
   {
     short: "...",
     conversational: "...",
     professional: "..."
   }
   ↓
7. Frontend receives and displays results
```

---

## 🔄 Workflow Export

To export your workflow:
1. In n8n, click the workflow name
2. Click "Download" or "Export"
3. Save as JSON file
4. You can import this JSON to recreate the workflow

**Note:** Remember to update API keys and credentials after importing.

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Groq API Documentation](https://console.groq.com/docs)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

---

**Current Webhook URL:**
```
https://ksaremo23.app.n8n.cloud/webhook-test/ai-email-writer-n8n
```

Make sure this matches your actual n8n webhook URL in the frontend code.

