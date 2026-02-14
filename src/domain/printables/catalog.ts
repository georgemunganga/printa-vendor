import type { ElementType } from 'react';
import {
  BookOpen,
  Camera,
  Car,
  CreditCard,
  Flag,
  FileText,
  Gift,
  Newspaper,
  Package,
  Shirt,
  Sparkles,
  Tag,
  Calendar,
  FolderClosed,
} from 'lucide-react';

export type SurfaceType = 'document' | 'image' | 'mockup';

export type InputType = 'pdf' | 'doc' | 'docx' | 'image' | 'template';
export type Tool =
  | 'signature'
  | 'text'
  | 'image_upload'
  | 'stamp'
  | 'highlight';

export interface PrintableDefinition {
  id: string;
  title: string;
  subtitle?: string;
  category: 'documents' | 'marketing' | 'photos' | 'ids' | 'custom';
  surfaceType: SurfaceType;
  adapterKey: string;
  surfaceFlags: SurfaceTypeFlags;
  measurement?: MeasurementHint;
  recommendedResolution?: string;
  supportedInputs: InputType[];
  enabledTools: Tool[];
  wizard?: {
    requiresUpload: boolean;
    allowsTemplateStart: boolean;
  };
  description?: string;
  mockup?: {
    templateIds: string[];
    hasFrontBack?: boolean;
  };
}

export type PrintableCategoryKey = PrintableDefinition['category'];

export interface PrintableCategoryMeta {
  name: string;
  description: string;
  icon: ElementType;
  color: string;
  bgGradient: string;
}

export const PRINTABLE_CATEGORY_META: Record<PrintableCategoryKey, PrintableCategoryMeta> = {
  documents: {
    name: 'Documents',
    description: 'Letters, invoices, and reports that need reviewing or signing.',
    icon: FileText,
    color: 'text-printa-red',
    bgGradient: 'from-white to-print-red-50 border border-printa-red',
  },
  marketing: {
    name: 'Marketing',
    description: 'Flyers, business cards, and posters designed for impact.',
    icon: Sparkles,
    color: 'text-printa-red',
    bgGradient: 'from-white to-white border border-printa-red',
  },
  photos: {
    name: 'Photos',
    description: 'High-resolution prints of photographs and enlargements.',
    icon: Camera,
    color: 'text-printa-red',
    bgGradient: 'from-white to-white border border-printa-red',
  },
  ids: {
    name: 'IDs & Badges',
    description: 'Cards, badges, and credentials with front/back layouts.',
    icon: CreditCard,
    color: 'text-printa-red',
    bgGradient: 'from-white to-white border border-printa-red',
  },
  custom: {
    name: 'Custom',
    description: 'Specialized items like stickers, labels, or custom shapes.',
    icon: Tag,
    color: 'text-printa-red',
    bgGradient: 'from-white to-white border border-printa-red',
  },
};

export interface MeasurementHint {
  label: string;
  mm?: string;
  cm?: string;
  m?: string;
}

const MEASUREMENT_HINTS: Record<string, MeasurementHint> = {
  'letter_document': { label: '210 × 297 mm (A4)', mm: '210 × 297 mm' },
  's1-a4': { label: '210 × 297 mm (A4 paper)' },
  's1-a5': { label: '148 × 210 mm (A5 paper)' },
  's1-a6': { label: '105 × 148 mm (A6/postcard)' },
  's1-a3': { label: '297 × 420 mm (A3 poster)' },
  's1-letters': { label: '216 × 279 mm (US Letter)' },
  'business_card': { label: '85 × 55 mm card' },
  's2-business-cards': { label: '85 × 55 mm card' },
  'flyer_marketing': { label: '148 × 210 mm (A5 flyer)' },
  's1-flyers': { label: '210 × 297 mm (A4 flyer)' },
  's7-banners': { label: '1 × 3 m banner', m: '1 × 3 m' },
  's7-posters-large': { label: '1.2 × 1.8 m poster', m: '1.2 × 1.8 m' },
  's7-flags': { label: '0.6 × 1.8 m flag', m: '0.6 × 1.8 m' },
  's8-paper-stickers': { label: '50 × 50 mm sticker' },
  's9-vehicle-branding': { label: '2 × 3 m wrap', m: '2 × 3 m' },
  's11-photo-prints': { label: '10 × 15 cm photo' },
  'photo_print': { label: 'Up to 600 × 400 mm' },
  'custom_sticker': { label: '60 × 60 mm sticker' },
};

