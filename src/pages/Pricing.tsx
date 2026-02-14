
import React from 'react';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const personalFeatures = [
    'Upload from device or cloud',
    'Multiple document formats',
    'Basic print customization',
    'Home delivery or pickup',
    'Order tracking',
    'Pay-as-you-go pricing'
  ];

  const businessFeatures = [
    'All Personal features',
    'Bulk document printing',
    'Custom corporate branding',
    'Volume discounts',
    'Dedicated account manager',
    'Monthly billing options',
    'API integration'
  ];

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-24"
      >
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Whether you're an individual or a business, we have options for everyone.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Personal Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-8 border-b">
              <h3 className="text-2xl font-bold mb-2">Personal</h3>
              <p className="text-gray-600 mb-4">Perfect for individuals and students</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">K0</span>
                <span className="text-gray-500 ml-2">base fee</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Pay only for what you print</p>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4">
                {personalFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={20} className="text-printa-red mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/upload">
                <Button className="w-full mt-8" size="lg">
                  Start Printing
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Business Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden relative"
          >
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Coming Soon
              </Badge>
            </div>
            
            <div className="p-8 border-b">
              <h3 className="text-2xl font-bold mb-2">For Business</h3>
              <p className="text-gray-600 mb-4">Tailored for companies and organizations</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Volume-based pricing</p>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4">
                {businessFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={20} className="text-printa-red mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-8">
                      <Button variant="outline" className="w-full" size="lg" disabled>
                        Contact Sales
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Business plans coming soon!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-start">
            <AlertCircle size={24} className="text-printa-red mr-4 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-medium mb-2">Need a custom solution?</h4>
              <p className="text-gray-600 mb-4">
                We're developing tailored options for businesses of all sizes. Leave your email and we'll notify you when our business plans launch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="printa-input flex-grow" 
                />
                <Button variant="default">
                  Get Notified
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Pricing;


