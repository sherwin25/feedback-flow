"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function FeedbackForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      
      setContent("");
      onSubmitted();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-10">
      <textarea
        className="w-full p-4 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none bg-white text-slate-800"
        rows={3}
        placeholder="Tell us what you think..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />
      
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
          Error: {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content}
          className="px-5 py-2.5 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Analyzing..." : "Send Feedback"}
        </button>
      </div>
    </form>
  )
}
