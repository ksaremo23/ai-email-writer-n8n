# AI Email Writer - n8n Integration

A full-stack AI-powered email generation application built with Next.js (React + TypeScript) and n8n automation workflow. This application generates three versions of emails (short, conversational, professional) using AI via Groq API through n8n.

## 🎯 Project Overview

This project demonstrates a complete integration between a modern React frontend and an n8n automation backend:

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS v4
- **Backend Automation**: n8n workflow with Groq AI integration
- **AI Model**: Groq API for email generation
- **Architecture**: Frontend → n8n Webhook → Groq API → Response

## 🏗️ Architecture

```
┌─────────────────┐
│  Next.js App    │
│  (Frontend)     │
│                 │
│  User fills     │
│  form fields    │
└────────┬────────┘
         │
         │ POST Request
         │ (emailType, context, tone, details)
         ▼
┌─────────────────┐
│  n8n Webhook    │
│  (Trigger)      │
└────────┬────────┘
         │
         │ Process & Split
         ▼
┌─────────────────┐
│  HTTP Request   │
│  → Groq API     │
│  (3 prompts)    │
└────────┬────────┘
         │
         │ AI Generated Emails
         ▼
┌─────────────────┐
│  Respond to     │
│  Webhook        │
│  (JSON response)│
└────────┬────────┘
         │
         │ { short, conversational, professional }
         ▼
┌─────────────────┐
│  Frontend       │
│  Displays       │
│  Results        │
└─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- n8n account (cloud or self-hosted)
- Groq API key

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ksaremo23/ai-email-writer-n8n.git
   cd ai-email-writer-n8n
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### n8n Workflow Setup

The frontend expects an n8n workflow to be set up. See [N8N_WORKFLOW.md](./N8N_WORKFLOW.md) for detailed instructions on creating the workflow.

**Quick Setup Steps:**

1. Create a new workflow in n8n
2. Add a **Webhook** node (trigger) - this will generate your webhook URL
3. Add **HTTP Request** nodes to call Groq API (3 requests for 3 email versions)
4. Add a **Respond to Webhook** node to return the results
5. Activate the workflow
6. Copy the webhook URL and update it in `app/page.tsx` (currently hardcoded)

**Current Webhook URL:**
```
https://ksaremo23.app.n8n.cloud/webhook-test/ai-email-writer-n8n
```

## 📋 How It Works

### Frontend Flow

1. User fills in the form:
   - **Email Type**: Follow-up, Inquiry, Resignation, or Marketing
   - **Context**: Main details/content of the email
   - **Tone**: Friendly, Professional, or Casual
   - **Additional Details**: Optional extra information

2. On "Generate Emails" click:
   - Frontend sends POST request to n8n webhook with form data
   - Shows loading state

3. Receives response:
   - n8n returns JSON with three email versions
   - Frontend displays all three versions
   - Each version has a "Copy" button

### n8n Workflow Flow

See [N8N_WORKFLOW.md](./N8N_WORKFLOW.md) for complete workflow details.

**Expected Request Format:**
```json
{
  "emailType": "Follow-up",
  "context": "Following up on our meeting yesterday",
  "tone": "Professional",
  "details": "Need to discuss project timeline"
}
```

**Expected Response Format:**
```json
{
  "short": "Brief email version...",
  "conversational": "Conversational email version...",
  "professional": "Professional email version..."
}
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS v4**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

### Backend Automation
- **n8n**: Workflow automation platform
- **Groq API**: AI model for email generation

## 📁 Project Structure

```
ai-email-writer-n8n/
├── app/
│   ├── page.tsx          # Main email writer component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles with Tailwind
├── public/               # Static assets
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.*     # Tailwind configuration (v4)
├── postcss.config.mjs    # PostCSS configuration
├── README.md             # This file
└── N8N_WORKFLOW.md       # n8n workflow documentation
```

## 🔧 Configuration

### Webhook URL

The webhook URL is currently hardcoded in `app/page.tsx`:

```typescript
const WEBHOOK_URL = "https://ksaremo23.app.n8n.cloud/webhook-test/ai-email-writer-n8n";
```

To change it:
1. Update the `WEBHOOK_URL` constant in `app/page.tsx`
2. Or use environment variables (recommended for production)

### Environment Variables (Optional)

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-webhook-url.com/webhook
```

Then update `app/page.tsx`:
```typescript
const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "default-url";
```

## 🚢 Deployment

### Frontend Deployment

**Vercel (Recommended)**
1. Push your code to GitHub
2. Import project in Vercel
3. Deploy automatically

**Other Platforms**
- Netlify
- AWS Amplify
- Railway
- Any Node.js hosting platform

### n8n Deployment

- **n8n Cloud**: Already hosted (current setup)
- **Self-hosted**: Deploy n8n on your own server
- **Docker**: Use n8n Docker image

## 📝 API Integration Details

### Request to n8n Webhook

**Endpoint:** `POST https://ksaremo23.app.n8n.cloud/webhook-test/ai-email-writer-n8n`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "emailType": "string",
  "context": "string",
  "tone": "string",
  "details": "string" (optional)
}
```

**Response:**
```json
{
  "short": "string",
  "conversational": "string",
  "professional": "string"
}
```

## 🐛 Troubleshooting

### Frontend Issues

**Error: "Error generating emails. Check console."**
- Check browser console for detailed error
- Verify webhook URL is correct and accessible
- Ensure n8n workflow is activated
- Check CORS settings if deployed

**No response from n8n**
- Verify webhook URL is correct
- Check n8n workflow execution logs
- Ensure workflow is activated

### n8n Workflow Issues

- See [N8N_WORKFLOW.md](./N8N_WORKFLOW.md) for workflow troubleshooting
- Check n8n execution logs
- Verify Groq API credentials
- Ensure all nodes are properly configured

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

This is a portfolio project. Feel free to fork and modify for your own use.

## 📄 License

This project is open source and available for portfolio use.

## 🔗 Links

- **GitHub Repository**: https://github.com/ksaremo23/ai-email-writer-n8n
- **n8n Webhook**: https://ksaremo23.app.n8n.cloud/webhook-test/ai-email-writer-n8n

---

**Note**: This project requires both the frontend (Next.js) and backend (n8n workflow) to be set up and running for full functionality. The frontend alone will not generate emails without the n8n workflow configured.
