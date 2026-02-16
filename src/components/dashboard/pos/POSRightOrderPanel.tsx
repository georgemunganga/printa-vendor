import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CreditCard, Minus, Plus, ReceiptText, Smartphone, X, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PaymentMethod = "cash" | "card" | "ewallet";

interface OrderLineLike {
  service: {
    id: string;
    name: string;
    price: number;
  };
  qty: number;
}

interface ServiceCategoryLike {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

interface OrderSummaryProps {
  order: OrderLineLike[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCharge: () => void;
  catMap: Record<string, ServiceCategoryLike>;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  isOrderFloating?: boolean;
  layoutMode?: "desktop" | "mobile";
}

interface POSRightOrderPanelProps extends OrderSummaryProps {
  hasItems: boolean;
}

const paymentMethods = [
  { id: "cash" as const, label: "Cash", icon: Banknote },
  { id: "card" as const, label: "Debit Card", icon: CreditCard },
  { id: "ewallet" as const, label: "E-Wallet", icon: Smartphone },
];

export const POSOrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  subtotal,
  tax,
  total,
  itemCount,
  onUpdateQty,
  onRemove,
  onClear,
  onCharge,
  catMap,
  paymentMethod,
  onPaymentMethodChange,
  isOrderFloating = false,
  layoutMode = "desktop",
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const change = cashReceived ? parseFloat(cashReceived) - total : 0;
  const canCompleteCash = parseFloat(cashReceived) >= total;
  const canCompleteCard = cardNumber && cardExpiry && cardCVV;
  const canCompleteMobile = mobileNumber && mobileNumber.length >= 10;

  const resetPaymentForm = () => {
    setCashReceived("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVV("");
    setMobileNumber("");
    setIsProcessing(false);
  };

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    onCharge();
    setShowPaymentModal(false);
    resetPaymentForm();
  };

