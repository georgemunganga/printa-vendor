import type { ElementType } from 'react';
import { Shirt, Coffee, Watch, PenTool, LayoutGrid } from 'lucide-react';

// ============================================
// MOCKUP CATEGORY
// ============================================

export type MockupCategory = 'apparel' | 'drinkware' | 'accessories' | 'stationery';

export interface MockupCategoryMeta {
  name: string;
  icon: ElementType;
}

export const MOCKUP_CATEGORY_META: Record<MockupCategory, MockupCategoryMeta> = {
  apparel: { name: 'Apparel', icon: Shirt },
  drinkware: { name: 'Drinkware', icon: Coffee },
  accessories: { name: 'Accessories', icon: Watch },
  stationery: { name: 'Stationery', icon: PenTool },
};

// ============================================
// MOCKUP TEMPLATE DEFINITION
// ============================================

export type MockupTemplateDef = {
  id: string;
  name: string;
  description?: string;
  thumbnail: string;
  stageImage: string;
  category: MockupCategory;
  printArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  defaultZoom?: number;
};

// ============================================
// CATALOG
// ============================================

export const mockupsCatalog: MockupTemplateDef[] = [
  {
    id: 'tshirt-front',
    name: 'T-Shirt Front',
    description: 'Front print area on a classic crew-neck t-shirt',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
    stageImage: ' mockups/tshirt-front-white.png',
    category: 'apparel',
    printArea: { x: 30, y: 20, width: 40, height: 45 },
    defaultZoom: 100,
  },
  {
    id: 'tshirt-back',
    name: 'T-Shirt Back',
    description: 'Back print area on a classic crew-neck t-shirt',
    thumbnail: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=200&h=200&fit=crop',
    stageImage: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop',
    category: 'apparel',
    printArea: { x: 25, y: 15, width: 50, height: 55 },
    defaultZoom: 100,
  },
  {
    id: 'mug-wrap',
    name: 'Mug Wrap',
    description: 'Full wrap-around print area on a ceramic mug',
    thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&h=200&fit=crop',
    stageImage: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop',
    category: 'drinkware',
    printArea: { x: 20, y: 25, width: 60, height: 50 },
    defaultZoom: 100,
  },
  {
    id: 'hoodie-front',
    name: 'Hoodie Front',
    description: 'Front chest print area on a pullover hoodie',
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop',
    stageImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
    category: 'apparel',
    printArea: { x: 28, y: 22, width: 44, height: 48 },
    defaultZoom: 100,
  },
];

// ============================================
// LOOKUP
// ============================================

export const getMockupTemplate = (id: string): MockupTemplateDef | undefined => {
  return mockupsCatalog.find((t) => t.id === id);
};
