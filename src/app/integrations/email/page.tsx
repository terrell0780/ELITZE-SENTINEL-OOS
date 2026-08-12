"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function EmailPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => { brain.find("emails").then(r => { if (r.data?.length) setEmails(r.data); }); }, []);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) return;
    const from_email = "terrell0780@gmail.com";
    const email = { from: from_email, to, subject, body, date: new Date().toLocaleString(), read: false };
    await brain.sendEmail(to, subject, body, from_email);
    setEmails(prev => [email, ...prev]);
    setShowCompose(false); setTo(""); setSubject(""); setBody("");
  };

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <header className="h-16 border-b border-[#27272A] flex items-center px-6 shrink-0 bg-[#09090B]">
        <h1 className="text-lg font-semibold text-white">Email</h1>
        <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest ml-3">{emails.length} messages</span>
        <div className="flex-1" />
        <button onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-[#D92A2A] text-white text-xs font-semibold rounded-lg hover:bg-[#D92A2A]/90 transition-colors">Compose</button>
      </header>

      {showCompose ? (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-[#111113] rounded-xl border border-[#27272A] p-6">
            <h2 className="text-base font-semibold text-white mb-4">New Message</h2>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="To..."
              className="w-full bg-transparent border-b border-[#27272A] px-0 py-2.5 text-sm text-white placeholder-[#A1A1AA] outline-none focus:border-[#D92A2A] transition-colors mb-3" />
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject..."
              className="w-full bg-transparent border-b border-[#27272A] px-0 py-2.5 text-sm text-white placeholder-[#A1A1AA] outline-none focus:border-[#D92A2A] transition-colors mb-4" />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..."
              className="w-full bg-transparent text-sm text-white placeholder-[#A1A1AA] outline-none resize-none min-h-[200px] leading-relaxed" />
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#27272A]">
              <button onClick={() => setShowCompose(false)} className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSend} className="px-4 py-2 bg-[#D92A2A] text-white text-xs font-semibold rounded-lg hover:bg-[#D92A2A]/90 transition-colors">Send</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {emails.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[#A1A1AA]">No messages yet</p>
              <p className="text-xs text-[#A1A1AA] mt-2">Click Compose to send your first email</p>
            </div>
          ) : (
            <div className="divide-y divide-[#27272A]">
              {emails.map((e: any, i: number) => (
                <div key={i} className="px-6 py-4 hover:bg-[#111113] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{e.to || e.from}</span>
                    <span className="text-[10px] text-[#A1A1AA]">{e.date}</span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mb-1 font-medium">{e.subject}</p>
                  <p className="text-xs text-[#A1A1AA] truncate">{(e.body || e.preview || "").slice(0, 80)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}