const RESOLUTION_HINTS: Record<string, string> = {
  's7-banners': '1440 dpi',
  's7-posters-large': '1440 dpi',
  's9-vehicle-branding': '1440 dpi',
  's8-paper-stickers': '600 dpi',
};

const DEFAULT_RESOLUTION_BY_SURFACE: Record<SurfaceType, string> = {
  document: '300 dpi',
  mockup: '300 dpi',
  image: '300 dpi',
};

const resolveMeasurementHint = (id: string): MeasurementHint => {
  return MEASUREMENT_HINTS[id] ?? { label: 'Custom' };
};

const resolveResolutionHint = (id: string, surfaceType: SurfaceType): string => {
  return RESOLUTION_HINTS[id] ?? DEFAULT_RESOLUTION_BY_SURFACE[surfaceType];
};

type PrintableSeed = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  supportedInputs?: InputType[];
  enabledTools?: Tool[];
  wizard?: Partial<PrintableDefinition['wizard']>;
  mockup?: PrintableDefinition['mockup'];
  icon?: ElementType;
  surfaceType?: SurfaceType;
  adapterKey?: string;
  measurement?: MeasurementHint;
  recommendedResolution?: string;
};

export interface SurfaceTypeFlags {
  mockup: boolean;
  documentOrCanvas: boolean;
}

const buildSurfaceFlags = (surfaceType: SurfaceType): SurfaceTypeFlags => ({
  mockup: surfaceType === 'mockup',
  documentOrCanvas: surfaceType !== 'mockup',
});

const DOCUMENT_INPUTS: InputType[] = ['pdf', 'doc', 'docx'];
const MARKETING_INPUTS: InputType[] = ['template', 'image'];
const IDS_INPUTS: InputType[] = ['template', 'image'];
const CUSTOM_INPUTS: InputType[] = ['template', 'image'];
const PHOTO_INPUTS: InputType[] = ['image'];

const DOCUMENT_TOOLS: Tool[] = ['text', 'signature', 'highlight'];
const MARKETING_TOOLS: Tool[] = ['text', 'image_upload', 'stamp'];
const IDS_TOOLS: Tool[] = ['text', 'image_upload'];
const CUSTOM_TOOLS: Tool[] = ['image_upload', 'stamp'];
const PHOTO_TOOLS: Tool[] = ['text', 'stamp'];

const DOCUMENT_WIZARD: PrintableDefinition['wizard'] = {
  requiresUpload: true,
  allowsTemplateStart: false,
};

const MARKETING_WIZARD: PrintableDefinition['wizard'] = {
  requiresUpload: false,
  allowsTemplateStart: true,
};

const IDS_WIZARD: PrintableDefinition['wizard'] = {
  requiresUpload: false,
  allowsTemplateStart: true,
};

const CUSTOM_WIZARD: PrintableDefinition['wizard'] = {
  requiresUpload: false,
  allowsTemplateStart: true,
};

const PHOTO_WIZARD: PrintableDefinition['wizard'] = {
  requiresUpload: true,
  allowsTemplateStart: false,
};

const createDocumentPrintable = (seed: PrintableSeed): PrintableDefinition => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  description: seed.description,
  category: 'documents',
  surfaceType: seed.surfaceType ?? 'document',
  adapterKey: seed.adapterKey ?? 'document',
  supportedInputs: seed.supportedInputs ?? DOCUMENT_INPUTS,
  enabledTools: seed.enabledTools ?? DOCUMENT_TOOLS,
  wizard: { ...DOCUMENT_WIZARD, ...seed.wizard },
  mockup: seed.mockup,
  icon: seed.icon ?? PRINTABLE_CATEGORY_META.documents.icon,
  surfaceFlags: buildSurfaceFlags(seed.surfaceType ?? 'document'),
  measurement: seed.measurement ?? resolveMeasurementHint(seed.id),
  recommendedResolution: seed.recommendedResolution ?? resolveResolutionHint(seed.id, seed.surfaceType ?? 'document'),
});

