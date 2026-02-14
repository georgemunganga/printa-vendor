import type { ElementType } from 'react';
import { FileText, Receipt, Award, Mail, Briefcase, DollarSign, GraduationCap, LayoutGrid } from 'lucide-react';

// ============================================
// FIELD TYPES
// ============================================

export type FieldType = 'text' | 'number' | 'date' | 'textarea';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  defaultValue: string;
  placeholder?: string;
}

// ============================================
// TEMPLATE DEFINITION
// ============================================

export type DigitalTemplateCategory = 'business' | 'finance' | 'education' | 'general';

export interface DigitalTemplateDef {
  id: string;
  name: string;
  category: DigitalTemplateCategory;
  description: string;
  thumbnail: string;
  fields: FieldDef[];
}

// ============================================
// CATEGORY META
// ============================================

export interface DigitalTemplateCategoryMeta {
  name: string;
  icon: ElementType;
}

export const DIGITAL_TEMPLATE_CATEGORY_META: Record<DigitalTemplateCategory, DigitalTemplateCategoryMeta> = {
  business: { name: 'Business', icon: Briefcase },
  finance: { name: 'Finance', icon: DollarSign },
  education: { name: 'Education', icon: GraduationCap },
  general: { name: 'General', icon: LayoutGrid },
};

// ============================================
// CATALOG
// ============================================

export const digitalTemplatesCatalog: DigitalTemplateDef[] = [
  {
    id: 'invoice-standard',
    name: 'Standard Invoice',
    category: 'finance',
    description: 'Professional invoice with itemized billing',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text', defaultValue: 'Your Company', placeholder: 'Acme Inc.' },
      { key: 'clientName', label: 'Client Name', type: 'text', defaultValue: 'Client Name', placeholder: 'John Doe' },
      { key: 'invoiceNumber', label: 'Invoice #', type: 'text', defaultValue: 'INV-001' },
      { key: 'date', label: 'Date', type: 'date', defaultValue: '' },
      { key: 'items', label: 'Items', type: 'textarea', defaultValue: 'Design services — $500.00\nDevelopment — $1,200.00', placeholder: 'Item — $0.00' },
      { key: 'total', label: 'Total', type: 'text', defaultValue: '$1,700.00', placeholder: '$0.00' },
    ],
  },
  {
    id: 'receipt-standard',
    name: 'Sales Receipt',
    category: 'finance',
    description: 'Simple receipt for transactions',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    fields: [
      { key: 'storeName', label: 'Store / Business Name', type: 'text', defaultValue: 'Your Store', placeholder: 'Store Name' },
      { key: 'receiptNumber', label: 'Receipt #', type: 'text', defaultValue: 'REC-001' },
      { key: 'date', label: 'Date', type: 'date', defaultValue: '' },
      { key: 'items', label: 'Items', type: 'textarea', defaultValue: 'Product A × 2 — $20.00\nProduct B × 1 — $15.00', placeholder: 'Item — $0.00' },
      { key: 'total', label: 'Total', type: 'text', defaultValue: '$35.00', placeholder: '$0.00' },
      { key: 'paymentMethod', label: 'Payment Method', type: 'text', defaultValue: 'Cash', placeholder: 'Cash / Card / Transfer' },
    ],
  },
  {
    id: 'certificate-standard',
    name: 'Certificate',
    category: 'education',
    description: 'Award or completion certificate',
    thumbnail: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&h=300&fit=crop',
    fields: [
      { key: 'recipientName', label: 'Recipient Name', type: 'text', defaultValue: 'Recipient Name', placeholder: 'Jane Smith' },
      { key: 'achievement', label: 'Achievement / Course', type: 'text', defaultValue: 'Certificate of Completion', placeholder: 'Course or achievement' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: 'For successfully completing the program requirements.', placeholder: 'Details...' },
      { key: 'date', label: 'Date', type: 'date', defaultValue: '' },
      { key: 'issuerName', label: 'Issued By', type: 'text', defaultValue: 'Organization Name', placeholder: 'Issuer name' },
      { key: 'issuerTitle', label: 'Issuer Title', type: 'text', defaultValue: 'Director', placeholder: 'Title' },
    ],
  },
  {
    id: 'letter-business',
    name: 'Business Letter',
    category: 'business',
    description: 'Formal business letter template',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
    fields: [
      { key: 'senderName', label: 'Sender Name', type: 'text', defaultValue: 'Your Name', placeholder: 'Name' },
      { key: 'senderAddress', label: 'Sender Address', type: 'textarea', defaultValue: '123 Business Street\nCity, Country', placeholder: 'Address' },
      { key: 'recipientName', label: 'Recipient Name', type: 'text', defaultValue: 'Recipient Name', placeholder: 'Name' },
      { key: 'recipientAddress', label: 'Recipient Address', type: 'textarea', defaultValue: '456 Client Avenue\nCity, Country', placeholder: 'Address' },
      { key: 'date', label: 'Date', type: 'date', defaultValue: '' },
      { key: 'subject', label: 'Subject', type: 'text', defaultValue: 'Subject Line', placeholder: 'Re: ...' },
      { key: 'body', label: 'Letter Body', type: 'textarea', defaultValue: 'Dear Sir/Madam,\n\nI am writing to...\n\nSincerely,', placeholder: 'Letter content...' },
    ],
  },
];

// ============================================
// LOOKUP
// ============================================

export const getDigitalTemplate = (id: string): DigitalTemplateDef | null => {
  return digitalTemplatesCatalog.find((t) => t.id === id) ?? null;
};
