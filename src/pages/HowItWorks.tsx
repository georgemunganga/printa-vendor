import React from 'react';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { Upload, MapPin, CreditCard, FileText, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Select Document Type",
      description: "Choose the type of document you want to print from our suggestions or search for specific options.",
      icon: FileText,
    },
    {
      id: 2,
      title: "Upload & Customize",
      description: "Upload your files and customize print settings like paper size, type, color, and other options.",
      icon: Upload,
    },
    {
      id: 3,
      title: "Specify Location",
      description: "Enter your current location or search for an address where you want your prints delivered.",
      icon: MapPin,
    },
    {
      id: 4,
      title: "Complete Payment",
      description: "Pay securely using your preferred payment method to confirm your order.",
      icon: CreditCard,
    },
    {
      id: 5,
      title: "Track & Receive",
      description: "Track your order in real-time and receive your prints at your specified location.",
      icon: Package,
    },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How It <span className="text-printa-red">Works</span></h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto">
              Get your documents printed in a few simple steps 
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Mobile Vertical Line */}
            <div className="md:hidden absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

            {/* Desktop Snake/Route Line - SVG */}
            <svg
              className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 50% 28
                   C 50% 60, 85% 80, 85% 116
                   L 85% 140
                   C 85% 176, 50% 196, 15% 216
                   L 15% 240
                   C 15% 276, 50% 296, 85% 316
                   L 85% 340
                   C 85% 376, 50% 396, 15% 416
                   L 15% 440
                   C 15% 476, 50% 496, 50% 516"
                stroke="#E71A1A"
                strokeWidth="2"
                strokeDasharray="8 6"
                strokeLinecap="round"
                fill="none"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </svg>

            {/* Steps */}
            <div className="space-y-12 md:space-y-16 relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                const isLast = index === steps.length - 1;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden flex gap-6">
                      {/* Icon */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-12 h-12 bg-printa-red rounded-2xl flex items-center justify-center shadow-sm">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <span className="text-xs font-semibold text-printa-red uppercase tracking-wide">
                          Step {step.id}
                        </span>
                        <h3 className="text-xl font-bold mt-1 mb-2">{step.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {/* Desktop Layout - Alternating */}
                    <div className="hidden md:flex items-center">
                      {/* Left Side */}
                      <div className={`w-1/2 ${isEven ? 'pr-16 text-right' : 'pr-16'}`}>
                        {isEven && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            <span className="text-xs font-semibold text-printa-red uppercase tracking-wide">
                              Step {step.id}
                            </span>
                            <h3 className="text-2xl font-bold mt-1 mb-2">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{step.description}</p>
                          </motion.div>
                        )}
                      </div>

                      {/* Center Icon */}
                      <div className="relative z-10 flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-14 h-14 bg-printa-red rounded-2xl flex items-center justify-center shadow-lg"
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>

                        {/* Horizontal connector lines */}
                        {!isLast && (
                          <>
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 h-0.5 bg-printa-red/20 ${
                                isEven ? 'left-full ml-2 w-[calc(50%-1rem)]' : 'right-full mr-2 w-[calc(50%-1rem)]'
                              }`}
                              style={{
                                background: 'linear-gradient(90deg, rgba(231,26,26,0.3) 0%, rgba(231,26,26,0.1) 100%)'
                              }}
                            />
                          </>
                        )}
                      </div>

                      {/* Right Side */}
                      <div className={`w-1/2 ${!isEven ? 'pl-16' : 'pl-16'}`}>
                        {!isEven && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            <span className="text-xs font-semibold text-printa-red uppercase tracking-wide">
                              Step {step.id}
                            </span>
                            <h3 className="text-2xl font-bold mt-1 mb-2">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{step.description}</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20 text-center"
          >
            <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Experience fast, reliable, and convenient printing services
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-printa-red text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              Start Printing
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-24"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "What file types can I print?",
                  answer: "Printa supports PDF, JPG, PNG, DOCX, XLSX, PPTX, and many more formats."
                },
                {
                  question: "How long does it take?",
                  answer: "Most orders are processed within 2-4 hours. Delivery times depend on your location."
                },
                {
                  question: "Can I track my order?",
                  answer: "Yes, you'll receive real-time updates on your order status in your dashboard."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6"
                >
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-500 text-sm">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default HowItWorks;
