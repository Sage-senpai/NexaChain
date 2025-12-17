// FILE: src/components/messaging/AdminInbox.tsx
// ============================================
"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, Send, CheckCircle, Clock, XCircle, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  conversation_id: string;
  sender_role: "user" | "admin" | "system";
  sender_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface Conversation {
  id: string;
  user_id: string;
  status: "open" | "pending" | "closed";
  subject: string | null;
  last_message_at: string | null;
  created_at: string;
  message_count: number;
  user_name: string;
  user_email: string;
  profiles: {
    full_name: string | null;
    email: string;
    phone: string | null;
  } | null;
}

export default function AdminInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "pending" | "closed">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Filter conversations
  useEffect(() => {
    let filtered = conversations;

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.profiles?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConversations(filtered);
  }, [conversations, statusFilter, searchTerm]);

  // Subscribe to realtime updates - FIXED DEPENDENCY
  useEffect(() => {
    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.conversation_id === selectedConversation?.id) {
            // ✅ Fetch messages only when NEW message arrives
            fetchMessages(selectedConversation.id);
          }
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation?.id]); // ✅ Only depend on ID, not entire object

  // Fetch conversation when selected - ONLY ONCE, NOT ON EVERY CHANGE
  useEffect(() => {
    if (selectedConversation) {
      loadConversation(selectedConversation.id);
    }
  }, [selectedConversation?.id]); // ✅ Only re-fetch when ID changes, not on every state update

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      } else {
        console.error("Failed to fetch conversations");
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const loadConversation = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load messages' }));
        throw new Error(errorData.error || 'Failed to load messages');
      }

      const data = await res.json();
      
      if (data.conversation) {
        setSelectedConversation(data.conversation);
      }
      
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
      alert(error instanceof Error ? error.message : 'Failed to load conversation');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage.trim(),
          context: "admin-panel" // ✅ Tell API this is from admin panel
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to send message' }));
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      scrollToBottom();
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: "open" | "pending" | "closed") => {
    if (!selectedConversation) return;

    try {
      const res = await fetch(`/api/messages/${selectedConversation.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update status' }));
        throw new Error(errorData.error || 'Failed to update status');
      }

      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id ? { ...conv, status } : conv
        )
      );

      setSelectedConversation(prev => prev ? { ...prev, status } : null);

      alert(`Conversation marked as ${status}`);
    } catch (error) {
      console.error('Error updating conversation status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const stats = {
    open: conversations.filter((c) => c.status === "open").length,
    pending: conversations.filter((c) => c.status === "pending").length,
    closed: conversations.filter((c) => c.status === "closed").length,
    total: conversations.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border-2 border-[#D4AF37]/20"
        >
          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-1">Total</div>
          <div className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF]">
            {stats.total}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border-2 border-[#10B981]/20"
        >
          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-1">Open</div>
          <div className="text-2xl font-bold text-[#10B981]">{stats.open}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border-2 border-[#F59E0B]/20"
        >
          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-1">Pending</div>
          <div className="text-2xl font-bold text-[#F59E0B]">{stats.pending}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border-2 border-[#4A4A4A]/20"
        >
          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-1">Closed</div>
          <div className="text-2xl font-bold text-[#4A4A4A] dark:text-[#B8B8B8]">
            {stats.closed}
          </div>
        </motion.div>
      </div>

      {/* Main Interface */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-[700px]">
          {/* Conversation List */}
          <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/20 flex flex-col">
            {/* Search & Filters */}
            <div className="p-4 border-b border-[#D4AF37]/20 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["all", "open", "pending", "closed"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === filter
                        ? filter === "all"
                          ? "bg-[#D4AF37] text-white"
                          : filter === "open"
                          ? "bg-[#10B981] text-white"
                          : filter === "pending"
                          ? "bg-[#F59E0B] text-white"
                          : "bg-[#4A4A4A] text-white"
                        : "border border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] hover:bg-[#D4AF37]/10"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                  <p className="text-[#4A4A4A] dark:text-[#B8B8B8] text-sm">
                    No conversations found
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-all ${
                      selectedConversation?.id === conv.id ? "bg-[#D4AF37]/10" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-white text-sm font-bold">
                          {conv.user_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#000000] dark:text-[#FFFFFF] text-sm truncate">
                            {conv.user_name || "Unknown User"}
                          </h3>
                          <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] truncate">
                            {conv.user_email}
                          </p>
                          {conv.profiles?.phone && (
                            <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
                              📱 {conv.profiles.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          conv.status === "open"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : conv.status === "closed"
                              ? "bg-[#4A4A4A]/10 text-[#4A4A4A] dark:text-[#B8B8B8]"
                              : "bg-[#F59E0B]/10 text-[#F59E0B]"
                        }`}
                      >
                        {getStatusIcon(conv.status)}
                      </span>
                    </div>
                    <p className="text-sm text-[#000000] dark:text-[#FFFFFF] font-medium mb-1 truncate">
                      {conv.subject || "Support Request"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
                      <span>{conv.message_count} messages</span>
                      <span>{conv.last_message_at ? formatTime(conv.last_message_at) : formatTime(conv.created_at)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-[#D4AF37]/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-white font-bold">
                        {selectedConversation.user_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">
                          {selectedConversation.user_name || "Unknown User"}
                        </h2>
                        <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                          📧 {selectedConversation.user_email}
                        </p>
                        {selectedConversation.profiles?.phone && (
                          <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                            📱 {selectedConversation.profiles.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleUpdateStatus("open")}
                        disabled={selectedConversation.status === "open"}
                        className="px-3 py-1.5 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all disabled:opacity-50 text-xs font-semibold"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("pending")}
                        disabled={selectedConversation.status === "pending"}
                        className="px-3 py-1.5 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-all disabled:opacity-50 text-xs font-semibold"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("closed")}
                        disabled={selectedConversation.status === "closed"}
                        className="px-3 py-1.5 bg-[#4A4A4A] text-white rounded-lg hover:bg-[#3A3A3A] transition-all disabled:opacity-50 text-xs font-semibold"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mt-2">
                    Subject: {selectedConversation.subject || "Support Request"}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                        <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">No messages yet</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_role === "admin" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            msg.sender_role === "admin"
                              ? "bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                              : "bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/10"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs font-semibold ${
                                msg.sender_role === "admin"
                                  ? "text-[#D4AF37]"
                                  : "text-[#000000] dark:text-[#FFFFFF]"
                              }`}
                            >
                              {msg.sender_role === "admin"
                                ? msg.profiles?.full_name || "Admin"
                                : selectedConversation.user_name || "User"}
                            </span>
                            <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-[#000000] dark:text-[#FFFFFF] text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-[#D4AF37]/20 p-4">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your reply..."
                      rows={3}
                      disabled={selectedConversation.status === "closed" || sending}
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none resize-none disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim() || selectedConversation.status === "closed"}
                      className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                  {selectedConversation.status === "closed" && (
                    <p className="text-xs text-[#EF4444] mt-2">
                      This conversation is closed. Reopen it to send messages.
                    </p>
                  )}
                  <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}