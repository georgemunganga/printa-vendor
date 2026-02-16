import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  AlertCircle,
  Wifi,
  CreditCard,
  Users,
  Package,
  Settings,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const PROBLEM_CATEGORIES = [
  {
    id: "connection",
    title: "Connection Issues",
    icon: Wifi,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    problems: [
      "Can't connect to the internet",
      "App keeps disconnecting",
      "Slow loading times",
      "Connection timeout errors",
    ],
  },
  {
    id: "payments",
    title: "Payment Problems",
    icon: CreditCard,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    problems: [
      "Payment not received",
      "Transaction failed",
      "Wrong amount charged",
      "Refund request",
    ],
  },
  {
    id: "orders",
    title: "Order Issues",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    problems: [
      "Order not appearing",
      "Can't accept orders",
      "Order status not updating",
      "Missing order details",
    ],
  },
  {
    id: "team",
    title: "Team & Access",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    problems: [
      "Can't add team members",
      "Permission denied errors",
      "Team member can't log in",
      "Clock in/out not working",
    ],
  },
  {
    id: "technical",
    title: "Technical Errors",
    icon: Settings,
    color: "text-red-600",
    bgColor: "bg-red-50",
    problems: [
      "Page not loading",
      "White screen error",
      "App crashing",
      "Feature not working",
    ],
  },
];

const QUICK_FIXES = [
  {
    title: "Clear browser cache and cookies",
    description: "Often resolves loading and display issues",
  },
  {
    title: "Check your internet connection",
    description: "Ensure you have stable internet access",
  },
  {
    title: "Try a different browser",
    description: "Some features work better on Chrome or Firefox",
  },
  {
    title: "Refresh the page",
    description: "Simple but effective for many temporary issues",
  },
  {
    title: "Log out and log back in",
    description: "Resets your session and permissions",
  },
];

const FixAProblem: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <DashboardLayout title="Fix a Problem">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6">
              <Link to="/dashboard/help" className="text-gray-500 hover:text-gray-900 transition">
                Help Centre
              </Link>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="text-gray-900 font-medium">Fix a Problem</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Fix a Problem
                </h1>
                <p className="text-gray-600">
                  Troubleshoot common issues and get back to work
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
          {/* Quick Fixes */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Try These First
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="space-y-3">
                {QUICK_FIXES.map((fix, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0 border-gray-100"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-printa-red text-white flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-0.5">
                        {fix.title}
                      </h3>
                      <p className="text-sm text-gray-500">{fix.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Problem Categories */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              What kind of problem are you experiencing?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROBLEM_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    onClick={() =>
                      setSelectedCategory(
                        isSelected ? null : category.id
                      )
                    }
                    className={`bg-white rounded-2xl border-2 p-5 text-left transition ${
                      isSelected
                        ? "border-gray-900 shadow-md"
                        : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${category.bgColor} ${category.color} flex-shrink-0`}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {category.title}
                        </h3>
                        {isSelected && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-1.5"
                          >
                            {category.problems.map((problem, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <ArrowRight size={14} className="text-gray-400" />
                                {problem}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
            <h2 className="text-xl font-bold mb-2">Still stuck?</h2>
            <p className="text-gray-300 mb-6">
              Our support team is ready to help you resolve your issue
            </p>
            <Link
              to="/dashboard/support"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Contact Support
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FixAProblem;
