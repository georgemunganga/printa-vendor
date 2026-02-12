import React, { useState } from "react";
import { CreditCard, Plus, Check, MoreVertical, Smartphone, Wallet, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaymentCard {
  id: string;
  type: "visa" | "mastercard";
  last4: string;
  owner: string;
  expiry: string;
  isDefault: boolean;
}

const cards: PaymentCard[] = [
  { id: "card-1", type: "visa", last4: "1234", owner: "George Parker", expiry: "02/28", isDefault: true },
  { id: "card-2", type: "mastercard", last4: "9867", owner: "George Parker", expiry: "10/26", isDefault: false },
];

const otherMethods = [
  { id: "mpesa", name: "M-Pesa", icon: Smartphone, color: "bg-printa-red", connected: true },
  { id: "wallet", name: "Printa Wallet", icon: Wallet, color: "bg-printa-red", connected: false },
];

type ModalType = "add-card" | "mpesa" | "wallet" | null;

const PaymentMethodsPage = () => {
  const [paymentCards, setPaymentCards] = useState(cards);
  const [methods, setMethods] = useState(otherMethods);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  // M-Pesa state
  const [mpesaPhone, setMpesaPhone] = useState("+254 712 345 678");
  const [mpesaAutoDebit, setMpesaAutoDebit] = useState(false);

  // Wallet state
  const [walletAutoTopup, setWalletAutoTopup] = useState(false);
  const [walletTopupAmount, setWalletTopupAmount] = useState("500");

  const handleSetDefault = (id: string) => {
    setPaymentCards(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === id
    })));
    toast.success("Default payment updated");
  };

  const handleDeleteCard = (id: string) => {
    setPaymentCards(prev => prev.filter(card => card.id !== id));
    toast.success("Card removed");
  };

  const handleAddCard = () => {
    if (!cardForm.cardNumber || !cardForm.expiry || !cardForm.cvv || !cardForm.name) {
      toast.error("Please fill in all card details");
      return;
    }

    const last4 = cardForm.cardNumber.replace(/\s/g, "").slice(-4);
    const isVisa = cardForm.cardNumber.startsWith("4");

    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      type: isVisa ? "visa" : "mastercard",
      last4,
      owner: cardForm.name,
      expiry: cardForm.expiry,
      isDefault: paymentCards.length === 0,
    };

    setPaymentCards(prev => [...prev, newCard]);
    toast.success("Card added successfully");
    setActiveModal(null);
    setCardForm({ cardNumber: "", expiry: "", cvv: "", name: "" });
  };

  const handleConnectMpesa = () => {
    setMethods(prev => prev.map(m =>
      m.id === "mpesa" ? { ...m, connected: true } : m
    ));
    toast.success("M-Pesa connected successfully");
    setActiveModal(null);
  };

  const handleConnectWallet = () => {
    setMethods(prev => prev.map(m =>
      m.id === "wallet" ? { ...m, connected: true } : m
    ));
    toast.success("Printa Wallet activated");
    setActiveModal(null);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <DashboardLayout pageTitle="Payment">
      <div className="space-y-4 md:max-w-3xl md:mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="dashboard-page-heading">
            <h1 className="dashboard-page-title">Payment Methods</h1>
            <p className="dashboard-page-subtitle">
              Manage your cards & wallets
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("add-card")}
            className="flex items-center gap-1.5 rounded-xl bg-printa-red px-3 py-2 md:px-4 text-xs md:text-sm font-semibold text-white shadow-sm transition active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Add New</span>
          </button>
        </div>

        {/* Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Cards
          </h2>
          <div className="space-y-3">
            {paymentCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  card.isDefault ? "border-printa-red/30" : "border-gray-100"
                }`}
              >
                <div className="p-4 md:p-5">
                  <div className="flex items-center gap-3">
                    {/* Card Icon */}
                    <div className={`p-3 rounded-xl ${
                      card.type === "visa" ? "bg-printa-red" : "bg-orange-500"
                    } text-white`}>
                      <CreditCard size={20} />
                    </div>

                    {/* Card Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {card.type === "visa" ? "Visa" : "Mastercard"} •••• {card.last4}
                        </p>
                        {card.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Check size={10} />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Expires {card.expiry}
                      </p>
                    </div>

                    {/* Actions */}
                    {!card.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(card.id)}
                        className="text-xs font-semibold text-printa-red hover:underline"
                      >
                        Set Default
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-rose-500 focus:text-rose-500"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Remove Card
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Other Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Other Methods
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-4 md:p-5"
                >
                  <div className={`p-2.5 rounded-xl ${method.color} text-white`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-500">
                      {method.connected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(method.id as "mpesa" | "wallet")}
                    className={`text-xs font-semibold ${
                      method.connected ? "text-gray-500" : "text-printa-red"
                    }`}
                  >
                    {method.connected ? "Manage" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center"
        >
          <p className="text-xs text-gray-500">
            All transactions are secured with bank-level encryption
          </p>
        </motion.div>
      </div>

      {/* Add Card Modal */}
      <ResponsiveModal
        open={activeModal === "add-card"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <CreditCard size={20} className="text-printa-red" />
            Add New Card
          </span>
        }
        description="Enter your card details to save for future payments"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="card-name" className="text-sm font-medium">Cardholder Name</Label>
            <Input
              id="card-name"
              placeholder="Name on card"
              value={cardForm.name}
              onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-number" className="text-sm font-medium">Card Number</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardForm.cardNumber}
              onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
              maxLength={19}
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-sm font-medium">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={cardForm.expiry}
                onChange={(e) => setCardForm(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                maxLength={5}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                value={cardForm.cvv}
                onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                maxLength={4}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setActiveModal(null)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            className="bg-printa-red hover:bg-printa-red/90 rounded-xl"
            onClick={handleAddCard}
          >
            Add Card
          </Button>
        </div>
      </ResponsiveModal>

      {/* M-Pesa Modal */}
      <ResponsiveModal
        open={activeModal === "mpesa"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Smartphone size={20} className="text-printa-red" />
            M-Pesa Settings
          </span>
        }
        description={methods.find(m => m.id === "mpesa")?.connected
          ? "Manage your M-Pesa payment settings"
          : "Connect your M-Pesa account for mobile payments"}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mpesa-phone" className="text-sm font-medium">M-Pesa Phone Number</Label>
            <Input
              id="mpesa-phone"
              placeholder="+254 7XX XXX XXX"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
            <div className="space-y-0.5">
              <Label htmlFor="mpesa-auto" className="text-sm font-medium">Auto-debit</Label>
              <p className="text-xs text-gray-500">Automatically deduct payments</p>
            </div>
            <Switch
              id="mpesa-auto"
              checked={mpesaAutoDebit}
              onCheckedChange={setMpesaAutoDebit}
              className="data-[state=checked]:bg-printa-red"
            />
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-xs text-emerald-700">
              You will receive an STK push to confirm each payment on your phone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setActiveModal(null)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            className="bg-printa-red hover:bg-printa-red/90 rounded-xl"
            onClick={handleConnectMpesa}
          >
            {methods.find(m => m.id === "mpesa")?.connected ? "Save Changes" : "Connect M-Pesa"}
          </Button>
        </div>
      </ResponsiveModal>

      {/* Wallet Modal */}
      <ResponsiveModal
        open={activeModal === "wallet"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Wallet size={20} className="text-printa-red" />
            Printa Wallet
          </span>
        }
        description={methods.find(m => m.id === "wallet")?.connected
          ? "Manage your Printa Wallet settings"
          : "Activate your Printa Wallet for faster checkouts"}
      >
        <div className="space-y-4 py-4">
          {methods.find(m => m.id === "wallet")?.connected && (
            <div className="rounded-xl bg-gradient-to-r from-printa-red to-rose-500 p-4 text-white">
              <p className="text-xs opacity-80">Available Balance</p>
              <p className="text-2xl font-bold mt-1">KES 0.00</p>
            </div>
          )}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
            <div className="space-y-0.5">
              <Label htmlFor="wallet-topup" className="text-sm font-medium">Auto Top-up</Label>
              <p className="text-xs text-gray-500">Automatically add funds when low</p>
            </div>
            <Switch
              id="wallet-topup"
              checked={walletAutoTopup}
              onCheckedChange={setWalletAutoTopup}
              className="data-[state=checked]:bg-printa-red"
            />
          </div>
          {walletAutoTopup && (
            <div className="space-y-2">
              <Label htmlFor="topup-amount" className="text-sm font-medium">Top-up Amount (KES)</Label>
              <Input
                id="topup-amount"
                placeholder="500"
                value={walletTopupAmount}
                onChange={(e) => setWalletTopupAmount(e.target.value.replace(/\D/g, ""))}
                className="rounded-xl"
              />
            </div>
          )}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs text-blue-700">
              Printa Wallet offers instant payments and exclusive discounts on print orders.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setActiveModal(null)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            className="bg-printa-red hover:bg-printa-red/90 rounded-xl"
            onClick={handleConnectWallet}
          >
            {methods.find(m => m.id === "wallet")?.connected ? "Save Changes" : "Activate Wallet"}
          </Button>
        </div>
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default PaymentMethodsPage;
