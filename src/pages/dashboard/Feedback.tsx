import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Bug, Lightbulb, AlertCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BackButton } from "@/components/dashboard/BackButton";
import { submissionsService } from "@/services/submissions.service";

type FeedbackType = "feedback" | "feature" | "complaint" | "bug";

interface FeedbackCategory {
  id: FeedbackType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const feedbackCategories: FeedbackCategory[] = [
  {
    id: "feedback",
    label: "General Feedback",
    description: "Share your thoughts",
    icon: MessageSquare,
    color: "bg-printa-red",
  },
  {
    id: "feature",
    label: "Feature Request",
    description: "Suggest new features",
    icon: Lightbulb,
    color: "bg-printa-red",
  },
  {
    id: "complaint",
    label: "Complaint",
    description: "Report an issue",
    icon: AlertCircle,
    color: "bg-printa-red",
  },
  {
    id: "bug",
    label: "Bug Report",
    description: "Found a bug?",
    icon: Bug,
    color: "bg-printa-red",
  },
];

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast.error("Please select a feedback type");
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }

    setIsSubmitting(true);
    try {
      await submissionsService.createFeedback({
        category: selectedType,
        subject: formData.subject,
        message: formData.message,
      });
      toast.success("Feedback submitted. Thank you for helping improve Printa.");
      setSelectedType(null);
      setFormData({ subject: "", message: "", email: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = feedbackCategories.find((c) => c.id === selectedType);

  return (
    <DashboardLayout pageTitle="Feedback">
      <div className="space-y-4 md:max-w-3xl md:mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          
          <div className="dashboard-page-heading">
            <h1 className="dashboard-page-title">Give Feedback</h1>
            <p className="dashboard-page-subtitle">
              Help us improve Printa
            </p>
          </div>
        </div>

        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            What type of feedback?
          </h2>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {feedbackCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedType === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedType(category.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-printa-red bg-printa-red/5 shadow-sm"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${category.color} text-white`}>
                    <Icon size={18} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${isSelected ? "text-printa-red" : "text-gray-900"}`}>
                      {category.label}
                    </p>
                    <p className="text-[10px] text-gray-500">{category.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Feedback Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 space-y-4"
        >
          {selectedCategory && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${selectedCategory.color} text-white`}>
              <selectedCategory.icon size={12} />
              {selectedCategory.label}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Brief summary of your feedback"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe your feedback in detail..."
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              className="rounded-xl min-h-[150px] resize-none"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !selectedType}
              className="w-full bg-printa-red hover:bg-printa-red/90 rounded-xl h-12 text-sm font-semibold gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </motion.form>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center"
        >
          <p className="text-xs text-gray-500">
            Your feedback helps us build a better product. We read every submission.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FeedbackPage;
