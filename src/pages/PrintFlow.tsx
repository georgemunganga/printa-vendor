
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  FileText,
  Image,
  CreditCard,
  BookOpen,
  Shirt,
  Gift,
  Flag,
  Tag,
  Car,
  Package,
  Camera,
  Upload,
  Sparkles,
  FolderOpen,
  Briefcase,
  GraduationCap,
  PartyPopper,
  Heart,
  Printer,
  Newspaper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';

type TabType = 'projects' | 'templates' | 'upload';

// Service category interface
interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
}

// Quick category chip interface
interface CategoryChip {
  icon: React.ElementType;
  label: string;
  query: string;
}

const PrintFlow = () => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const navigate = useNavigate();

  const tabs = [
    
    { id: 'templates' as TabType, label: 'Templates', icon: Image },
    { id: 'projects' as TabType, label: 'History', icon: FolderOpen },
    // { id: 'upload' as TabType, label: 'Upload & Print', icon: Upload },
  ];

  // Quick access category chips
  const categoryChips: CategoryChip[] = [
    { icon: Briefcase, label: 'Business', query: 'business' },
    { icon: GraduationCap, label: 'Education', query: 'education' },
    { icon: PartyPopper, label: 'Events', query: 'events' },
    { icon: Heart, label: 'Personal', query: 'personal' },
    { icon: Gift, label: 'Promotional', query: 'promotional' },
  ];

  // Print service categories based on comprehensive list
  const serviceCategories: ServiceCategory[] = [
    {
      id: 's1-a4',
      name: 'A4',
      description: 'Standard international paper sizes',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-a5',
      name: 'A5',
      description: 'Standard international paper sizes',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    
    {
      id: 's1-a6',
      name: 'A6',
      description: 'Standard international paper sizes',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    
    {
      id: 's1-a3',
      name: 'A3',
      description: 'Standard international paper sizes',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-letters',
      name: 'Letters',
      description: 'Official correspondence',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-reports',
      name: 'Reports',
      description: 'Business and project documents',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-invoices',
      name: 'Invoices',
      description: 'Billing and payment requests',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-receipts',
      name: 'Receipts',
      description: 'Proof of purchase',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-quotations',
      name: 'Quotations',
      description: 'Price estimates',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-statements',
      name: 'Statements',
      description: 'Financial account summaries',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-forms',
      name: 'Forms',
      description: 'Data collection sheets',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-manuals',
      name: 'Manuals',
      description: 'Instructional guides',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-flyers',
      name: 'Flyers',
      description: 'Single-sheet marketing',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-leaflets',
      name: 'Leaflets',
      description: 'Folded marketing sheets',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-brochures',
      name: 'Brochures',
      description: 'Multi-page marketing',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-menus',
      name: 'Menus',
      description: 'Restaurant food lists',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-posters-small',
      name: 'Posters (Small)',
      description: 'Indoor promotional displays',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-catalogues',
      name: 'Catalogues',
      description: 'Product inventory books',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's1-price-lists',
      name: 'Price Lists',
      description: 'Service or product pricing',
      icon: FileText,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-business-cards',
      name: 'Business Cards',
      description: 'Professional contact cards',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-id-cards',
      name: 'ID Cards',
      description: 'Identification and access cards',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-loyalty-cards',
      name: 'Loyalty Cards',
      description: 'Customer reward cards',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-invitation-cards',
      name: 'Invitation Cards',
      description: 'Event and party invites',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-greeting-cards',
      name: 'Greeting Cards',
      description: 'Personal message cards',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-letterheads',
      name: 'Letterheads',
      description: 'Branded office paper',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-envelopes',
      name: 'Envelopes',
      description: 'Standard and windowed mailers',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-notepads',
      name: 'Notepads',
      description: 'Branded writing pads',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-folders',
      name: 'Folders',
      description: 'Presentation and document folders',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's2-bookmarks',
      name: 'Bookmarks',
      description: 'Page markers',
      icon: CreditCard,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's3-journals',
      name: 'Journals',
      description: 'Academic and trade publications',
      icon: Newspaper,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's3-magazines',
      name: 'Magazines',
      description: 'Consumer and lifestyle periodicals',
      icon: Newspaper,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's3-newspapers',
      name: 'Newspapers',
      description: 'Daily or weekly newsprint',
      icon: Newspaper,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's3-annual-reports',
      name: 'Annual Reports',
      description: 'High-end corporate financial books',
      icon: Newspaper,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's3-programs',
      name: 'Programs',
      description: 'Event, theater, or sports programs',
      icon: Newspaper,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's3-directories',
      name: 'Directories',
      description: 'Business or member listings',
      icon: Newspaper,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's3-newsletters',
      name: 'Newsletters',
      description: 'Community or corporate updates',
      icon: Newspaper,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-booklets',
      name: 'Booklets',
      description: 'Small bound publications',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-softcover-books',
      name: 'Softcover Books',
      description: 'Paperback binding',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-hardcover-books',
      name: 'Hardcover Books',
      description: 'Premium case binding',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-exercise-books',
      name: 'Exercise Books',
      description: 'School and writing books',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-diaries',
      name: 'Diaries',
      description: 'Personal planners and journals',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-calendars',
      name: 'Calendars',
      description: 'Wall and desk date trackers',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-spiral-binding',
      name: 'Spiral Binding',
      description: 'Plastic or metal coil binding',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-comb-binding',
      name: 'Comb Binding',
      description: 'Plastic comb spine',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-staple-binding',
      name: 'Staple Binding',
      description: 'Saddle-stitched spine',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's4-perfect-binding',
      name: 'Perfect Binding',
      description: 'Glued square spine',
      icon: BookOpen,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-t-shirts',
      name: 'T-shirts',
      description: 'Standard cotton shirts',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-polo-shirts',
      name: 'Polo Shirts',
      description: 'Collared casual shirts',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-smart-shirts',
      name: 'Smart Shirts',
      description: 'Formal button-down shirts',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-hoodies',
      name: 'Hoodies',
      description: 'Hooded sweatshirts',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-jackets',
      name: 'Jackets',
      description: 'Outerwear and coats',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-overalls',
      name: 'Overalls',
      description: 'Workwear and jumpsuits',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-reflective-vests',
      name: 'Reflective Vests',
      description: 'High-visibility safety gear',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-aprons',
      name: 'Aprons',
      description: 'Kitchen and workshop protection',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's5-lanyards',
      name: 'Lanyards',
      description: 'Custom neck straps',
      icon: Shirt,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-cups',
      name: 'Cups',
      description: 'Ceramic drinkware',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-mugs',
      name: 'Mugs',
      description: 'Ceramic drinkware',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-tumblers',
      name: 'Tumblers',
      description: 'Insulated travel cups',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-water-bottles',
      name: 'Water Bottles',
      description: 'Reusable sports bottles',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-pens',
      name: 'Pens',
      description: 'Branded writing instruments',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-key-holders',
      name: 'Key Holders',
      description: 'Branded keychains',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-mouse-pads',
      name: 'Mouse Pads',
      description: 'Computer desk accessories',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-phone-cases',
      name: 'Phone Cases',
      description: 'Protective mobile covers',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-wristbands',
      name: 'Wristbands',
      description: 'Event or awareness bands',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's6-coasters',
      name: 'Coasters',
      description: 'Drink protection mats',
      icon: Gift,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's7-posters-large',
      name: 'Posters (Large)',
      description: 'Outdoor or large-scale displays',
      icon: Flag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's7-banners',
      name: 'Banners',
      description: 'Vinyl or mesh banners',
      icon: Flag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's7-roll-up-banners',
      name: 'Roll-up Banners',
      description: 'Retractable floor displays',
      icon: Flag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's7-pull-up-banners',
      name: 'Pull-up Banners',
      description: 'Portable stand displays',
      icon: Flag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's7-x-banners',
      name: 'X-Banners',
      description: 'Lightweight X-frame stands',
      icon: Flag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's7-backdrops',
      name: 'Backdrops',
      description: 'Large stage or photo backgrounds',
      icon: Flag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's7-flags',
      name: 'Flags',
      description: 'Teardrop and feather flags',
      icon: Flag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's7-table-covers',
      name: 'Table Covers',
      description: 'Branded tablecloths',
      icon: Flag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's8-paper-stickers',
      name: 'Paper Stickers',
      description: 'Standard adhesive labels',
      icon: Tag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's8-vinyl-stickers',
      name: 'Vinyl Stickers',
      description: 'Durable outdoor stickers',
      icon: Tag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's8-product-labels',
      name: 'Product Labels',
      description: 'Packaging identification',
      icon: Tag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's8-barcode-labels',
      name: 'Barcode Labels',
      description: 'Inventory tracking labels',
      icon: Tag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's8-packaging-stickers',
      name: 'Packaging Stickers',
      description: 'Box and bag seals',
      icon: Tag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's8-warning-labels',
      name: 'Warning Labels',
      description: 'Safety and hazard stickers',
      icon: Tag,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's9-vehicle-branding',
      name: 'Vehicle Branding',
      description: 'Car and truck wraps',
      icon: Car,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's9-window-vinyl',
      name: 'Window Vinyl',
      description: 'Glass and storefront decals',
      icon: Car,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's9-wall-vinyl',
      name: 'Wall Vinyl',
      description: 'Interior wall graphics',
      icon: Car,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's9-floor-vinyl',
      name: 'Floor Vinyl',
      description: 'Directional floor stickers',
      icon: Car,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's10-product-boxes',
      name: 'Product Boxes',
      description: 'Folding cartons and mailers',
      icon: Package,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's10-paper-bags',
      name: 'Paper Bags',
      description: 'Branded shopping bags',
      icon: Package,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's10-tissue-paper',
      name: 'Tissue Paper',
      description: 'Branded wrapping tissue',
      icon: Package,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's10-hang-tags',
      name: 'Hang Tags',
      description: 'Clothing and product tags',
      icon: Package,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's10-header-cards',
      name: 'Header Cards',
      description: 'Poly bag toppers',
      icon: Package,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's10-sleeves',
      name: 'Sleeves',
      description: 'Coffee or bottle sleeves',
      icon: Package,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's10-wrapping-paper',
      name: 'Wrapping Paper',
      description: 'Custom gift wrap',
      icon: Package,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's11-passport-photos',
      name: 'Passport Photos',
      description: 'Official ID photography',
      icon: Camera,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's11-photo-prints',
      name: 'Photo Prints',
      description: 'Standard photographic prints',
      icon: Camera,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's11-photo-enlargements',
      name: 'Photo Enlargements',
      description: 'Large scale photo prints',
      icon: Camera,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
    {
      id: 's11-canvas-prints',
      name: 'Canvas Prints',
      description: 'Photos printed on canvas',
      icon: Camera,
      color: 'text-printa-red',
      bgGradient: 'from-white to-print-red-50 border border-printa-red'
    },
  ];

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? serviceCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : serviceCategories;

  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery]);

  useEffect(() => {
    setVisibleCount(prev => Math.min(prev, filteredCategories.length));
  }, [filteredCategories.length]);

  const visibleCategories = filteredCategories.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredCategories.length;
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, filteredCategories.length));
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/upload?category=${categoryId}`);
  };

  const handleChipClick = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/customize?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      

      {/* Hero Section with Gradient */}
      <section className="relative lg:rounded-2xl pb-8 lg:m-2 lg:p-6 lg:pt-0 bg-gradient-to-b from-rose-100/60 via-orange-50/30 to-white">
        <Navbar />
        {/* Subtle gradient at top fading to white - inspired by Canva */}
        {/* <div className=" z-0 absolute inset-x-0 lg:rounded-2xl top-0 min-h-[500px]" /> */}
        <div className="z-0 absolute inset-0 lg:rounded-2xl bg-gradient-to-r from-white via-purple-100/30 to-pink-100/40" />

        <div className="relative z-10 lg:rounded-2xl container mx-auto px-4 max-w-5xl m-8">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 mt-8"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold printa-black">
              What are you <span className="text-printa-red">printing </span>today?
            </h1>
            {/* <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
              Professional printing made simple. Upload, customize, and print anywhere.
            </p> */}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center gap-2 mb-8"
          >
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-printa-black text-white shadow-md'
                    : 'bg-white/70 text-foreground hover:bg-white border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </motion.div>

          {/* Central Search Module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Gradient border wrapper */}
            <div
              className={`rounded-3xl p-[1px] transition-all duration-300 ${
                isSearchFocused
                  ? 'bg-gradient-to-r from-black via-red-400 to-printa-red shadow-lg shadow-purple-200/50'
                  : 'bg-gray-200'
              }`}
            >
              <div className="bg-white rounded-[22px] overflow-hidden">
                {/* Search Input Row */}
                <div className={`px-6 ${isSearchExpanded ? 'pt-4 pb-2' : 'py-4'}`}>
                  <div className="flex items-center">
                    <Search className={`w-6 h-6 flex-shrink-0 transition-colors ${isSearchFocused ? 'text-printa-red' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search for print services, templates, or describe what you need..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => { setIsSearchFocused(true); setIsSearchExpanded(true); }}
                      onBlur={() => setIsSearchFocused(false)}
                      className="flex-1 px-4 py-3 text-base bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400"
                    />
                    <Button
                      onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                      className={`p-4 hidden lg:block hover:text-black  rounded-xl transition-colors ${isSearchExpanded ? 'hover:text-white bg-gray-100 text-gray-700' : 'hover:bg-gray-100 hover:border hover:text-black text-white'}`}
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Arrow Button Area */}
                      <div className="px-6 pb-2 flex justify-end">
                        <Button
                          onClick={handleSearch}
                          className="rounded-full h-11 w-11 bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Category Chips Band */}
                      <div className="bg-printa-red/10 px-6 py-2">
                        <div className="flex flex-wrap gap-2">
                          {categoryChips.map((chip, index) => (
                            <motion.button
                              key={chip.label}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.03 }}
                              onClick={() => handleChipClick(chip.query)}
                              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-sm font-medium transition-all duration-200"
                            >
                              <chip.icon className="w-4 h-4 text-gray-600" />
                              {chip.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explore Services Section */}
      <section className="py-12 bg-background z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {searchQuery ? 'Search Results' : 'Explore print options'}
            </h2>
            <Link to="/how-it-works" className="text-printa-red hover:underline text-sm font-medium flex items-center gap-1">
              How it works <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Service Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {visibleCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className={`bg-gradient-to-br ${category.bgGradient} hover:from-printa-red hover:to-printa-red rounded-xl p-4 h-36 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-printa-red border border-gray-100/50`}>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors">{category.name}</span>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 group-hover:text-white/80 transition-colors">{category.description}</p>
                  <div className="absolute bottom-3 right-3 opacity-80 group-hover:opacity-100 transition-all">
                    <category.icon className={`w-14 h-14 ${category.color} group-hover:text-white transition-colors`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No results message */}
          {searchQuery && filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No services found matching "{searchQuery}"</p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear search
              </Button>
            </motion.div>
          )}

          {canLoadMore && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex justify-center mt-8"
            >
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="rounded-full px-6 gap-2 border-gray-300 hover:border-printa-red hover:text-printa-red"
              >
                See more services
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-12 bg-gray-50/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold mb-8 text-foreground"
          >
            Quick start
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upload & Print */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Link to="/upload" className="block">
                <div className="bg-printa-red via-orange-50 to-printa-red rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-red-100/50 h-full drop-shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-printa-red" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Upload & Print</h3>
                  <p className="text-sm text-gray-200">Upload your files and get them printed at a location near you</p>
                </div>
              </Link>
            </motion.div>

            {/* Design Assistant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link to="/customize" className="block">
                <div className="bg-printa-red rounded-xl p-6 drop-shadow-lg transition-all duration-300 border border-purple-100/50 h-full">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-printa-red" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Design Assistant</h3>
                  <p className="text-sm text-gray-200">Let our tools help you create the perfect design for printing</p>
                </div>
              </Link>
            </motion.div>

            {/* Find Print Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <Link to="/how-it-works" className="block">
                <div className="bg-printa-red rounded-xl p-6 drop-shadow-lg transition-all duration-300 border border-teal-100/50 h-full">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4">
                    <Printer className="w-6 h-6 text-printa-red" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">How It Works</h3>
                  <p className="text-sm text-gray-200">Learn how to print anywhere with Printa's network</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <Footer />
    </div>
  );
};

export default PrintFlow;
