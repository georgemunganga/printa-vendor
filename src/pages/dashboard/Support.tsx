import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ChevronRight,
  HelpCircle,
  Mail,
  MessageCircle,
  MessageSquarePlus,
  Phone,
  Send,
  Clock,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SUPPORT_TOPICS = [
  "Account & Login Issues",
  "Payment & Billing",
  "Orders & Delivery",
  "Technical Problems",
  "Team Management",
  "Store Setup",
  "Other",
];

const SupportPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message || !formData.topic) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Message sent! We'll get back to you within 24 hours.");
    setIsSubmitting(false);

    // Reset form
    setFormData({ name: "", email: "", topic: "", message: "" });
  };

  return (
    <DashboardLayout pageTitle="Contact Support">
      <div className="mb-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link to="/dashboard/help" className="text-gray-500 hover:text-gray-900 transition">
            Help Centre
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-medium">Contact Support</span>
        </nav>

        <div className="flex items-start gap-4">
          <div>
            <h1 className="dashboard-page-title">Contact Support</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Get help from our support team
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Send us a message
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  We typically respond within 24 hours
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-medium">
                      Topic <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="topic"
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, topic: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                      required
                    >
                      <option value="">Select a topic</option>
                      {SUPPORT_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue or question in detail..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      className="rounded-xl min-h-[180px] resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl h-12 text-sm font-semibold gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Feedback Link */}
              <Link
                to="/dashboard/feedback"
                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition group"
              >
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                  <MessageSquarePlus size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Give Feedback</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Share feedback, request features, or report bugs
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-900 transition" />
              </Link>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-4">
              {/* Quick Contact */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-bold text-gray-900 mb-4">Quick Contact</h3>

                <a
                  href="mailto:support@printa.co.zm"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
                >
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900">support@printa.co.zm</p>
                  </div>
                </a>

                <a
                  href="tel:+260971234567"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
                >
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Phone</p>
                    <p className="text-sm font-semibold text-gray-900">+260 97 123 4567</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Hours</p>
                    <p className="text-sm font-semibold text-gray-900">Mon-Fri, 8AM-6PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Office</p>
                    <p className="text-sm font-semibold text-gray-900">
                      123 Cairo Road, Lusaka, Zambia
                    </p>
                  </div>
                </div>
              </div>

              {/* Browse Help */}
              <Link
                to="/dashboard/help"
                className="block bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white hover:shadow-lg transition"
              >
                <HelpCircle size={32} className="mb-3 opacity-90" />
                <h3 className="font-bold mb-1">Browse Help Articles</h3>
                <p className="text-sm text-white/80 mb-4">
                  Find quick answers in our help center
                </p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  Visit Help Center
                  <ChevronRight size={16} />
                </div>
              </Link>

              {/* Urgent Help */}
              <div className="bg-gradient-to-br from-red-500 to-printa-red rounded-2xl p-5 text-white">
                <p className="text-sm font-bold mb-1">Need urgent help?</p>
                <p className="text-xs text-white/80 mb-4">
                  Call our 24/7 emergency hotline
                </p>
                <a
                  href="tel:+260977654321"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur text-sm font-semibold hover:bg-white/30 transition"
                >
                  <Phone size={16} />
                  +260 97 765 4321
                </a>
              </div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
