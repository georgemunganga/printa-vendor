
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Package } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getWorkflowForCategory } from '@/data/customizationWorkflows';
import { patchVendorOnboardingState } from '@/lib/vendorOnboardingState';

const Customize = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') ?? undefined;
  const workflowGuide = getWorkflowForCategory(selectedCategory);

  const [workflowSelections, setWorkflowSelections] = useState<Record<number, string>>({});
  const [instructions, setInstructions] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [branchCount, setBranchCount] = useState('');
  const [enabledServices, setEnabledServices] = useState<string[]>([]);
  const [basePriceRule, setBasePriceRule] = useState('');
  const [fulfillmentMode, setFulfillmentMode] = useState<'pickup' | 'delivery' | 'both' | ''>('');
  const [hasEmployeePin, setHasEmployeePin] = useState(false);
  const workflowSteps = workflowGuide?.steps ?? [];
  const serviceChoices = ['Paper', 'Cards', 'Banners', 'Books', 'Apparel'];

  const handleWorkflowSelect = (stepIndex: number, choiceLabel: string) => {
    setWorkflowSelections(prev => ({
      ...prev,
      [stepIndex]: choiceLabel
    }));
  };

  const isStepComplete = (stepIndex: number) => workflowSelections[stepIndex] !== undefined;
  const allStepsComplete = workflowSteps.length > 0
    ? workflowSteps.every((_, index) => isStepComplete(index))
    : false;

  useEffect(() => {
    patchVendorOnboardingState({
      businessProfileDone: businessName.trim().length > 0 && branchCount.trim().length > 0,
      servicesDone: enabledServices.length > 0,
      pricingDone: basePriceRule.trim().length > 0,
      fulfillmentDone: fulfillmentMode !== '',
      teamSecurityDone: hasEmployeePin,
      specsCompleted: allStepsComplete,
    });
  }, [allStepsComplete, basePriceRule, branchCount, businessName, enabledServices.length, fulfillmentMode, hasEmployeePin]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-2 sm:px-4 py-16 sm:py-24 pt-8 sm:pt-10"
      >
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-2">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold lg:mb-2">
                {workflowGuide ? `Step 2: ${workflowGuide.name}` : 'Step 2: Customize Test Job'}
              </h1>
              <p className="text-gray-600 text-sm">
                Answer these setup questions to improve print quality, reduce rework, and speed up customer fulfillment.
              </p>
            </div>

            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-printa-red text-white flex items-center justify-center mr-2">
                  <Check size={14} />
                </span>
                Upload
              </span>
              <ArrowRight size={16} className="mx-2 text-gray-400" />
              <span className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-printa-red text-white flex items-center justify-center mr-2">2</span>
                Customize
              </span>
              <ArrowRight size={16} className="mx-2 text-gray-400" />
              <span className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">3</span>
                Checkout
              </span>
            </div>
          </div>

          {/* Workflow Questions - Same design for all categories */}
          {workflowGuide && workflowSteps.length > 0 && (
            <div className="space-y-6 mb-6">
              {workflowSteps.map((step, stepIndex) => {
                const selectedChoice = workflowSelections[stepIndex];
                return (
                  <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stepIndex * 0.1 }}
                    className="bg-white rounded-xl shadow-md p-4 sm:p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-printa-red font-semibold mb-1">Vendor Value Setup</p>
                        <h3 className="text-lg font-medium">{step.question}</h3>
                      </div>
                      {selectedChoice && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-printa-red text-white">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {step.choices.map(choice => {
                        const isSelected = selectedChoice === choice.label;
                        return (
                          <Button
                            key={choice.label}
                            variant={isSelected ? 'default' : 'ghost'}
                            onClick={() => handleWorkflowSelect(stepIndex, choice.label)}
                            className={`relative p-2.5 sm:p-4 rounded-xl sm:rounded-xl border-2 transition-all duration-200 h-auto min-h-[60px] sm:min-h-[70px] flex flex-col items-start justify-start text-left whitespace-normal overflow-hidden ${
                              isSelected
                                ? 'border-printa-red bg-printa-red text-white hover:bg-printa-red/90'
                                : 'border-gray-200 hover:border-black hover:bg-black hover:text-white'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-0.5 sm:p-1 rounded-full bg-white text-printa-red">
                                <Check size={10} className="sm:w-3 sm:h-3" />
                              </div>
                            )}
                            <div className="font-medium text-xs sm:text-sm leading-tight pr-5 sm:pr-6 break-words w-full">{choice.label}</div>
                            {choice.description && (
                              <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 leading-tight break-words w-full ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                {choice.description}
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="workflow-instructions" className="block text-sm font-semibold text-gray-700 mb-2">
              Service Notes
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Add operational notes your team should consistently apply for similar jobs.
            </p>
            <textarea
              id="workflow-instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="E.g., please bundle my prints with eco-friendly paper or include a note."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm leading-relaxed focus:border-printa-red focus:outline-none transition"
              rows={4}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-6 space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-printa-red font-semibold">Vendor Value Setup</p>
              <h3 className="text-lg font-semibold text-gray-900">Configure what directly impacts revenue and operations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name"
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm"
              />
              <input
                value={branchCount}
                onChange={(e) => setBranchCount(e.target.value)}
                placeholder="How many branches?"
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm"
              />
              <input
                value={basePriceRule}
                onChange={(e) => setBasePriceRule(e.target.value)}
                placeholder="Base price rule (e.g. A4 color starts at K5)"
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm md:col-span-2"
              />
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-2">Services you currently offer</p>
                <div className="flex flex-wrap gap-2">
                  {serviceChoices.map((svc) => {
                    const active = enabledServices.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => setEnabledServices((prev) => active ? prev.filter((p) => p !== svc) : [...prev, svc])}
                        className={`px-3 py-1.5 rounded-xl text-xs border transition ${active ? 'bg-printa-red text-white border-printa-red' : 'bg-white text-gray-700 border-gray-300'}`}
                      >
                        {svc}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-2">Fulfillment mode</p>
                <div className="flex gap-2">
                  {(['pickup', 'delivery', 'both'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFulfillmentMode(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition ${fulfillmentMode === m ? 'bg-printa-red text-white border-printa-red' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={hasEmployeePin}
                  onChange={(e) => setHasEmployeePin(e.target.checked)}
                />
                At least one employee PIN is configured
              </label>
            </div>
          </div>

          {!workflowGuide && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">No category selected</h3>
              <p className="text-sm text-gray-500 mb-4">
                Go back to the Print page and select what you'd like to print
              </p>
              <Link to="/" className="inline-flex items-center text-printa-red font-medium text-sm hover:underline">
                <ArrowLeft size={16} className="mr-1" /> Browse print options
              </Link>
            </div>
          )}

          {/* Summary Card - Shows when all options selected */}
          {workflowGuide && allStepsComplete && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 mb-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-printa-red text-white flex items-center justify-center">
                  <Check size={20} />
                </div>
                <div>
                  <p className="font-semibold text-green-800">All options selected!</p>
                  <p className="text-sm text-green-600">Great. You have a repeatable service setup and can proceed to checkout.</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 space-y-2">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-500">{step.question.replace('?', '')}</span>
                    <span className="font-medium text-gray-900">{workflowSelections[index]}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <Link to="/upload" className="flex items-center text-gray-500 hover:text-printa-red transition-colors">
              <ArrowLeft size={18} className="mr-2" /> Back
            </Link>
            <Link
              to="/checkout"
              className={`printa-btn-primary flex items-center ${
                workflowGuide && !allStepsComplete ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={(e) => {
                if (workflowGuide && !allStepsComplete) {
                  e.preventDefault();
                }
              }}
            >
              Continue to Checkout <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Customize;