const createMarketingPrintable = (seed: PrintableSeed): PrintableDefinition => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  description: seed.description,
  category: 'marketing',
  surfaceType: seed.surfaceType ?? 'mockup',
  adapterKey: seed.adapterKey ?? 'mockup',
  supportedInputs: seed.supportedInputs ?? MARKETING_INPUTS,
  enabledTools: seed.enabledTools ?? MARKETING_TOOLS,
  wizard: { ...MARKETING_WIZARD, ...seed.wizard },
  mockup: seed.mockup,
  icon: seed.icon ?? PRINTABLE_CATEGORY_META.marketing.icon,
  surfaceFlags: buildSurfaceFlags(seed.surfaceType ?? 'mockup'),
  measurement: seed.measurement ?? resolveMeasurementHint(seed.id),
  recommendedResolution: seed.recommendedResolution ?? resolveResolutionHint(seed.id, seed.surfaceType ?? 'mockup'),
});

const createIdPrintable = (seed: PrintableSeed): PrintableDefinition => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  description: seed.description,
  category: 'ids',
  surfaceType: seed.surfaceType ?? 'mockup',
  adapterKey: seed.adapterKey ?? 'mockup',
  supportedInputs: seed.supportedInputs ?? IDS_INPUTS,
  enabledTools: seed.enabledTools ?? IDS_TOOLS,
  wizard: { ...IDS_WIZARD, ...seed.wizard },
  mockup: seed.mockup,
  icon: seed.icon ?? PRINTABLE_CATEGORY_META.ids.icon,
  surfaceFlags: buildSurfaceFlags(seed.surfaceType ?? 'mockup'),
  measurement: seed.measurement ?? resolveMeasurementHint(seed.id),
  recommendedResolution: seed.recommendedResolution ?? resolveResolutionHint(seed.id, seed.surfaceType ?? 'mockup'),
});

const createCustomPrintable = (seed: PrintableSeed): PrintableDefinition => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  description: seed.description,
  category: 'custom',
  surfaceType: seed.surfaceType ?? 'mockup',
  adapterKey: seed.adapterKey ?? 'mockup',
  supportedInputs: seed.supportedInputs ?? CUSTOM_INPUTS,
  enabledTools: seed.enabledTools ?? CUSTOM_TOOLS,
  wizard: { ...CUSTOM_WIZARD, ...seed.wizard },
  mockup: seed.mockup,
  icon: seed.icon ?? PRINTABLE_CATEGORY_META.custom.icon,
  surfaceFlags: buildSurfaceFlags(seed.surfaceType ?? 'mockup'),
  measurement: seed.measurement ?? resolveMeasurementHint(seed.id),
  recommendedResolution: seed.recommendedResolution ?? resolveResolutionHint(seed.id, seed.surfaceType ?? 'mockup'),
});

const createPhotoPrintable = (seed: PrintableSeed): PrintableDefinition => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  description: seed.description,
  category: 'photos',
  surfaceType: seed.surfaceType ?? 'image',
  adapterKey: seed.adapterKey ?? 'image',
  supportedInputs: seed.supportedInputs ?? PHOTO_INPUTS,
  enabledTools: seed.enabledTools ?? PHOTO_TOOLS,
  wizard: { ...PHOTO_WIZARD, ...seed.wizard },
  mockup: seed.mockup,
  icon: seed.icon ?? PRINTABLE_CATEGORY_META.photos.icon,
  surfaceFlags: buildSurfaceFlags(seed.surfaceType ?? 'image'),
  measurement: seed.measurement ?? resolveMeasurementHint(seed.id),
  recommendedResolution: seed.recommendedResolution ?? resolveResolutionHint(seed.id, seed.surfaceType ?? 'image'),
});

