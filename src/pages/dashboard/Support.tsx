import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Mail,
  MessageCircle,
  MessageSquarePlus,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const contactOptions = [
  {
    title: "Live Chat",
    subtitle: "Instant help",
    icon: MessageCircle,
    color: "bg-printa-red",
    action: () => window.open("https://tawk.to", "_blank"),
  },
  {
    title: "Call Us",
    subtitle: "Talk to us",
    icon: Phone,
    color: "bg-printa-red",
    action: () => window.open("tel:+15551234567"),
  },
  {
    title: "Email",
    subtitle: "Send message",
    icon: Mail,
    color: "bg-printa-red",
    action: () => window.open("mailto:support@printa.com"),
  },
];

const faqItems = [
  {
    question: "How long does printing take?",
    answer: "Most jobs are ready in 15-30 minutes depending on queue and printer availability.",
  },
  {
    question: "What formats can I upload?",
    answer: "PDF, DOC, DOCX, PNG, JPG plus most common print formats are supported.",
  },
  {
    question: "Can I change my delivery address?",
    answer: "Yes—head to Saved Locations and tap a saved address to mark it as default.",
  },
  {
    question: "What if the print quality is off?",
    answer: "Contact us immediately and we will reprint or refund at no extra charge.",
  },
];

const SupportPage = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <DashboardLayout pageTitle="Support">
      <div className="space-y-4 md:max-w-3xl md:mx-auto">
        {/* Header */}
        <div className=" dashboard-page-heading">
          <h1 className="dashboard-page-title">How can we help?</h1>
          <p className="dashboard-page-subtitle">
            Get in touch or find answers below
          </p>
        </div>

        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 md:gap-3"
        >
          {contactOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.title}
                type="button"
                onClick={option.action}
                className="flex-shrink-0 w-[120px] md:w-auto flex flex-col items-center gap-2 p-4 md:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <div className={`p-3 rounded-xl ${option.color} text-white`}>
                  <Icon size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{option.title}</p>
                  <p className="text-[10px] text-gray-500">{option.subtitle}</p>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Frequently Asked
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {faqItems.map((item, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 rounded-xl bg-printa-red/10">
                      <HelpCircle size={14} className="text-printa-red" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-900">
                      {item.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={18} className="text-gray-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 pl-14 text-sm text-gray-500">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Feedback Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/dashboard/feedback"
            className="flex items-center gap-4 p-4 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-printa-red/20 transition-all group"
          >
            <div className="p-3 rounded-xl bg-printa-red/10 text-printa-red group-hover:bg-printa-red group-hover:text-white transition-colors">
              <MessageSquarePlus size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Give Feedback or Ask for Support</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Share feedback, request features, or report issues
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-printa-red transition-colors" />
          </Link>
        </motion.div>

        {/* Urgent Help Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-printa-red to-rose-600 rounded-2xl p-4 md:p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Need urgent help?</p>
              <p className="text-xs text-white/80 mt-0.5">Call our 24/7 hotline</p>
            </div>
            <button
              type="button"
              onClick={() => window.open("tel:+15551234567")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              <Phone size={16} />
              <span className="hidden md:inline">+1 (555) 123-4567</span>
              <span className="md:hidden">Call</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
