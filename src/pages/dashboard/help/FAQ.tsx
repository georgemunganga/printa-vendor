import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, ChevronRight, MessageCircleQuestion } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "How do I create my first store?",
    answer:
      "To create your first store, navigate to the Stores page from the sidebar, click 'Add Store', and fill in your store details including name, address, phone number, and operating hours. Once submitted, your store will be ready to accept orders.",
  },
  {
    id: "2",
    category: "Getting Started",
    question: "How do I add team members?",
    answer:
      "Go to the Team page, click 'Add Member' or 'Send Invite'. You can either add them directly with their details or send an email invitation. Assign them roles (Owner, Manager, or Staff) and select which stores they can access.",
  },
  {
    id: "3",
    category: "Orders",
    question: "How do I accept incoming orders?",
    answer:
      "Incoming orders appear in the Live Feed on your dashboard. Review the order details, check if you can fulfill it within the deadline, and click 'Accept'. The order will then move to your active orders queue.",
  },
  {
    id: "4",
    category: "Orders",
    question: "Can I cancel an order after accepting it?",
    answer:
      "Yes, but only within 5 minutes of acceptance. After that, you'll need to contact support to cancel. Frequent cancellations may affect your vendor rating.",
  },
  {
    id: "5",
    category: "Orders",
    question: "What happens if I miss an order deadline?",
    answer:
      "Missing deadlines affects your vendor rating and may result in penalties. If you anticipate a delay, communicate with the customer through the chat feature and contact support for assistance.",
  },
  {
    id: "6",
    category: "Payments",
    question: "How do I get paid?",
    answer:
      "Payments are processed automatically after order completion. Funds are transferred to your registered mobile money account or bank account within 24-48 hours. You can track all payments in the Payments section.",
  },
  {
    id: "7",
    category: "Payments",
    question: "What payment methods do you support?",
    answer:
      "We support Mobile Money (MTN, Airtel, Zamtel) and bank transfers for vendor payouts. Customers can pay via mobile money, cards, or cash on delivery.",
  },
  {
    id: "8",
    category: "Payments",
    question: "Are there any transaction fees?",
    answer:
      "Printa charges a small commission on each completed order. The exact percentage depends on your subscription plan. Pro and Enterprise plans have lower commission rates. Check your Subscription page for details.",
  },
  {
    id: "9",
    category: "Subscription",
    question: "What are the different subscription plans?",
    answer:
      "We offer three plans: Basic (free with limited features), Pro (K150/mo with priority support and lower fees), and Enterprise (custom pricing with dedicated account manager). Visit the Subscription page to compare features.",
  },
  {
    id: "10",
    category: "Subscription",
    question: "Can I change my plan anytime?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle.",
  },
  {
    id: "11",
    category: "POS System",
    question: "How does the POS system work?",
    answer:
      "The POS system allows you to process walk-in orders directly. Add items, calculate totals, accept payments, and print receipts all from one interface. It integrates seamlessly with your online orders.",
  },
  {
    id: "12",
    category: "POS System",
    question: "Can I use the POS offline?",
    answer:
      "Basic POS features work offline and sync when you reconnect. However, payment processing and real-time inventory updates require an internet connection.",
  },
  {
    id: "13",
    category: "Team Management",
    question: "What's the difference between roles?",
    answer:
      "Owners have full access to all features. Managers can handle operations, orders, and team but can't change billing. Staff can clock in, use POS, and view assigned orders. You can customize permissions for each role.",
  },
  {
    id: "14",
    category: "Team Management",
    question: "How do I track employee hours?",
    answer:
      "Use the Shift Management feature. Team members clock in/out with their PIN. The system tracks hours automatically and generates timesheets you can export for payroll.",
  },
  {
    id: "15",
    category: "Technical Issues",
    question: "What browsers are supported?",
    answer:
      "Printa works best on Chrome, Firefox, Safari, and Edge (latest versions). For mobile, we support iOS 13+ and Android 8+. Some features may be limited on older browsers.",
  },
  {
    id: "16",
    category: "Technical Issues",
    question: "The app is running slow, what should I do?",
    answer:
      "Try clearing your browser cache, closing unused tabs, or restarting your browser. If issues persist, check your internet connection or contact support with details about your device and browser.",
  },
];

const CATEGORIES = Array.from(new Set(FAQ_DATA.map((item) => item.category)));

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DashboardLayout title="FAQ">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6">
              <Link to="/dashboard/help" className="text-gray-500 hover:text-gray-900 transition">
                Help Centre
              </Link>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="text-gray-900 font-medium">FAQ</span>
            </nav>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600">
              Quick answers to common questions about Printa
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === null
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No FAQs found matching your search.</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => {
                const isExpanded = expandedId === faq.id;

                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <span className="text-xs font-medium text-printa-red mb-1 block">
                          {faq.category}
                        </span>
                        <h3 className="font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 flex-shrink-0 transition ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-0">
                            <div className="border-t border-gray-100 pt-4">
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Help CTA */}
          <div className="mt-12 text-center bg-white rounded-2xl border border-gray-100 p-8">
            <MessageCircleQuestion size={40} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Can't find the answer you're looking for? We're here to help.
            </p>
            <Link
              to="/dashboard/support"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FAQ;
