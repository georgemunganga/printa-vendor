import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle, Mail, MapPin, MessageSquarePlus, Phone, Send } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submissionsService } from "@/services/submissions.service";
import { useStore } from "@/context/store-context";

const SUPPORT_TOPICS = [
  "Account and sign-in",
  "Vendor onboarding and approval",
  "Store setup and permissions",
  "Orders and print jobs",
  "POS and receipts",
  "Inventory",
  "Subscriptions and payments",
  "Chat and notifications",
  "Technical problem",
  "Other",
];

const SupportPage = () => {
  const { activeStore } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ topic: "", subject: "", reference: "", message: "" });
  const isCloud = typeof window !== "undefined" && window.location.hostname.toLowerCase().endsWith("printa.cloud");
  const supportEmail = isCloud ? "hello@printa.cloud" : "hello@printa.co.zm";
  const context = useMemo(() => activeStore ? `Store: ${activeStore.name} (${activeStore.id})` : "Store: No store selected", [activeStore]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const topic = formData.topic.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();
    if (!topic || !subject || !message) {
      toast.error("Enter a topic, subject, and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supportContext = [context, formData.reference.trim() ? `Reference: ${formData.reference.trim()}` : null].filter(Boolean).join("\n");
      await submissionsService.createSupport({ topic, subject, message: `${message}\n\n${supportContext}` });
      toast.success("Support request submitted.");
      setFormData({ topic: "", subject: "", reference: "", message: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit your support request. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Contact Support">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/dashboard/help" className="hover:text-gray-900">Help & Support</Link><ChevronRight size={13} /><span className="font-medium text-gray-900">Contact Support</span>
        </nav>

        <div className="mb-6">
          <h1 className="dashboard-page-title">Contact Support</h1>
          <p className="mt-1 text-sm text-gray-500">Send an account-linked request to the Printa support queue.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 md:p-7">
            <h2 className="text-lg font-bold text-gray-900">Describe the issue</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">Include the exact error and an order or payment reference where relevant. Never include a password, OTP, card number, or mobile money PIN.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <Label htmlFor="support-topic">Topic *</Label>
                <select id="support-topic" required value={formData.topic} onChange={(event) => setFormData((current) => ({ ...current, topic: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-printa-red focus:ring-2 focus:ring-printa-red/10">
                  <option value="">Select a topic</option>
                  {SUPPORT_TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                </select>
              </div>

              <div>
                <Label htmlFor="support-subject">Subject *</Label>
                <Input id="support-subject" required maxLength={120} value={formData.subject} onChange={(event) => setFormData((current) => ({ ...current, subject: event.target.value }))} placeholder="Briefly describe what went wrong" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="support-reference">Order, payment, or other reference</Label>
                <Input id="support-reference" maxLength={120} value={formData.reference} onChange={(event) => setFormData((current) => ({ ...current, reference: event.target.value }))} placeholder="Optional" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="support-message">What happened? *</Label>
                <Textarea id="support-message" required maxLength={4000} value={formData.message} onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))} placeholder="Tell us what you were doing, what you expected, and the exact message shown." className="mt-1 min-h-44 resize-y" />
                <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-gray-400"><span>{context}</span><span>{formData.message.length}/4000</span></div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="h-11 w-full gap-2 bg-gray-950 hover:bg-gray-800 sm:w-auto">
                <Send size={16} />{isSubmitting ? "Sending…" : "Submit support request"}
              </Button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="font-bold text-gray-900">Printa contact</h2>
              <a href={`mailto:${supportEmail}`} className="mt-4 flex items-start gap-3 rounded-xl p-3 transition hover:bg-gray-50">
                <span className="rounded-xl bg-blue-50 p-2 text-blue-600"><Mail size={17} /></span>
                <span className="min-w-0"><span className="block text-xs text-gray-400">Email</span><span className="block break-all text-sm font-semibold text-gray-900">{supportEmail}</span></span>
              </a>
              {!isCloud && (
                <>
                  <a href="tel:+260972827372" className="mt-1 flex items-start gap-3 rounded-xl p-3 transition hover:bg-gray-50">
                    <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600"><Phone size={17} /></span>
                    <span><span className="block text-xs text-gray-400">Phone</span><span className="block text-sm font-semibold text-gray-900">+260 972 827 372</span></span>
                  </a>
                  <div className="mt-1 flex items-start gap-3 rounded-xl p-3">
                    <span className="rounded-xl bg-purple-50 p-2 text-purple-600"><MapPin size={17} /></span>
                    <span><span className="block text-xs text-gray-400">Office</span><span className="block text-sm font-semibold leading-5 text-gray-900">14 Wusikili Road, Lusaka, Zambia</span></span>
                  </div>
                </>
              )}
            </div>

            <Link to="/dashboard/help" className="block rounded-2xl bg-gray-950 p-5 text-white transition hover:bg-gray-800">
              <HelpCircle size={27} />
              <h2 className="mt-3 font-bold">Browse Help & Support</h2>
              <p className="mt-1 text-xs leading-5 text-white/65">Find instructions before opening a request.</p>
            </Link>

            <Link to="/dashboard/feedback" className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-gray-200 hover:shadow-sm">
              <span className="rounded-xl bg-printa-red/10 p-2 text-printa-red"><MessageSquarePlus size={19} /></span>
              <span><span className="block text-sm font-bold text-gray-900">Give product feedback</span><span className="mt-0.5 block text-xs text-gray-500">Suggest a feature or report a bug</span></span>
            </Link>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