const documentSeeds: PrintableSeed[] = [
 
  {
    id: 's1-a4',
    title: 'A4 Document',
    subtitle: 'Standard international paper format',
    description: 'Sign document or skip to printing, perfect for letters, reports, etc.',
  },
  {
    id: 's1-a5',
    title: 'A5 Document',
    subtitle: 'Half letter-size documents',
    description: 'Great for handouts, leaflets, and compact booklets.',
  },
  {
    id: 's1-a6',
    title: 'A6 Document',
    subtitle: 'Postcard or invitation size',
    description: 'One-sheet flyers, invites, and quick printouts.',
    
  },
  {
    id: 's1-letters',
    title: 'Letter Document (US)',
    subtitle: 'U.S. letter-size pages',
    description: 'Trusted format for offices and correspondence.',
  },
  {
    id: 's1-reports',
    title: 'Reports',
    subtitle: 'Project and financial reports',
    description: 'Detailed business or annual reports with bound pages.',
  },
  {
    id: 's1-invoices',
    title: 'Invoices',
    subtitle: 'Billing statements and payment requests',
    description: 'Ready-to-print invoices with place for totals and signatures.',
  },
  {
    id: 's1-receipts',
    title: 'Receipts',
    subtitle: 'Proof-of-purchase slips',
    description: 'Compact receipts for sales, store visits, and confirmations.',
  },
  {
    id: 's1-quotations',
    title: 'Quotations',
    subtitle: 'Price estimates',
    description: 'Professional price quotes with clean tables.',
  },
  {
    id: 's1-statements',
    title: 'Statements',
    subtitle: 'Financial account summaries',
    description: 'Periodic account summaries, statements, and reports.',
  },
  {
    id: 's1-forms',
    title: 'Forms',
    subtitle: 'Fillable data collection sheets',
    description: 'Survey, registration, and order forms with structured fields.',
  },
  {
    id: 's1-manuals',
    title: 'Manuals',
    subtitle: 'Instructional guides',
    description: 'Large manuals with multiple sections for operations.',
  },
];

