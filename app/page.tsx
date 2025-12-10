"use client";

import { useState } from "react";
import axios from "axios";

interface EmailResults {
  short: string;
  conversational: string;
  professional: string;
}

export default function Home() {
  const [emailType, setEmailType] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmailResults>({
    short: "",
    conversational: "",
    professional: "",
  });

  // n8n webhook URL - receives POST requests with form data and returns generated emails
  // See N8N_WORKFLOW.md for workflow setup details
  const WEBHOOK_URL = "https://ksaremo23.app.n8n.cloud/webhook-test/ai-email-writer-n8n";

  const handleGenerate = async () => {
    if (!emailType || !context || !tone) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    setResults({ short: "", conversational: "", professional: "" });

    try {
      // Send POST request to n8n webhook with form data
      // Expected response: { short: string, conversational: string, professional: string }
      const response = await axios.post(WEBHOOK_URL, {
        emailType,
        context,
        tone,
        details,
      });

      setResults(response.data);
    } catch (err) {
      console.error(err);
      alert("Error generating emails. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">AI Email Writer</h1>

      <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block font-medium mb-1">
            Email Type <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={emailType}
            onChange={(e) => setEmailType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Resignation">Resignation</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">
            Context <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows={3}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide context/details of the email..."
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Tone <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="">Select Tone</option>
            <option value="Friendly">Friendly</option>
            <option value="Professional">Professional</option>
            <option value="Casual">Casual</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">
            Additional Details (Optional)
          </label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows={2}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Any additional information..."
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Emails"}
        </button>
      </div>

      {results.short && (
        <div className="w-full max-w-xl mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Generated Emails</h2>

          {(["short", "conversational", "professional"] as const).map((key) => (
            <div key={key} className="bg-white p-4 rounded shadow">
              <h3 className="font-medium capitalize mb-2">{key} version</h3>
              <p className="mb-2 whitespace-pre-line">{results[key]}</p>
              <button
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                onClick={() => handleCopy(results[key])}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
