import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, CheckCheck, MessageCircle, FileText, ExternalLink, Paperclip, X, File } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { mockOrders } from "@/data/mockOrders";
import { PrintJob } from "@/types";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { BackButton } from "@/components/dashboard/BackButton";
import { useStore } from "@/context/store-context";
import { scopeItemsByActiveStore } from "@/lib/store-scope";

interface Attachment {
  id: string;
  name: string;
  type: "image" | "file";
  url: string;
  size: number;
}

interface ChatMessage {
  id: string;
  senderId: "user" | "vendor";
  message: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  attachments?: Attachment[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface ChatThread {
  order: PrintJob;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

// Generate mock chat threads from orders
const getMockThreads = (orders: PrintJob[]): ChatThread[] =>
  orders
    .filter((o) => o.status !== "cancelled")
    .map((order) => ({
      order,
      lastMessage:
        order.status === "ready"
          ? "Your order is ready for pickup!"
          : order.status === "printing"
          ? "We're printing your documents now."
          : "Thanks for your order!",
      lastMessageTime: new Date(Date.now() - Math.random() * 86400000),
      unreadCount: Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0,
    }))
    .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

const getMockMessages = (orderId: string): ChatMessage[] => [
  {
    id: "msg-1",
    senderId: "vendor",
    message: `Hi! Thanks for your order. We've received your files and are reviewing them now.`,
    timestamp: new Date(Date.now() - 3600000 * 2),
    status: "read",
  },
  {
    id: "msg-2",
    senderId: "user",
    message: "Great! How long will the review take?",
    timestamp: new Date(Date.now() - 3600000 * 1.5),
    status: "read",
  },
  {
    id: "msg-3",
    senderId: "vendor",
    message: "Usually about 15-30 minutes. We'll notify you once we start printing.",
    timestamp: new Date(Date.now() - 3600000 * 1.4),
    status: "read",
  },
  {
    id: "msg-4",
    senderId: "vendor",
    message: "Quick question - would you prefer glossy or matte finish?",
    timestamp: new Date(Date.now() - 3600000),
    status: "read",
  },
  {
    id: "msg-5",
    senderId: "user",
    message: "Matte finish please.",
    timestamp: new Date(Date.now() - 1800000),
    status: "read",
  },
  {
    id: "msg-6",
    senderId: "vendor",
    message: "Perfect! Your order should be ready soon.",
    timestamp: new Date(Date.now() - 900000),
    status: "delivered",
  },
];

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const formatDateLabel = (date: Date) => {
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return formatDateLabel(date);
};

// Chat List Item Component
const ChatListItem: React.FC<{
  thread: ChatThread;
  isActive: boolean;
  onClick: () => void;
}> = ({ thread, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
      isActive ? "bg-gray-100" : "hover:bg-gray-50"
    }`}
  >
    <div className="w-12 h-12 rounded-full bg-printa-red flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-semibold text-white">
        {thread.order.printer.name.charAt(0)}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900 truncate text-sm">
          {thread.order.printer.name}
        </h3>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {formatRelativeTime(thread.lastMessageTime)}
        </span>
      </div>
      <p className="text-xs text-gray-500 truncate mt-0.5">{thread.order.fileName}</p>
      <div className="flex items-center justify-between gap-2 mt-1">
        <p className="text-sm text-gray-500 truncate">{thread.lastMessage}</p>
        {thread.unreadCount > 0 && (
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center">
            {thread.unreadCount}
          </span>
        )}
      </div>
    </div>
  </button>
);

// Chat List Panel Component
const ChatListPanel: React.FC<{
  threads: ChatThread[];
  activeOrderId: string | null;
  onSelectThread: (orderId: string) => void;
}> = ({ threads, activeOrderId, onSelectThread }) => (
  <div className="h-full flex flex-col bg-white border-r border-gray-200">
    
    <div className="p-4 border-b border-gray-100">
      <h1 className="dashboard-page-title">Messages</h1>
      <p className="dashboard-page-subtitle">{threads.length} conversations</p>
    </div>
    <div className="flex-1 overflow-y-auto">
      {threads.length > 0 ? (
        threads.map((thread) => (
          <ChatListItem
            key={thread.order.id}
            thread={thread}
            isActive={activeOrderId === thread.order.id}
            onClick={() => onSelectThread(thread.order.id)}
          />
        ))
      ) : (
        <div className="p-8 text-center">
          <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No conversations yet</p>
        </div>
      )}
    </div>
  </div>
);

// Order Context Card Component
const OrderContextCard: React.FC<{ order: PrintJob }> = ({ order }) => {
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    printing: "bg-blue-100 text-blue-700",
    ready: "bg-emerald-100 text-emerald-700",
    delivered: "bg-gray-100 text-gray-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  const statusLabels: Record<string, string> = {
    pending: "Processing",
    printing: "Printing",
    ready: "Ready",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <div className="mx-4 mb-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <FileText size={16} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Order Context
            </p>
          </div>
          <Link
            to={`/dashboard/order/${order.id}`}
            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ExternalLink size={14} className="text-gray-400" />
          </Link>
        </div>

        <h3 className="font-semibold text-gray-900 truncate">{order.fileName}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {order.pageCount} pages · {order.copies} {order.copies === 1 ? "copy" : "copies"} · {order.colorMode === "color" ? "Color" : "B&W"}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">{order.id}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || statusColors.pending}`}>
              {statusLabels[order.status] || "Processing"}
            </span>
          </div>
          <span className="text-sm font-bold text-gray-900">${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">
        Conversation about this order
      </p>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50">
    <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
      <MessageCircle size={28} className="text-gray-400" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">Select a conversation</h2>
    <p className="text-sm text-gray-500 mt-1 max-w-xs">
      Choose a chat from the list to view messages
    </p>
  </div>
);

// Main Chat View Component
const ChatView: React.FC<{
  order: PrintJob;
  messages: ChatMessage[];
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}> = ({ order, messages, onSendMessage, onBack, showBackButton }) => {
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type.startsWith("image/") ? "image" : "file",
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att) URL.revokeObjectURL(att.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSend = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    onSendMessage(newMessage.trim(), attachments.length > 0 ? attachments : undefined);
    setNewMessage("");
    setAttachments([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const key = formatDateLabel(msg.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-100 px-4 h-16 flex items-center gap-3">
        {showBackButton && (
          <BackButton
            onClick={onBack}
            ariaLabel="Go back to chats"
            className="-ml-2 md:hidden"
          />
        )}
        <div className="w-10 h-10 rounded-full bg-printa-red flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-white">
            {order.printer.name.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold text-gray-900 truncate">
            {order.printer.name}
          </h1>
          <p className="text-xs text-gray-500 truncate">
            {order.id} · {order.fileName}
          </p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto py-6  bg-gradient-to-b from-printa-red/5 from-[0%] via-orange-50/10 via-[15%] to-white to-[98%]">
        {/* Order Context Card */}
        <OrderContextCard order={order} />

        {/* Chat Messages */}
        <div className="px-4">
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex justify-center my-6">
              <span className="text-xs font-medium text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                {date}
              </span>
            </div>
            <div className="space-y-1">
              <AnimatePresence>
                {msgs.map((msg, i) => {
                  const isUser = msg.senderId === "user";
                  const showAvatar = i === 0 || msgs[i - 1]?.senderId !== msg.senderId;
                  const isLast = i === msgs.length - 1 || msgs[i + 1]?.senderId !== msg.senderId;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} ${
                        showAvatar ? "mt-4" : ""
                      }`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[85%] lg:max-w-[70%] ${
                          isUser ? "flex-row-reverse" : ""
                        }`}
                      >
                        {!isUser && (
                          <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? "" : "invisible"}`}>
                            <div className="w-8 h-8 rounded-full bg-printa-red flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {order.printer.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col">
                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mb-2 space-y-2">
                              {msg.attachments.map((att) => (
                                <div key={att.id}>
                                  {att.type === "image" ? (
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      className="max-w-[200px] rounded-xl shadow-sm"
                                    />
                                  ) : (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm ${
                                      isUser ? "bg-gray-800" : "bg-white"
                                    }`}>
                                      <File size={16} className={isUser ? "text-gray-400" : "text-gray-500"} />
                                      <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium truncate ${isUser ? "text-white" : "text-gray-900"}`}>
                                          {att.name}
                                        </p>
                                        <p className={`text-xs ${isUser ? "text-gray-400" : "text-gray-500"}`}>
                                          {formatFileSize(att.size)}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Message Text */}
                          {msg.message && (
                          <div
                            className={`px-4 py-2.5 shadow-sm ${
                              isUser
                                ? "bg-printa-black text-white rounded-3xl rounded-br-lg"
                                : "bg-white text-gray-900 rounded-3xl rounded-bl-lg"
                            }`}
                          >
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          </div>
                          )}
                          {isLast && (
                            <div
                              className={`flex items-center gap-1 mt-1 px-1 ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span className="text-[11px] text-gray-400">
                                {formatTime(msg.timestamp)}
                              </span>
                              {isUser && (
                                <span className="text-gray-400">
                                  {msg.status === "read" ? (
                                    <CheckCheck size={12} className="text-gray-900" />
                                  ) : msg.status === "delivered" ? (
                                    <CheckCheck size={12} />
                                  ) : (
                                    <Check size={12} />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="flex-shrink-0 border-t border-gray-100 bg-white">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {attachments.map((att) => (
                <div key={att.id} className="relative flex-shrink-0">
                  {att.type === "image" ? (
                    <div className="relative">
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-printa-black text-white rounded-full flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
                      <File size={16} className="text-gray-500" />
                      <div className="max-w-[100px]">
                        <p className="text-xs font-medium text-gray-900 truncate">{att.name}</p>
                        <p className="text-[10px] text-gray-500">{formatFileSize(att.size)}</p>
                      </div>
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-end gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attachment button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <Paperclip size={18} />
            </button>

            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              className="flex-1 resize-none rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors"
              style={{ maxHeight: 120 }}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!newMessage.trim() && attachments.length === 0}
              className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                newMessage.trim() || attachments.length > 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              <Send size={18} className={newMessage.trim() || attachments.length > 0 ? "" : "opacity-50"} />
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main Chat Page Component
const ChatPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { activeStore } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scopedOrders = useMemo(
    () => scopeItemsByActiveStore(mockOrders, activeStore?.id),
    [activeStore?.id]
  );
  const [threads, setThreads] = useState<ChatThread[]>(() => getMockThreads(scopedOrders));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orderId ?? null);

  const activeOrder = activeOrderId
    ? scopedOrders.find((o) => o.id === activeOrderId)
    : null;

  useEffect(() => {
    setThreads(getMockThreads(scopedOrders));
    setMessages([]);
    setActiveOrderId(null);
  }, [scopedOrders]);

  useEffect(() => {
    if (activeOrderId) {
      setMessages(getMockMessages(activeOrderId));
    }
  }, [activeOrderId]);

  useEffect(() => {
    if (orderId) {
      setActiveOrderId(orderId);
    }
  }, [orderId]);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    setTimeout(() => navigate("/login"), 800);
  };

  const handleSelectThread = (id: string) => {
    setActiveOrderId(id);
    navigate(`/dashboard/chat/${id}`, { replace: true });
  };

  const handleSendMessage = (text: string, attachments?: Attachment[]) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user",
      message: text,
      timestamp: new Date(),
      status: "sent",
      attachments,
    };
    setMessages((prev) => [...prev, message]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, status: "delivered" as const } : m))
      );
    }, 1000);
  };

  const handleBack = () => {
    setActiveOrderId(null);
    navigate("/dashboard/chat", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Sidebar - Desktop Only */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onLogout={handleLogout}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div
        className={`fixed inset-0 flex transition-all duration-300 ${
          isSidebarOpen ? "md:left-[220px]" : "md:left-[72px]"
        }`}
      >
        {/* Chat List Panel - Hidden on mobile when chat is active */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${
            activeOrderId ? "hidden md:block" : "block"
          }`}
        >
          <ChatListPanel
            threads={threads}
            activeOrderId={activeOrderId}
            onSelectThread={handleSelectThread}
          />
        </div>

        {/* Chat View or Empty State */}
        <div className={`flex-1 ${!activeOrderId ? "hidden md:block" : "block"}`}>
          {activeOrder ? (
            <ChatView
              order={activeOrder}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              showBackButton={true}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav - Only show on chat list (no active chat) */}
      {!activeOrderId && <MobileBottomNav />}
    </div>
  );
};

export default ChatPage;
