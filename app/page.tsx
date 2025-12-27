"use client";
import { useState } from "react";
import { FeedbackForm } from "@/app/components/FeedbackForm";
import { FeedbackList } from "@/app/components/FeedbackList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen py-24 px-6 bg-slate-50">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Feedback Flow</h1>
            <p className="text-slate-500 text-lg">Share your thoughts—our AI organizes them.</p>
          </div>
          
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-left space-y-4">
            <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>✨ How it works</span>
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                This is a <strong>Smart Feedback Board</strong> powered by AI. Instead of just saving text, the backend uses an AI Agent to process every submission in real-time:
                </p>
                <ul className="grid sm:grid-cols-3 gap-2 pt-2">
                    <li className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium border border-blue-100 text-center">
                        🏷️ Auto-Categorization
                    </li>
                    <li className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium border border-purple-100 text-center">
                        🧠 Sentiment Analysis
                    </li>
                    <li className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-medium border border-red-100 text-center">
                        🛡️ Toxic Content Filter
                    </li>
                </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Built With</p>
                <div className="flex flex-wrap gap-2">
                {["Next.js 15", "Vercel Postgres", "OpenAI API", "Tailwind CSS", "TypeScript"].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    {tech}
                    </span>
                ))}
                </div>
            </div>
          </div>
        </header>

        <div className="max-w-xl mx-auto">
          <FeedbackForm onSubmitted={() => setRefreshKey(k => k + 1)} />
        </div>

        <div className="border-t border-slate-200/60 pt-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Recent Feedback</h2>
          <FeedbackList refreshKey={refreshKey} />
        </div>
      </div>
    </main>
  );
}
