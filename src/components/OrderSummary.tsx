
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Truck, ShoppingBag, CreditCard, AlertCircle, Check, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface OrderSummaryProps {
  files: File[];
  printOptions: Record<string, string>;
  locationId: string | null;
  isDelivery?: boolean;
  onCheckout: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  files,
  printOptions,
  locationId,
  isDelivery = false,
  onCheckout
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Mock data for price calculation
  const prices = {
    basePricePerPage: 0.15,
    paperSizes: {
      a4: 0,
      a3: 5,
      letter: 0,
      legal: 3,
    },
    paperTypes: {
      standard: 0,
      premium: 2,
      glossy: 5,
      recycled: 0,
    },
    printColors: {
      bw: 0,
      color: 8,
    },
    printSides: {
      single: 0,
      double: 2,
    },
    delivery: 5.99,
  };

  // Mock location data
  const locations = {
    loc1: {
      name: 'University Print Center',
      address: '123 Campus Drive, Lusaka',
    },
    loc2: {
      name: 'Central Print Shop',
      address: '456 Town center,Lusaka',
    },
    loc3: {
      name: 'Quick Print Services',
      address: '789 Business Avenue,Lusaka',
    },
    loc4: {
      name: 'Community Print Center',
      address: 'City Market, Lusaka',
    },
  };

  // Calculate total pages
  const totalPages = files.length * 5; // Assuming 5 pages per file for demo

  // Calculate base price
  const basePrice = totalPages * prices.basePricePerPage;

  // Calculate additional costs
  const paperSizePrice = prices.paperSizes[printOptions.paperSize as keyof typeof prices.paperSizes] || 0;
  const paperTypePrice = prices.paperTypes[printOptions.paperType as keyof typeof prices.paperTypes] || 0;
  const printColorPrice = prices.printColors[printOptions.printColor as keyof typeof prices.printColors] || 0;
  const printSidesPrice = prices.printSides[printOptions.printSides as keyof typeof prices.printSides] || 0;

  // Calculate subtotal
  const subtotal = basePrice + paperSizePrice + paperTypePrice + printColorPrice + printSidesPrice;

  // Calculate delivery fee
  const deliveryFee = isDelivery ? prices.delivery : 0;

  // Calculate tax (assumed 7%)
  const tax = 0.07 * subtotal;

  // Calculate total
  const total = subtotal + deliveryFee + tax;

  const formatPrice = (price: number) => {
    return `K${price.toFixed(2)}`;
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
        </div>

        <div className="p-4 sm:p-6">
          {/* Order details */}
          <div className="space-y-4 sm:space-y-6">
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
                      <span className="shrink-0">{formatPrice(prices.basePricePerPage * 5)}</span>
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
                    <p className="font-medium">{(locations as any)[locationId]?.name}</p>
                    <p className="truncate">{(locations as any)[locationId]?.address}</p>
                  </div>
                )}
                {isDelivery && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>Delivery to your address</p>
                    <p className="text-printa-red font-medium">{formatPrice(deliveryFee)}</p>
                  </div>
                )}
                {!locationId && !isDelivery && (
                  <p className="text-xs sm:text-sm text-gray-400">Select a location above</p>
                )}
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-red-50 text-red-600 mr-3 sm:mr-4 shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-2">Estimated Ready Time</h3>
                <div className="text-xs sm:text-sm text-gray-600">
                  {isDelivery ? (
                    <p>Delivery in 24-48 hours</p>
                  ) : (
                    <p>Ready for pickup in 2-4 hours</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
            <h3 className="font-medium text-sm mb-3 sm:mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'ghost'}
                onClick={() => setPaymentMethod('card')}
                className={`relative p-3 sm:p-4 rounded-xl sm:rounded-xl border-2 transition-all duration-200 h-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                  paymentMethod === 'card'
                    ? 'border-printa-red bg-printa-red text-white hover:bg-printa-red/90'
                    : 'border-gray-200 hover:border-black hover:bg-black hover:text-white'
                }`}
              >
                {paymentMethod === 'card' && (
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-0.5 sm:p-1 rounded-full bg-white text-printa-red">
                    <Check size={10} className="sm:w-3 sm:h-3" />
                  </div>
                )}
                <CreditCard size={18} />
                <span className="text-xs sm:text-sm">Card</span>
              </Button>
              <Button
                variant={paymentMethod === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setPaymentMethod('mobile')}
                className={`relative p-3 sm:p-4 rounded-xl sm:rounded-xl border-2 transition-all duration-200 h-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                  paymentMethod === 'mobile'
                    ? 'border-printa-red bg-printa-red text-white hover:bg-printa-red/90'
                    : 'border-gray-200 hover:border-black hover:bg-black hover:text-white'
                }`}
              >
                {paymentMethod === 'mobile' && (
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-0.5 sm:p-1 rounded-full bg-white text-printa-red">
                    <Check size={10} className="sm:w-3 sm:h-3" />
                  </div>
                )}
                <Smartphone className="text-dark" />
                <span className="text-xs sm:text-sm">Mobile Money</span>
              </Button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {isDelivery && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Tax (7%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-medium pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-printa-red">{formatPrice(total)}</span>
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
            className="w-full bg-printa-red text-white hover:bg-printa-red/90 rounded-xl py-3 text-sm sm:text-base font-medium"
          >
            Complete Order
          </Button>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            Need help? <Link to="/support" className="text-printa-red hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
