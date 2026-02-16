import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  FileQuestion,
  Download,
  AlertCircle,
  BookOpen,
  GraduationCap,
  MessageCircleQuestion,
  ArrowRight,
  TrendingUp,
  Settings,
  CreditCard,
  Users,
  Printer,
  Package,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const HELP_TOPICS = [
  {
    id: "account-settings",
    title: "Account Settings",
    description: "Manage your account, profile, and preferences",
    icon: Settings,
    path: "/dashboard/help/account-settings",
    color: "text-printa-red",
    bgColor: "bg-printa-red/10",
  },
  {
    id: "payments",
    title: "Payments, Pricing & Billing",
    description: "Subscription plans, invoices, and payment methods",
    icon: CreditCard,
    path: "/dashboard/help/payments",
    color: "text-printa-red",
    bgColor: "bg-printa-red/10",
  },
  {
    id: "teams",
    title: "Teams and Groups",
    description: "Add members, manage roles, and permissions",
    icon: Users,
    path: "/dashboard/help/teams",
    color: "text-printa-red",
    bgColor: "bg-printa-red/10",
  },
  {
    id: "downloads",
    title: "Downloading, Saving & Sharing",
    description: "Export data, save templates, and share files",
    icon: Download,
    path: "/dashboard/help/downloading-saving-sharing",
    color: "text-printa-red",
    bgColor: "bg-printa-red/10",
  },
  {
    id: "pos-orders",
    title: "POS & Orders",
    description: "Process orders, manage queue, and track jobs",
    icon: Printer,
    path: "/dashboard/help/pos-orders",
    color: "text-printa-red",
    bgColor: "bg-printa-red/10",
  },
  {
    id: "stores",
    title: "Store Management",
    description: "Set up stores, manage inventory, and locations",
    icon: Package,
    path: "/dashboard/help/stores",
    color: "text-printa-red",
    bgColor: "bg-printa-red/10",
  },
  {
    id: "fix-problem",
    title: "Fix a Problem",
    description: "Troubleshoot issues and find solutions",
    icon: AlertCircle,
    path: "/dashboard/help/fix-a-problem",
    color: "text-printa-red",
    bgColor: "bg-printa-red/10",
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Frequently asked questions and quick answers",
    icon: FileQuestion,
    path: "/dashboard/help/faq",
    color: "text-printa-red",
    bgColor: "bg-printa-red/10",
  },
];

const QUICK_QUESTIONS = [
  "How do I accept orders?",
  "Set up my first store",
  "Add team members",
  "Change my subscription",
  "Export my data",
  "Contact support",
];

const POPULAR_ARTICLES = [
  {
    id: "1",
    title: "How to accept and manage print orders",
    category: "Getting Started",
    views: "1.2k",
  },
  {
    id: "2",
    title: "Setting up your first store",
    category: "Store Management",
    views: "980",
  },
  {
    id: "3",
    title: "Understanding payment processing",
    category: "Payments",
    views: "850",
  },
  {
    id: "4",
    title: "Managing team members and permissions",
    category: "Team",
    views: "720",
  },
];

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleQuickQuestion = (question: string) => {
    setSearchQuery(question);
    // TODO: Implement search
  };

  return (
    <DashboardLayout title="Help Center">
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-10 pt-6 md:py-14 md:pt-4 lg:pt-4  text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
            >
              Get help with <span className="text-printa-red"> anything</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 mb-10"
            >
              Ask questions. Find answers. Get back to printing.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={22}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full pl-14 pr-5 py-5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                />
              </div>
            </motion.form>

            {/* Quick Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-gray-500 mb-4">Try asking</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition border border-gray-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Browse by Topic */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Browse by topic
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {HELP_TOPICS.map((topic, index) => {
              const Icon = topic.icon;

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={topic.path}
                    className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all group h-full"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl ${topic.bgColor} ${topic.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}
                    >
                      <Icon size={26} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {topic.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Recommended Tutorials */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap size={24} className="text-gray-900" />
              <h2 className="text-2xl font-bold text-gray-900">
                Recommended tutorials
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {POPULAR_ARTICLES.map((article) => (
                <Link
                  key={article.id}
                  to={`/dashboard/help/article/${article.id}`}
                  className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition flex-shrink-0 mt-1"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Still Need Help */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 text-center text-white">
            <MessageCircleQuestion size={48} className="mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Still need help?
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Can't find what you're looking for? Our support team is here to
              help you.
            </p>
            <Link
              to="/dashboard/support"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition text-lg"
            >
              Contact Support
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
