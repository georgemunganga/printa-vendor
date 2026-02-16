import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Download,
  Save,
  Share2,
  FileText,
  Image,
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const GUIDES = [
  {
    id: "download-reports",
    title: "How to Download Reports",
    icon: FileSpreadsheet,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    steps: [
      "Navigate to the Reports or Analytics page",
      "Select the date range and filters you want",
      "Click the 'Export' or 'Download' button",
      "Choose your preferred format (PDF, Excel, CSV)",
      "Your download will start automatically",
    ],
  },
  {
    id: "save-templates",
    title: "Saving Order Templates",
    icon: Save,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    steps: [
      "Create a new order with your desired settings",
      "Click 'Save as Template' before submitting",
      "Give your template a memorable name",
      "Access saved templates from the POS or Orders page",
      "Edit or delete templates anytime from Settings",
    ],
  },
  {
    id: "share-receipts",
    title: "Sharing Receipts with Customers",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    steps: [
      "Complete the order and generate the receipt",
      "Click the 'Share' button on the receipt",
      "Choose to share via Email, WhatsApp, or SMS",
      "Enter customer contact details",
      "Receipt is sent instantly with tracking number",
    ],
  },
  {
    id: "export-data",
    title: "Exporting Your Business Data",
    icon: Download,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    steps: [
      "Go to Settings > Data & Privacy",
      "Click 'Export Data'",
      "Select what data to include (orders, customers, etc.)",
      "Choose format (JSON, CSV, or complete backup)",
      "Receive download link via email within 24 hours",
    ],
  },
];

const FILE_FORMATS = [
  {
    name: "PDF",
    icon: FileText,
    use: "Receipts, invoices, reports",
    color: "text-red-600",
  },
  {
    name: "Excel/CSV",
    icon: FileSpreadsheet,
    use: "Sales data, analytics, inventory",
    color: "text-emerald-600",
  },
  {
    name: "Images",
    icon: Image,
    use: "Product photos, receipts, documents",
    color: "text-blue-600",
  },
];

const DownloadingSavingSharing: React.FC = () => {
  return (
    <DashboardLayout title="Downloading, Saving & Sharing">
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
              <span className="text-gray-900 font-medium">Downloading, Saving & Sharing</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Download size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Downloading, Saving & Sharing
                </h1>
                <p className="text-gray-600">
                  Learn how to manage and share your files and data
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
          {/* Guides */}
          <div className="space-y-4">
            {GUIDES.map((guide, index) => {
              const Icon = guide.icon;

              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`p-3 rounded-xl ${guide.bgColor} ${guide.color} flex-shrink-0`}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {guide.title}
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-3 pl-16">
                      {guide.steps.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 mt-0.5">
                            {stepIndex + 1}
                          </div>
                          <p className="text-sm text-gray-700 pt-0.5">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* File Formats */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Supported File Formats
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {FILE_FORMATS.map((format) => {
                const Icon = format.icon;

                return (
                  <div
                    key={format.name}
                    className="flex items-center gap-4 p-5"
                  >
                    <Icon size={24} className={format.color} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {format.name}
                      </h3>
                      <p className="text-sm text-gray-500">{format.use}</p>
                    </div>
                    <CheckCircle size={20} className="text-emerald-500" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Share2 size={18} className="text-blue-600" />
              Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  Always backup your data regularly to prevent loss
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  Use PDF format for sharing professional-looking receipts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  CSV/Excel files make it easy to analyze data in spreadsheet software
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  Share receipts directly with customers to improve transparency
                </span>
              </li>
            </ul>
          </div>

          {/* Need Help */}
          <div className="text-center bg-white rounded-2xl border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need more help?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Check out our other help articles or contact support
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/dashboard/help/faq"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                View FAQ
              </Link>
              <Link
                to="/dashboard/support"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DownloadingSavingSharing;