  const renderPaymentModal = () => (
    <ResponsiveModal
      open={showPaymentModal}
      onOpenChange={(open) => {
        if (!open) {
          setShowPaymentModal(false);
          resetPaymentForm();
        }
      }}
      title={`Complete ${paymentMethod === "cash" ? "Cash" : paymentMethod === "card" ? "Card" : "E-Wallet"} Payment`}
    >
      <div className="space-y-6 my-4">
        {/* Cash Payment */}
        {paymentMethod === "cash" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-printa-red to-printa-red rounded-2xl p-4 text-white text-center">
              <div className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-2">
                Bill Total
              </div>
              <div className="text-5xl font-bold mb-2">
                K{total.toFixed(2)}
              </div>
              <div className="text-sm opacity-80">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash-received" className="text-base font-semibold">
                Cash Received
              </Label>
              <Input
                id="cash-received"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="h-14 text-3xl font-semibold text-center"
                step="0.01"
                min={total}
              />
            </div>

            {cashReceived && parseFloat(cashReceived) >= total && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-2 border-green-200 rounded-2xl p-3 text-center"
              >
                <div className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2">
                  Change to Return
                </div>
                <div className="text-3xl font-bold text-green-700">
                  K{change.toFixed(2)}
                </div>
              </motion.div>
            )}

            {cashReceived && parseFloat(cashReceived) < total && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-semibold text-amber-700">
                  Insufficient amount. Need K{(total - parseFloat(cashReceived)).toFixed(2)} more.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Card Payment */}
        {paymentMethod === "card" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <CreditCard className="w-10 h-10" />
                <div className="text-right">
                  <div className="text-sm opacity-80">Amount to Charge</div>
                  <div className="text-3xl font-bold">K{total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="h-12 text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Expiry Date</Label>
                <Input
                  id="card-expiry"
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setCardExpiry(value);
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-cvv">CVV</Label>
                <Input
                  id="card-cvv"
                  type="text"
                  value={cardCVV}
                  onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength={3}
                  className="h-12 text-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* E-Wallet / Mobile Money Payment */}
        {paymentMethod === "ewallet" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Smartphone className="w-10 h-10" />
                <div className="text-right">
                  <div className="text-sm opacity-80">Amount to Charge</div>
                  <div className="text-3xl font-bold">K{total.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-sm opacity-90">
                Customer will receive a prompt on their phone
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile-number" className="text-base font-semibold">
                Mobile Money Number
              </Label>
              <Input
                id="mobile-number"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="0971234567"
                maxLength={10}
                className="h-14 text-xl font-semibold"
              />
              <p className="text-xs text-gray-500">
                Enter customer's mobile money number (MTN, Airtel, or Zamtel)
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowPaymentModal(false);
              resetPaymentForm();
            }}
            disabled={isProcessing}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompletePayment}
            disabled={
              isProcessing ||
              (paymentMethod === "cash" && !canCompleteCash) ||
              (paymentMethod === "card" && !canCompleteCard) ||
              (paymentMethod === "ewallet" && !canCompleteMobile)
            }
            className="flex-1 h-12 bg-printa-red hover:bg-red-700"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Complete Payment
              </>
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );

  if (layoutMode === "mobile") {
    return (
      <div className="flex h-full min-h-0 flex-col bg-gray-50">
        <div
          className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-36 space-y-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {order.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ReceiptText size={32} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-400">Tap a service to add it</p>
            </div>
          ) : (
            <>
              {order.map((line, index) => (
                <div key={line.service.id} className="rounded-2xl bg-white border border-gray-200 px-3.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-gray-900 truncate">{line.service.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">x{line.qty}</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900 whitespace-nowrap">
                      K{(line.service.price * line.qty).toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(line.service.id, -1)}
                      className="w-7 h-7 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center"
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(line.service.id, 1)}
                      className="w-7 h-7 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(line.service.id)}
                      className="w-7 h-7 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="w-full h-12 rounded-xl border border-gray-300 bg-white text-gray-700 text-xl font-medium"
              >
                + Add
              </button>
            </>
          )}
        </div>

        {order.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-200 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">K{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (16%)</span>
                <span className="font-medium text-gray-800">K{tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-gray-300 flex justify-between text-2xl font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">K{total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleOpenPaymentModal}
              className="w-full text-white text-base font-semibold"
            >
              Place Order
            </Button>
          </div>
        )}

        {/* Payment Modal */}
        {renderPaymentModal()}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex bg-white rounded-xl items-center justify-between px-5 pt-5 pb-3 ${isOrderFloating ? "shadow-sm" : ""}`}>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Order</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {order.length === 0 ? "No items" : `${itemCount} item${itemCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        {order.length > 0 && (
          <button type="button" onClick={onClear} className="text-[11px] text-red-500 font-medium hover:text-red-600 transition">
            Clear all
          </button>
        )}
      </div>

      <div className="mx-5 bg-white" />

      <div
        className={`flex-1 bg-white min-h-0 overflow-y-auto scrollbar-hide rounded-xl my-2 py-2 space-y-2 ${
          isOrderFloating ? "shadow-sm" : ""
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {order.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ReceiptText size={32} className="text-gray-200 mb-3" />
            <p className="text-xs font-medium text-gray-300">Tap a service to add it</p>
          </div>
        ) : (
          order.map((line, index) => (
            <div
              key={line.service.id}
              className="flex  items-center gap-3  bg-gray-50 mx-2 rounded-xl px-3 py-2.5 group"
            >
              <div className="w-6 h-6 rounded-full bg-gray-200/80 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-gray-500">{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-800 truncate">{line.service.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(line.service.id, -1)}
                    className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    <Minus size={9} className="text-gray-500" />
                  </button>
                  <span className="text-[10px] font-bold text-gray-500 w-4 text-center">x{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(line.service.id, 1)}
                    className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    <Plus size={9} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] font-bold text-gray-800 whitespace-nowrap">
                K{(line.service.price * line.qty).toFixed(2)}
              </p>

              <button
                type="button"
                onClick={() => onRemove(line.service.id)}
                className="p-0.5 text-printa-black bg-gray-50 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {order.length > 0 && (
        <div className="rounded-xl bg-white border-gray-100 px-5 pt-4 pb-5 space-y-4">
          <div className="border-printa-red space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-gray-600 font-medium">K{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Tax (16%)</span>
              <span className="text-gray-600 font-medium">K{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-dashed border-gray-200 mt-1.5">
              <span>Total</span>
              <span>K{total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-1.5">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => onPaymentMethodChange(pm.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-semibold transition ${
                      active
                        ? "bg-printa-red text-white shadow-sm"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {pm.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleOpenPaymentModal}
            className="w-full bg-printa-red hover:bg-red-700 text-white rounded-xl h-11 text-sm font-bold"
          >
            Place Order - K{total.toFixed(2)}
          </Button>
        </div>
      )}

      {/* Payment Modal */}
      {renderPaymentModal()}
    </div>
  );
};

export const POSRightOrderPanel: React.FC<POSRightOrderPanelProps> = ({
  hasItems,
  order,
  subtotal,
  tax,
  total,
  itemCount,
  onUpdateQty,
  onRemove,
  onClear,
  onCharge,
  catMap,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  const [isOrderFloating, setIsOrderFloating] = useState(false);
  const [orderFloatLeft, setOrderFloatLeft] = useState<number | null>(null);
  const [orderFloatWidth, setOrderFloatWidth] = useState<number | null>(null);
  const orderAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateFloatingState = () => {
      const isDesktop = window.innerWidth >= 1024;
      const shouldFloat = isDesktop && hasItems && window.scrollY > 12;
      setIsOrderFloating(shouldFloat);

      const rect = orderAnchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      setOrderFloatLeft(rect.left);
      setOrderFloatWidth(rect.width);
    };

    updateFloatingState();
    window.addEventListener("scroll", updateFloatingState, { passive: true });
    window.addEventListener("resize", updateFloatingState);
    return () => {
      window.removeEventListener("scroll", updateFloatingState);
      window.removeEventListener("resize", updateFloatingState);
    };
  }, [hasItems]);

  return (
    <AnimatePresence>
      {hasItems && (
        <div ref={orderAnchorRef} className="hidden lg:block w-[340px] h-[calc(100dvh-1rem)] flex-shrink-0 self-start">
          <div
            className={isOrderFloating ? "fixed top-2 z-30" : "relative"}
            style={
              isOrderFloating && orderFloatLeft !== null && orderFloatWidth !== null
                ? { left: orderFloatLeft, width: orderFloatWidth }
                : undefined
            }
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`h-[calc(100dvh-1rem)] rounded-2xl  flex flex-col overflow-hidden transition-all duration-300 `}
            >
              <POSOrderSummary
                order={order}
                subtotal={subtotal}
                tax={tax}
                total={total}
                itemCount={itemCount}
                onUpdateQty={onUpdateQty}
                onRemove={onRemove}
                onClear={onClear}
                onCharge={onCharge}
                catMap={catMap}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={onPaymentMethodChange}
                isOrderFloating={isOrderFloating}
              />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
