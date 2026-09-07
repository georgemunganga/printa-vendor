
import React from 'react';
import { CheckCircle, MapPin, Truck, ShoppingBag, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface OrderSummaryProps {
  files: Array<{ name: string }>;
  printOptions: Record<string, string>;
  locationId: string | null;
  isDelivery?: boolean;
  onCheckout: () => void;
  offerings: Array<{ id: string; name: string; unitPrice: number; currency: string }>;
  selectedOfferingId: string;
  onOfferingChange: (id: string) => void;
  storeName?: string;
  storeAddress?: string;
  isLoadingOfferings?: boolean;
  offeringError?: string;
  isSubmitting?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  files,
  printOptions,
  locationId,
  isDelivery = false,
  onCheckout,
  offerings,
  selectedOfferingId,
  onOfferingChange,
  storeName,
  storeAddress,
  isLoadingOfferings = false,
  offeringError,
  isSubmitting = false,
}) => {
  const selectedOffering = offerings.find((offering) => offering.id === selectedOfferingId);
  const quantity = Math.max(files.length, 1);
  const subtotal = (selectedOffering?.unitPrice ?? 0) * quantity;
  const currency = selectedOffering?.currency ?? 'ZMW';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZM', { style: 'currency', currency }).format(price);
  };

  const getOptionLabel = (category: string, optionId: string) => {
    const options: Record<string, Record<string, string>> = {
      paperSize: {
        a4: 'A4',
        a3: 'A3',
        letter: 'US Letter',
        legal: 'US Legal',
      },
      paperType: {
        standard: 'Standard',
        premium: 'Premium',
        glossy: 'Glossy',
        recycled: 'Recycled',
      },
      printColor: {
        bw: 'Black & White',
        color: 'Full Color',
      },
      printSides: {
        single: 'Single-sided',
        double: 'Double-sided',
      },
    };

    return options[category]?.[optionId] || optionId;
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-t-2xl shadow-md overflow-hidden">
        <div className="p-4 py-0 sm:p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Order Summary</h2>
          <p className="text-xs text-gray-500 mt-1">Create a live test job for your active store.</p>
        </div>

        <div className="p-4 sm:p-6">
          {/* Order details */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="test-order-offering" className="mb-2 block text-sm font-medium text-gray-800">
                Store offering
              </label>
              <select
                id="test-order-offering"
                value={selectedOfferingId}
                onChange={(event) => onOfferingChange(event.target.value)}
                disabled={isLoadingOfferings || offerings.length === 0}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-printa-red focus:ring-2 focus:ring-printa-red/10 disabled:bg-gray-50"
              >
                <option value="">{isLoadingOfferings ? 'Loading offerings…' : 'Select an offering'}</option>
                {offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.name} · {new Intl.NumberFormat('en-ZM', { style: 'currency', currency: offering.currency }).format(offering.unitPrice)}
                  </option>
                ))}
              </select>
              {offeringError && <p className="mt-2 text-xs text-red-600">{offeringError}</p>}
              {!isLoadingOfferings && !offeringError && offerings.length === 0 && (
                <p className="mt-2 text-xs text-amber-700">Add and enable at least one inventory item before creating a test order.</p>
              )}
            </div>

            {/* Files */}
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-red-50 text-printa-red mr-3 sm:mr-4 shrink-0">
                <ShoppingBag size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-2">Print Items</h3>
                <div className="space-y-1.5">
                  {files.map((file, index) => (
                    <div key={index} className="text-xs sm:text-sm text-gray-600 flex justify-between gap-2">
                      <span className="truncate">{file.name}</span>
                      <span className="shrink-0 text-gray-400">Uploaded</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Print Options */}
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-red-50 text-red-600 mr-3 sm:mr-4 shrink-0">
                <CheckCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-2">Print Options</h3>
                <div className="space-y-1.5">
                  {Object.entries(printOptions).map(([category, optionId]) => (
                    <div key={category} className="text-xs sm:text-sm text-gray-600 flex justify-between gap-2">
                      <span className="truncate">{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      <span className="shrink-0">{getOptionLabel(category, optionId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pickup/Delivery */}
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-red-50 text-red-600 mr-3 sm:mr-4 shrink-0">
                {isDelivery ? <Truck size={18} /> : <MapPin size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-2">{isDelivery ? 'Delivery' : 'Pickup'}</h3>
                {locationId && !isDelivery && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p className="font-medium">{storeName}</p>
                    <p className="truncate">{storeAddress}</p>
                  </div>
                )}
                {isDelivery && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>Delivery to your address</p>
                    <p className="text-gray-500">Configured delivery charges are applied by the server.</p>
                  </div>
                )}
                {!locationId && !isDelivery && (
                  <p className="text-xs sm:text-sm text-gray-400">Select a location above</p>
                )}
              </div>
            </div>

          </div>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 sm:mt-8">
            This onboarding order does not collect payment. Use POS or the customer checkout payment flow for paid orders.
          </div>

          {/* Price Summary */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-medium pt-2 border-t border-gray-100">
                <span>Offering total</span>
                <span className="text-printa-red">{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl flex items-start">
            <AlertCircle size={16} className="text-blue-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-blue-800">
              By placing this order, you agree to Printa's <Link to="/terms" className="text-printa-red underline">Terms</Link> and <Link to="/privacy" className="text-printa-red underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100">
          <Button
            onClick={onCheckout}
            disabled={isSubmitting || !selectedOfferingId || !locationId || files.length === 0}
            className="w-full bg-printa-red text-white hover:bg-printa-red/90 rounded-xl py-3 text-sm sm:text-base font-medium"
          >
            {isSubmitting ? 'Creating test order…' : 'Create Live Test Order'}
          </Button>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            Need help? <Link to="/support" className="text-printa-red hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