const marketingSeeds: PrintableSeed[] = [
  {
    id: 'business_card',
    title: 'Business Cards',
    subtitle: 'Mockup preview for front/back cards',
    description: 'Mockup templates for printing business cards.',
    mockup: {
      templateIds: ['bc_front_01', 'bc_back_01'],
      hasFrontBack: true,
    },
  },
  {
    id: 'flyer_marketing',
    title: 'Flyers & Posters',
    subtitle: 'Single-sided marketing collateral',
    description: 'Flyer, poster, or brochure layouts using mockups.',
    mockup: {
      templateIds: ['flyer_a5_01'],
    },
  },
  {
    id: 's1-a3',
    title: 'A3 Document',
    subtitle: 'Posters and large spreads',
    description: 'Big ink-on-paper printing for presentations and signage.',
   
  },
  {
    id: 's1-flyers',
    title: 'Flyers',
    subtitle: 'Single-sheet marketing',
    description: 'Attention-grabbing flyers for events and promotions.',
  },
  {
    id: 's1-leaflets',
    title: 'Leaflets',
    subtitle: 'Folded marketing sheets',
    description: 'Folded leaflets with multiple panels for storytelling.',
  },
  {
    id: 's1-brochures',
    title: 'Brochures',
    subtitle: 'Multi-page marketing spreads',
    description: 'Elegant brochures with fold guides and page order.',
  },
  {
    id: 's1-menus',
    title: 'Menus',
    subtitle: 'Restaurant food lists',
    description: 'Food and drink menus with highlighted specials.',
  },
  {
    id: 's1-posters-small',
    title: 'Posters (Small)',
    subtitle: 'Indoor promotional displays',
    description: 'Small posters for indoor campaigns and announcements.',
  },
  {
    id: 's1-catalogues',
    title: 'Catalogues',
    subtitle: 'Product inventory books',
    description: 'Product catalogues for sales teams and showrooms.',
  },
  {
    id: 's1-price-lists',
    title: 'Price Lists',
    subtitle: 'Service or product pricing',
    description: 'Clear price lists for customers and service desks.',
  },
  {
    id: 's2-business-cards',
    title: 'Business Cards',
    subtitle: 'Professional contact cards',
    description: 'Business profile cards with logos and contact info.',
    icon: CreditCard,
  },
  {
    id: 's2-loyalty-cards',
    title: 'Loyalty Cards',
    subtitle: 'Customer reward cards',
    description: 'Punch or stamp loyalty cards with branding.',
    icon: CreditCard,
  },
  {
    id: 's2-invitation-cards',
    title: 'Invitation Cards',
    subtitle: 'Event and party invites',
    description: 'Invitation cards with RSVP and event details.',
    icon: CreditCard,
  },
  {
    id: 's2-greeting-cards',
    title: 'Greeting Cards',
    subtitle: 'Personal message cards',
    description: 'Greeting cards for holidays and milestones.',
    icon: CreditCard,
  },
  {
    id: 's2-letterheads',
    title: 'Letterheads',
    subtitle: 'Branded office paper',
    description: 'Stationery letterheads for official correspondence.',
    icon: CreditCard,
  },
  {
    id: 's2-envelopes',
    title: 'Envelopes',
    subtitle: 'Standard or windowed mailers',
    description: 'Matching envelopes for mailings and invites.',
    icon: FolderClosed,
  },
  {
    id: 's2-notepads',
    title: 'Notepads',
    subtitle: 'Branded writing pads',
    description: 'Custom notepads for meetings and bullet journaling.',
    icon: CreditCard,
  },
  {
    id: 's2-folders',
    title: 'Folders',
    subtitle: 'Presentation and document folders',
    description: 'Two-pocket folders for pitches and proposals.',
    icon: CreditCard,
  },
  {
    id: 's2-bookmarks',
    title: 'Bookmarks',
    subtitle: 'Page markers',
    description: 'Bookmarks for schools, libraries, and giveaways.',
    icon: CreditCard,
  },
  {
    id: 's3-journals',
    title: 'Journals',
    subtitle: 'Academic and trade publications',
    description: 'Bound journals for research, trade, or academic use.',
    icon: Newspaper,
  },
  {
    id: 's3-magazines',
    title: 'Magazines',
    subtitle: 'Consumer and lifestyle periodicals',
    description: 'Full-color magazines for subscriptions and releases.',
    icon: Newspaper,
  },
  {
    id: 's3-newspapers',
    title: 'Newspapers',
    subtitle: 'Daily or weekly newsprint',
    description: 'Newsprint-ready layouts for newspapers and bulletins.',
    icon: Newspaper,
  },
  {
    id: 's3-annual-reports',
    title: 'Annual Reports',
    subtitle: 'High-end corporate financial books',
    description: 'Premium annual reports with charts and imagery.',
    icon: Newspaper,
  },
  {
    id: 's3-programs',
    title: 'Programs',
    subtitle: 'Event, theater, or sports programs',
    description: 'Programs for ceremonies, concerts, or sporting events.',
    icon: Newspaper,
  },
  {
    id: 's3-directories',
    title: 'Directories',
    subtitle: 'Business or membership listings',
    description: 'Directories for associations or corporate teams.',
    icon: Newspaper,
  },
  {
    id: 's3-newsletters',
    title: 'Newsletters',
    subtitle: 'Community or corporate updates',
    description: 'Newsletters delivered digitally or via print.',
    icon: Newspaper,
  },
  {
    id: 's4-booklets',
    title: 'Booklets',
    subtitle: 'Small bound publications',
    description: 'Booklets for programs, manuals, or brochures.',
    icon: BookOpen,
  },
  {
    id: 's4-softcover-books',
    title: 'Softcover Books',
    subtitle: 'Paperback binding',
    description: 'Paperback books for novels, portfolios, or guides.',
    icon: BookOpen,
  },
  {
    id: 's4-hardcover-books',
    title: 'Hardcover Books',
    subtitle: 'Premium case binding',
    description: 'Hardcover books with jackets and spine printing.',
    icon: BookOpen,
  },
  {
    id: 's4-exercise-books',
    title: 'Exercise Books',
    subtitle: 'School and writing books',
    description: 'Exercise books for classrooms and workbooks.',
    icon: BookOpen,
  },
  {
    id: 's4-diaries',
    title: 'Diaries',
    subtitle: 'Personal planners and journals',
    description: 'Daily diaries with dated spreads.',
    icon: BookOpen,
  },
  {
    id: 's4-calendars',
    title: 'Calendars',
    subtitle: 'Wall and desk trackers',
    description: 'Calendars for desks, walls, or planners.',
    icon: Calendar,
  },
  {
    id: 's4-spiral-binding',
    title: 'Spiral Binding',
    subtitle: 'Coil-bound books',
    description: 'Plastic or metal spiral binding services.',
    
    icon: BookOpen,
  },
  {
    id: 's4-comb-binding',
    title: 'Comb Binding',
    subtitle: 'Plastic comb spine',
    description: 'Comb binding for reports and proposals.',
    
    icon: BookOpen,
  },
  {
    id: 's4-staple-binding',
    title: 'Staple Binding',
    subtitle: 'Saddle-stitched spine',
    description: 'Saddle-stitched binding for thin booklets.',
    icon: BookOpen,
  },
  {
    id: 's4-perfect-binding',
    title: 'Perfect Binding',
    subtitle: 'Glued square spine',
    description: 'Perfect binding for professional books.',
    icon: BookOpen,
  },
  {
    id: 's7-posters-large',
    title: 'Posters (Large)',
    subtitle: 'Outdoor promotional displays',
    description: 'Large-format posters for outdoor or trade shows.',
    icon: Flag,
  },
  {
    id: 's7-banners',
    title: 'Banners',
    subtitle: 'Vinyl or mesh banners',
    description: 'Large vinyl banners for retail or events.',
    icon: Flag,
  },
  {
    id: 's7-roll-up-banners',
    title: 'Roll-up Banners',
    subtitle: 'Retractable floor displays',
    description: 'Portable roll-up banners for quick deployment.',
    icon: Flag,
  },
  {
    id: 's7-pull-up-banners',
    title: 'Pull-up Banners',
    subtitle: 'Portable stand displays',
    description: 'Pull-up displays for conferences and expos.',
    icon: Flag,
  },
  {
    id: 's7-x-banners',
    title: 'X-Banners',
    subtitle: 'Lightweight X-frame stands',
    description: 'Indoor X-frame banners for pop-up stands.',
    icon: Flag,
  },
  {
    id: 's7-backdrops',
    title: 'Backdrops',
    subtitle: 'Stage and photo backdrops',
    description: 'Backdrop printing for stages and photo booths.',
    icon: Flag,
  },
  {
    id: 's7-flags',
    title: 'Flags',
    subtitle: 'Teardrop and feather flags',
    description: 'Outdoor flags for brand visibility.',
    icon: Flag,
  },
  {
    id: 's7-table-covers',
    title: 'Table Covers',
    subtitle: 'Branded tablecloths',
    description: 'Printed table covers for booths and events.',
    icon: Flag,
  },
];

