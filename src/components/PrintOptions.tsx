
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface PrintOption {
  id: string;
  name: string;
  description?: string;
  options: {
    id: string;
    name: string;
    image?: string;
    description?: string;
    price?: number;
  }[];
}

interface PrintOptionsProps {
  onOptionsSelected: (options: Record<string, string>) => void;
}

export const PrintOptions: React.FC<PrintOptionsProps> = ({ onOptionsSelected }) => {
  const printOptions: PrintOption[] = [
    {
      id: 'paperSize',
      name: 'Paper Size',
      options: [
        { id: 'a4', name: 'A4', description: '210 × 297 mm' },
        { id: 'a3', name: 'A3', description: '297 × 420 mm', price: 5 },
        { id: 'letter', name: 'US Letter', description: '8.5 × 11 inches' },
        { id: 'legal', name: 'US Legal', description: '8.5 × 14 inches', price: 3 },
      ]
    },
    {
      id: 'paperType',
      name: 'Paper Type',
      options: [
        { id: 'standard', name: 'Standard', description: '80 gsm' },
        { id: 'premium', name: 'Premium', description: '100 gsm', price: 2 },
        { id: 'glossy', name: 'Glossy', description: 'Photo quality', price: 5 },
        { id: 'recycled', name: 'Recycled', description: 'Eco-friendly' },
      ]
    },
    {
      id: 'printColor',
      name: 'Print Color',
      options: [
        { id: 'bw', name: 'Black & White' },
        { id: 'color', name: 'Full Color', price: 8 },
      ]
    },
    {
      id: 'printSides',
      name: 'Print Sides',
      options: [
        { id: 'single', name: 'Single-sided' },
        { id: 'double', name: 'Double-sided', price: 2 },
      ]
    },
  ];

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({
    paperSize: 'a4',
    paperType: 'standard',
    printColor: 'bw',
    printSides: 'single',
  });

  const handleOptionChange = (categoryId: string, optionId: string) => {
    const newOptions = {
      ...selectedOptions,
      [categoryId]: optionId,
    };
    setSelectedOptions(newOptions);
    onOptionsSelected(newOptions);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {printOptions.map((category, categoryIndex) => (
          <motion.div 
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{category.name}</h3>
              
              {category.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="p-1 text-gray-400 hover:text-printa-red rounded-full">
                        <Info size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {category.options.map((option) => {
                const isSelected = selectedOptions[category.id] === option.id;
                
                return (
                  <Button
                    key={option.id}
                    onClick={() => handleOptionChange(category.id, option.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-printa-red bg-red-50' 
                        : 'border-gray-200 hover:border-printa-red'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-printa-red text-white">
                        <Check size={12} />
                      </div>
                    )}
                    
                    {option.image && (
                      <div className="mb-2">
                        <img 
                          src={option.image} 
                          alt={option.name} 
                          className="h-12 w-auto mx-auto object-contain" 
                        />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="font-medium text-sm">{option.name}</div>
                      
                      {option.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {option.description}
                        </div>
                      )}
                      
                      {option.price && (
                        <div className="text-xs font-medium text-printa-red mt-1">
                          +${option.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
