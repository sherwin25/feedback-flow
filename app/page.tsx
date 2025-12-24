"use client";
import { useState } from "react";
import { FeedbackForm } from "@/app/components/FeedbackForm";
import { FeedbackList } from "@/app/components/FeedbackList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen py-20 px-6 bg-slate-50">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Feedback Flow</h1>
          <p className="text-slate-500 text-lg">Share your thoughts—our AI organizes them.</p>
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
