"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, ChevronUp, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { useTriageStore } from "@/store/triageStore";

const SUGGESTED_PROMPTS = [
  "What are the key hazards I should be most concerned about?",
  "Draft a broker response requesting the missing information",
  "What comparable risks or loss scenarios should I consider?",
  "What specific exclusions or conditions should I apply?",
];

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const chatMessages = useTriageStore((s) => s.chatMessages);
  const chatLoading = useTriageStore((s) => s.chatLoading);
  const sendChatMessage = useTriageStore((s) => s.sendChatMessage);
  const fullResult = useTriageStore((s) => s.fullResult);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim() || chatLoading) return;
    sendChatMessage(input.trim());
    setInput("");
  };

  if (!fullResult) return null;

  return (
    <div className="border-t border-ml-navy/5 bg-white">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-3 hover:bg-ml-cream/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <MessageSquare className="h-4 w-4 text-ml-gold" />
          <span className="text-sm font-medium text-ml-navy">
            Ask Follow-Up Questions
          </span>
          {chatMessages.length > 0 && (
            <span className="rounded-full bg-ml-navy/5 px-2 py-0.5 text-[10px] font-medium text-ml-navy/40">
              {chatMessages.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-ml-navy/30" />
        ) : (
          <ChevronUp className="h-4 w-4 text-ml-navy/30" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-ml-navy/5">
          <div className="flex h-[360px] flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
              {chatMessages.length === 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-ml-navy/30 font-medium tracking-wide uppercase">
                    <Sparkles className="h-3.5 w-3.5 text-ml-gold" />
                    Suggested questions
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendChatMessage(prompt)}
                        className="ml-card rounded-lg bg-ml-cream/50 p-3.5 text-left text-sm text-ml-navy/60 hover:bg-ml-cream hover:text-ml-navy transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-ml-navy text-white"
                            : "bg-ml-cream text-ml-navy/70 border border-ml-navy/5"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-sm text-ml-navy/30">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-ml-navy/5 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about this submission..."
                  className="flex-1 rounded-lg border border-ml-navy/10 bg-ml-cream/50 px-4 py-2.5 text-sm text-ml-navy placeholder:text-ml-navy/25 focus:border-ml-gold focus:outline-none focus:ring-1 focus:ring-ml-gold/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || chatLoading}
                  className="rounded-lg bg-ml-navy px-4 py-2.5 text-white hover:bg-ml-navy-light disabled:opacity-30 transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