const idsSeeds: PrintableSeed[] = [
  {
    id: 'id_card',
    title: 'ID Cards & Badges',
    subtitle: 'Laminated or card stock IDs',
    description: 'Fixed-layout identity cards with photo and text.',
    mockup: {
      templateIds: ['id_card_front'],
    },
    icon: CreditCard,
  },
  {
    id: 's2-id-cards',
    title: 'ID Cards',
    subtitle: 'Identification and access cards',
    description: 'Durable ID cards for visitors, staff, or memberships.',
    icon: CreditCard,
  },
];

const customSeeds: PrintableSeed[] = [
  {
    id: 'custom_sticker',
    title: 'Custom Stickers & Labels',
    subtitle: 'Small shapes and die-cut stickers',
    description: 'Custom sticker templates with simple mockup.',
    mockup: {
      templateIds: ['sticker_round'],
    },
    icon: Tag,
  },
  {
    id: 's5-t-shirts',
    title: 'T-shirts',
    subtitle: 'Standard cotton shirts',
    description: 'Soft cotton shirts for teams and events.',
    icon: Shirt,
  },
  {
    id: 's5-polo-shirts',
    title: 'Polo Shirts',
    subtitle: 'Collared casual shirts',
    description: 'Embroider or print logos on polos.',
    icon: Shirt,
  },
  {
    id: 's5-smart-shirts',
    title: 'Smart Shirts',
    subtitle: 'Formal button-down shirts',
    description: 'Dress shirts with subtle printing or embroidery.',
    icon: Shirt,
  },
  {
    id: 's5-hoodies',
    title: 'Hoodies',
    subtitle: 'Hooded sweatshirts',
    description: 'Hoodies for teams, schools, and apparel shops.',
    icon: Shirt,
  },
  {
    id: 's5-jackets',
    title: 'Jackets',
    subtitle: 'Outerwear and coats',
    description: 'Jackets and softshells with custom branding.',
    icon: Shirt,
  },
  {
    id: 's5-overalls',
    title: 'Overalls',
    subtitle: 'Workwear and jumpsuits',
    description: 'Industrial overalls and coveralls printing.',
    icon: Shirt,
  },
  {
    id: 's5-reflective-vests',
    title: 'Reflective Vests',
    subtitle: 'High-visibility safety gear',
    description: 'Safety vests with reflective print.',
    icon: Shirt,
  },
  {
    id: 's5-aprons',
    title: 'Aprons',
    subtitle: 'Kitchen and workshop protection',
    description: 'Aprons for culinary and creative teams.',
    icon: Shirt,
  },
  {
    id: 's5-lanyards',
    title: 'Lanyards',
    subtitle: 'Custom neck straps',
    description: 'Lanyards for events and conferences.',
    icon: Shirt,
  },
  {
    id: 's6-cups',
    title: 'Cups',
    subtitle: 'Ceramic drinkware',
    description: 'Printed cups for hospitality or giveaways.',
    icon: Gift,
  },
  {
    id: 's6-mugs',
    title: 'Mugs',
    subtitle: 'Ceramic drinkware',
    description: 'Classic mugs with full-wrap printing.',
    icon: Gift,
  },
  {
    id: 's6-tumblers',
    title: 'Tumblers',
    subtitle: 'Insulated travel cups',
    description: 'Travel tumblers and drinkware.',
    icon: Gift,
  },
  {
    id: 's6-water-bottles',
    title: 'Water Bottles',
    subtitle: 'Reusable sports bottles',
    description: 'Custom bottles for hydration packs.',
    icon: Gift,
  },
  {
    id: 's6-pens',
    title: 'Pens',
    subtitle: 'Branded writing instruments',
    description: 'Pens and stylus prints for tradeshow giveaways.',
    icon: Gift,
  },
  {
    id: 's6-key-holders',
    title: 'Key Holders',
    subtitle: 'Branded keychains',
    description: 'Key tags and keychains with logos.',
    icon: Gift,
  },
  {
    id: 's6-mouse-pads',
    title: 'Mouse Pads',
    subtitle: 'Computer desk accessories',
    description: 'Mouse pads with ergonomic prints.',
    icon: Gift,
  },
  {
    id: 's6-phone-cases',
    title: 'Phone Cases',
    subtitle: 'Protective mobile covers',
    description: 'Phone cases for events or merchandise.',
    icon: Gift,
  },
  {
    id: 's6-wristbands',
    title: 'Wristbands',
    subtitle: 'Event or awareness bands',
    description: 'Custom wristbands for admissions or causes.',
    icon: Gift,
  },
  {
    id: 's6-coasters',
    title: 'Coasters',
    subtitle: 'Drink protection mats',
    description: 'Coasters for hospitality and bar programs.',
  },
  {
    id: 's8-paper-stickers',
    title: 'Paper Stickers',
    subtitle: 'Standard adhesive labels',
    description: 'Paper stickers for packaging and shipping.',
    icon: Tag,
  },
  {
    id: 's8-vinyl-stickers',
    title: 'Vinyl Stickers',
    subtitle: 'Durable outdoor stickers',
    description: 'Weather-resistant vinyl decals.',
    icon: Tag,
  },
  {
    id: 's8-product-labels',
    title: 'Product Labels',
    subtitle: 'Packaging identification',
    description: 'Labels for products, ingredients, or barcode areas.',
    icon: Tag,
  },
  {
    id: 's8-barcode-labels',
    title: 'Barcode Labels',
    subtitle: 'Inventory tracking labels',
    description: 'Barcode labels for tracking and warehouses.',
    icon: Tag,
  },
  {
    id: 's8-packaging-stickers',
    title: 'Packaging Stickers',
    subtitle: 'Box and bag seals',
    description: 'Seals and stickers for packaging and mailers.',
    icon: Tag,
  },
  {
    id: 's8-warning-labels',
    title: 'Warning Labels',
    subtitle: 'Safety and hazard stickers',
    description: 'Warning decals and compliance labels.',
    icon: Tag,
  },
  {
    id: 's9-vehicle-branding',
    title: 'Vehicle Branding',
    subtitle: 'Car and truck wraps',
    description: 'Vehicle wraps and vinyl graphics.',
    icon: Car,
  },
  {
    id: 's9-window-vinyl',
    title: 'Window Vinyl',
    subtitle: 'Glass and storefront decals',
    description: 'Window vinyls for storefront decor.',
    icon: Car,
  },
  {
    id: 's9-wall-vinyl',
    title: 'Wall Vinyl',
    subtitle: 'Interior wall graphics',
    description: 'Wall vinyl murals and decorative panels.',
    icon: Car,
  },
  {
    id: 's9-floor-vinyl',
    title: 'Floor Vinyl',
    subtitle: 'Directional floor stickers',
    description: 'Floor vinyls for wayfinding.',
    icon: Car,
  },
  {
    id: 's10-product-boxes',
    title: 'Product Boxes',
    subtitle: 'Folding cartons and mailers',
    description: 'Custom folding cartons with full-color print.',
    icon: Package,
  },
  {
    id: 's10-paper-bags',
    title: 'Paper Bags',
    subtitle: 'Branded shopping bags',
    description: 'Shopping bags with full-color logos.',
    icon: Package,
  },
  {
    id: 's10-tissue-paper',
    title: 'Tissue Paper',
    subtitle: 'Branded wrapping tissue',
    description: 'Custom tissue for packaging.',
    icon: Package,
  },
  {
    id: 's10-hang-tags',
    title: 'Hang Tags',
    subtitle: 'Clothing and product tags',
    description: 'Hang tags for retail or garments.',
    icon: Package,
  },
  {
    id: 's10-header-cards',
    title: 'Header Cards',
    subtitle: 'Poly bag toppers',
    description: 'Header cards for poly bags and sets.',
    icon: Package,
  },
  {
    id: 's10-sleeves',
    title: 'Sleeves',
    subtitle: 'Coffee or bottle sleeves',
    description: 'Sleeves for cups, bottles, or packaging.',
    icon: Package,
  },
  {
    id: 's10-wrapping-paper',
    title: 'Wrapping Paper',
    subtitle: 'Custom gift wrap',
    description: 'Printed wrapping paper for gifts and retail.',
    icon: Package,
  },
];

