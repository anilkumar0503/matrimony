"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: string;
  sender: {
    id: string;
    profile: { fullName: string } | null;
  };
}

interface MatchInfo {
  id: string;
  userA: {
    id: string;
    profile: { fullName: string; city: string } | null;
    images: { originalUrl: string; isPrimary: boolean }[];
  };
  userB: {
    id: string;
    profile: { fullName: string; city: string } | null;
    images: { originalUrl: string; isPrimary: boolean }[];
  };
}

export default function ChatPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const token = () => localStorage.getItem("accessToken");

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  };

  const fetchLatest = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingHistory(true);
      const res = await fetch(`/api/user/chat/${matchId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) {
        setMessages(json.data.messages);
        setHasMore(json.data.hasMore);
      }
      if (!silent) setLoadingHistory(false);
    },
    [matchId]
  );

  // Polling: only append truly new messages (avoid replacing whole list while user scrolls)
  const pollNew = useCallback(async () => {
    const current = messagesRef.current;
    const lastId = current[current.length - 1]?.id;
    const url = lastId
      ? `/api/user/chat/${matchId}?after=${lastId}`
      : `/api/user/chat/${matchId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success && json.data.messages.length > 0) {
      // Filter out any already-known ids
      const knownIds = new Set(current.map((m) => m.id));
      const newMsgs = json.data.messages.filter((m: ChatMessage) => !knownIds.has(m.id));
      if (newMsgs.length > 0) {
        setMessages((prev) => [...prev, ...newMsgs]);
        // Scroll only if user is near bottom
        const el = scrollAreaRef.current;
        if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
          setTimeout(() => scrollToBottom(), 50);
        }
      }
    }
  }, [matchId]);

  const loadOlderMessages = async () => {
    if (loadingMore || !hasMore) return;
    const oldestId = messages[0]?.id;
    if (!oldestId) return;

    setLoadingMore(true);
    const el = scrollAreaRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;

    try {
      const res = await fetch(`/api/user/chat/${matchId}?before=${oldestId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...json.data.messages, ...prev]);
        setHasMore(json.data.hasMore);
        // Restore scroll position so the view doesn't jump
        requestAnimationFrame(() => {
          if (el) el.scrollTop = el.scrollHeight - prevScrollHeight;
        });
      }
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const tkn = token();
    if (!tkn) return;
    const payload = JSON.parse(atob(tkn.split(".")[1]));
    setMyId(payload.sub);

    fetch("/api/user/matches", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const found = json.data.matches.find((m: MatchInfo) => m.id === matchId);
          if (found) setMatch(found);
        }
      });

    fetchLatest(false);

    // Poll every 5 seconds for new messages
    pollingRef.current = setInterval(() => pollNew(), 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [matchId, fetchLatest, pollNew]);

  useEffect(() => {
    if (!loadingHistory) scrollToBottom(false);
  }, [loadingHistory]);

  const getOther = () => {
    if (!match || !myId) return null;
    return match.userA.id === myId ? match.userB : match.userA;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");
    try {
      const res = await fetch(`/api/user/chat/${matchId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: text }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data.message]);
        setTimeout(() => scrollToBottom(), 50);
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const other = getOther();
  const otherPhoto = other?.images.find((i) => i.isPrimary) || other?.images[0];

  const groupByDate = (msgs: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    msgs.forEach((msg) => {
      const day = new Date(msg.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });
      const last = groups[groups.length - 1];
      if (last && last.date === day) {
        last.messages.push(msg);
      } else {
        groups.push({ date: day, messages: [msg] });
      }
    });
    return groups;
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-9rem)]">
      {/* Header */}
      <div className="glass p-4 flex items-center gap-3 rounded-b-none border-b border-[rgba(201,151,44,0.15)]">
        <Link href="/dashboard/chat" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[rgba(201,151,44,0.1)] shrink-0">
          {otherPhoto ? (
            <img src={otherPhoto.originalUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#f78222] font-bold">
              {other?.profile?.fullName?.[0] || <User size={16} />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {other?.profile?.fullName || "—"}
          </p>
          <p className="text-muted text-xs">{other?.profile?.city}</p>
        </div>
        {other && (
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href={`/profile/${other.id}`}>View Profile</Link>
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-1 bg-[rgba(255,255,255,0.02)]">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted text-sm">Loading messages…</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted text-sm">No messages yet</p>
              <p className="text-muted text-xs mt-1">Say hello to start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Load older messages */}
            {hasMore && (
              <div className="flex justify-center pb-2">
                <button
                  onClick={loadOlderMessages}
                  disabled={loadingMore}
                  className="text-xs text-muted hover:text-[#E8C76A] px-4 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[rgba(201,151,44,0.3)] transition-all disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load older messages"}
                </button>
              </div>
            )}
            {!hasMore && messages.length > 0 && (
              <p className="text-center text-muted text-[10px] pb-2">Beginning of conversation</p>
            )}
          {groupByDate(messages).map(({ date, messages: dayMsgs }) => (
            <div key={date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-[rgba(255,255,255,0.06)]" />
                <span className="text-muted text-[10px] px-2">{date}</span>
                <div className="flex-1 border-t border-[rgba(255,255,255,0.06)]" />
              </div>
              <div className="space-y-1">
                {dayMsgs.map((msg, i) => {
                  const isMine = msg.senderId === myId;
                  const prevMsg = dayMsgs[i - 1];
                  const isFirst = !prevMsg || prevMsg.senderId !== msg.senderId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} ${isFirst ? "mt-3" : "mt-0.5"}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? "bg-gradient-to-br from-[#C9972C] to-[#f78222] text-white rounded-br-md"
                            : "glass text-foreground rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-white/60 text-right" : "text-muted"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isMine && (
                            <span className="ml-1">{msg.isRead ? "✓✓" : "✓"}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="glass p-3 rounded-t-none border-t border-[rgba(201,151,44,0.15)] flex items-end gap-2">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted resize-none outline-none border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2.5 focus:border-[rgba(201,151,44,0.3)] transition-colors min-h-[42px] max-h-[120px]"
          style={{ height: "42px" }}
        />
        <Button
          variant="gold"
          size="sm"
          onClick={sendMessage}
          loading={sending}
          disabled={!input.trim()}
          className="shrink-0 h-[42px] px-4"
        >
          <Send size={15} />
        </Button>
      </div>
    </div>
  );
}
