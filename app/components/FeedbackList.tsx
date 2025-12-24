"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Bug, Lightbulb, MessageSquare, Trash2 } from "lucide-react";

type Feedback = {
  id: number;
  content: string;
  category: string;
  sentiment: string;
  status: string;
  created_at: string;
};

export function FeedbackList({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminPass, setAdminPass] = useState("");

  const isAdmin = !!adminPass;

  useEffect(() => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => {
        if (data.data) setItems(data.data);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function handleAdminLogin() {
    const code = prompt("Enter Admin Passcode:");
    if (code === "winiscool") {
        setAdminPass(code);
    } else if (code) {
        alert("Wrong passcode!");
    }
  }

  async function handleDelete(id: number) {
    if (!isAdmin) return;

    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const res = await fetch('/api/feedback', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, passcode: adminPass }),
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting feedback");
    }
  }

  if (loading && items.length === 0) return <div className="text-center text-slate-400 py-10">Loading feedback...</div>;

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            {!isAdmin ? (
                <button 
                    onClick={handleAdminLogin}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                    Admin Login
                </button>
            ) : (
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                        Admin Mode Active
                    </span>
                    <button 
                        onClick={() => setAdminPass("")}
                        className="text-xs text-slate-400 hover:text-red-500 underline"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
            {items.map((item) => (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className={cn(
                "p-5 rounded-2xl border bg-white shadow-sm flex flex-col gap-3 transition-colors",
                item.sentiment === 'positive' && "border-green-100 bg-green-50/30",
                item.sentiment === 'negative' && "border-red-100 bg-red-50/30"
                )}
            >
                <div className="flex justify-between items-start">
                <span className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5",
                    item.category === 'bug' ? "bg-red-100 text-red-700" :
                    item.category === 'feature' ? "bg-purple-100 text-purple-700" :
                    "bg-slate-100 text-slate-700"
                )}>
                    {item.category === 'bug' && <Bug size={12} />}
                    {item.category === 'feature' && <Lightbulb size={12} />}
                    {item.category === 'other' && <MessageSquare size={12} />}
                    {item.category}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    {isAdmin && (
                        <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Delete"
                        >
                        <Trash2 size={14} />
                        </button>
                    )}
                </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{item.content}</p>
            </motion.div>
            ))}
        </AnimatePresence>
        </div>
    </div>
  );
}
