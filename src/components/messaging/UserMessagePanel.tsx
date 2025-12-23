// FILE: src/components/messaging/UserMessagePanel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender_role: 'user' | 'admin' | 'system'; // ✅ Matches database schema
  sender_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  last_message_at: string;
}

export default function UserMessagePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<"list" | "conversation" | "new">("list");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch user profile to get current user ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.profile.id);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Fetch conversations when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Poll for new messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && isOpen) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation, isOpen]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
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
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!selectedConversation) {
      alert("Please select a conversation first");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: newMessage.trim(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send message");
      }

      const data = await res.json();
      
      // Add new message to list
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
      
      // Update conversation's last message time
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, last_message_at: data.message.created_at }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject.trim() || "Support Request",
          content: newMessage.trim(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create conversation");
      }

      const data = await res.json();
      
      // Add new conversation to list
      setConversations((prev) => [data.conversation, ...prev]);
      
      // Select the new conversation
      setSelectedConversation(data.conversation);
      setMessages([data.message]);
      
      // Clear inputs and switch to conversation view
      setNewMessage("");
      setNewSubject("");
      setView("conversation");
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert(error instanceof Error ? error.message : "Failed to create conversation");
    } finally {
      setSending(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setView("conversation");
    await fetchMessages(conversation.id);
  };

  // Helper function to get sender name
  const getSenderName = (message: Message) => {
    if (message.sender_role === 'admin') {
      return 'Nexachain Support';
    }
    return message.sender_id === currentUserId ? 'You' : 'User';
  };

  // Helper function to get message styling
  const getSenderStyle = (message: Message) => {
    if (message.sender_role === 'admin') {
      return 'bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30';
    }
    return message.sender_id === currentUserId
      ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700]'
      : 'bg-[#F8F9FA] dark:bg-[#0A0A0A]';
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full shadow-2xl hover:shadow-[#D4AF37]/50 transition-all z-40 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Message Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="message-panel bg-white dark:bg-[#1A1A1A] border-2 border-[#D4AF37]/20 md:rounded-2xl shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/20">
                <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                  {view === "list" && "Messages"}
                  {view === "conversation" && selectedConversation?.subject}
                  {view === "new" && "New Message"}
                </h3>
                <div className="flex items-center gap-2">
                  {view !== "list" && (
                    <button
                      onClick={() => {
                        setView("list");
                        setSelectedConversation(null);
                        setMessages([]);
                        setNewMessage("");
                        setNewSubject("");
                      }}
                      className="px-3 py-1 text-xs border border-[#D4AF37]/20 rounded-lg hover:bg-[#D4AF37]/10 transition-all"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* List View */}
                {view === "list" && (
                  <>
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageCircle className="w-16 h-16 text-[#D4AF37]/30 mb-4" />
                        <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-4">
                          No conversations yet
                        </p>
                        <button
                          onClick={() => setView("new")}
                          className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
                        >
                          Start a Conversation
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {conversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => selectConversation(conv)}
                            className="w-full p-3 rounded-lg border border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 transition-all text-left"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-[#000000] dark:text-[#FFFFFF] text-sm">
                                {conv.subject}
                              </h4>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  conv.status === "open"
                                    ? "bg-[#10B981]/10 text-[#10B981]"
                                    : "bg-[#4A4A4A]/10 text-[#4A4A4A]"
                                }`}
                              >
                                {conv.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
                              {new Date(conv.last_message_at || conv.created_at).toLocaleDateString()}
                            </p>
                          </button>
                        ))}
                        <button
                          onClick={() => setView("new")}
                          className="w-full p-3 border-2 border-dashed border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/5 transition-all text-[#D4AF37] font-semibold"
                        >
                          + New Conversation
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Conversation View */}
                {view === "conversation" && (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_role === 'user' && msg.sender_id === currentUserId
                            ? "justify-end" 
                            : "justify-start"
                        }`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-3 ${getSenderStyle(msg)}`}>
                          {/* Show sender name for admin messages */}
                          {msg.sender_role === 'admin' && (
                            <div className="text-xs font-semibold text-[#D4AF37] mb-1">
                              {getSenderName(msg)}
                            </div>
                          )}
                          <p className={`text-sm whitespace-pre-wrap break-words ${
                            msg.sender_role === 'user' && msg.sender_id === currentUserId
                              ? 'text-white'
                              : 'text-[#000000] dark:text-[#FFFFFF]'
                          }`}>
                            {msg.content}
                          </p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_role === 'user' && msg.sender_id === currentUserId
                              ? 'text-white/70'
                              : 'text-[#4A4A4A] dark:text-[#B8B8B8]'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* New Conversation View */}
                {view === "new" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                        Subject (Optional)
                      </label>
                      <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="e.g., Deposit Question"
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              {(view === "conversation" || view === "new") && (
                <div className="p-4 border-t border-[#D4AF37]/20">
                  <div className="message-input-container">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          view === "new" ? handleCreateConversation() : handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      rows={3}
                      disabled={sending}
                      className="flex-1 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none resize-none disabled:opacity-50"
                    />
                    <button
                      onClick={view === "new" ? handleCreateConversation : handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}