const photoSeeds: PrintableSeed[] = [
  {
    id: 'photo_print',
    title: 'Photo Prints',
    subtitle: 'Image prints, enlargements, framed photos',
    description: 'High-resolution image prints up to poster size.',
  },
  {
    id: 's11-passport-photos',
    title: 'Passport Photos',
    subtitle: 'Official ID photography',
    description: 'Official passport and visa photos.',
  },
  {
    id: 's11-photo-prints',
    title: 'Photo Prints',
    subtitle: 'Standard photographic prints',
    description: 'Standard photo prints for frames or albums.',
  },
  {
    id: 's11-photo-enlargements',
    title: 'Photo Enlargements',
    subtitle: 'Large scale photo prints',
    description: 'Enlarged prints for galleries and signage.',
  },
  {
    id: 's11-canvas-prints',
    title: 'Canvas Prints',
    subtitle: 'Photos printed on canvas',
    description: 'Canvas and gallery-wrapped photo prints.',
  },
];

export const printablesCatalog: PrintableDefinition[] = [
  ...documentSeeds.map(createDocumentPrintable),
  ...marketingSeeds.map(createMarketingPrintable),
  ...idsSeeds.map(createIdPrintable),
  ...customSeeds.map(createCustomPrintable),
  ...photoSeeds.map(createPhotoPrintable),
];

export const getPrintableDefinition = (id: string): PrintableDefinition | null => {
  return printablesCatalog.find((printable) => printable.id === id) ?? null;
};
