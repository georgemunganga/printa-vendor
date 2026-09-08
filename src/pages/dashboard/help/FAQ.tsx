import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const FAQS = [
  { category: "Stores", question: "Why do I have to select a store?", answer: "Orders, POS sales, inventory, shifts, and store settings belong to a specific store. Select a store before opening those operational pages. Your selection is restored after a normal browser refresh." },
  { category: "Onboarding", question: "Why does the portal say vendor approval is pending?", answer: "The vendor application has been submitted but has not yet been approved. Complete every onboarding requirement and wait for Printa to approve the vendor before attempting store operations." },
  { category: "Orders", question: "What is the difference between a print job and a till sale?", answer: "A print job contains printable products and follows production states. A till sale records an ordinary custom product sold through POS and does not enter the print production queue." },
  { category: "Orders", question: "Why was an order status change rejected?", answer: "The order may already be in that state, or another operator may have updated it first. Refresh the order and use the next action shown by the authoritative backend state." },
  { category: "POS", question: "Can I accept Debit Card in POS?", answer: "No. Debit Card is currently marked Coming soon. Selecting a disabled method does not enable the Proceed button. Use an enabled payment method." },
  { category: "POS", question: "Can Printa email a POS receipt?", answer: "Yes. After completing a sale, choose Email receipt, enter the customer's email address, and send it. Printa sends the receipt through the system without opening your personal email app." },
  { category: "Inventory", question: "What belongs in custom inventory?", answer: "Use custom inventory for vendor-owned goods and services outside the Printa print catalogue, such as shoes or accessories. Enter a name and category, then set the price, stock, and POS visibility." },
  { category: "Inventory", question: "Why is an item missing from POS?", answer: "Confirm the item belongs to the selected store, has stock, and is marked Visible in POS. Hidden items remain in inventory but are unavailable at the till." },
  { category: "Subscriptions", question: "What vendor subscription plans are available?", answer: "The live catalogue currently presents Pro at K500 and Enterprise at K1,500. Always confirm the plan name, features, and amount shown on the Subscription page before paying." },
  { category: "Subscriptions", question: "How do I pay for a subscription?", answer: "Choose a configured plan, enter a mobile money number, select MTN, Airtel, or Zamtel, and approve the request on the phone. Avoid starting another payment while verification is pending." },
  { category: "Team", question: "Why can a staff member not see a page or action?", answer: "Navigation and actions depend on role, store access, and permissions. Ask the owner or an authorised manager to review that team member's access, then refresh the portal." },
  { category: "Account", question: "Why did the portal return me to the store list?", answer: "The previous store may no longer be available to the account, the staff PIN session may have ended, or the session may have expired. Select an authorised store again or sign in again when prompted." },
];

const categories = Array.from(new Set(FAQS.map((item) => item.category)));

const FAQ = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return FAQS.filter((item) => (category === "All" || item.category === category) && (!normalized || `${item.question} ${item.answer}`.toLowerCase().includes(normalized)));
  }, [category, query]);

  return (
    <DashboardLayout pageTitle="Frequently Asked Questions">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/dashboard/help" className="hover:text-gray-900">Help & Support</Link><ChevronRight size={13} /><span className="font-medium text-gray-900">FAQ</span>
        </nav>

        <header className="rounded-3xl bg-gray-950 p-7 text-white md:p-10">
          <h1 className="text-2xl font-bold md:text-4xl">Frequently asked questions</h1>
          <p className="mt-3 text-sm text-white/65">Answers based on the current Printa vendor workflows.</p>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search frequently asked questions" placeholder="Search questions" className="h-12 w-full rounded-xl bg-white pl-11 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-printa-red" />
          </div>
        </header>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {["All", ...categories].map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${category === item ? "bg-gray-950 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>{item}</button>)}
        </div>

        <section className="mt-4 space-y-3" aria-live="polite">
          {filtered.map((item) => {
            const open = openQuestion === item.question;
            return (
              <div key={item.question} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <button type="button" onClick={() => setOpenQuestion(open ? null : item.question)} aria-expanded={open} className="flex w-full items-start justify-between gap-4 p-5 text-left">
                  <span><span className="block text-[10px] font-semibold uppercase tracking-wide text-printa-red">{item.category}</span><span className="mt-1 block text-sm font-semibold text-gray-900 md:text-base">{item.question}</span></span>
                  <ChevronDown className={`mt-2 shrink-0 text-gray-400 transition ${open ? "rotate-180" : ""}`} size={18} />
                </button>
                {open && <p className="border-t border-gray-100 px-5 py-4 text-sm leading-6 text-gray-600">{item.answer}</p>}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">No questions match this search.</div>}
        </section>

        <div className="mt-8 rounded-2xl bg-printa-red p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div><h2 className="font-bold">Need account-specific help?</h2><p className="mt-1 text-sm text-white/75">Send a secure request from the portal.</p></div>
          <Link to="/dashboard/support" className="mt-4 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-900 sm:mt-0">Contact support</Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FAQ;
