export interface WorkflowChoice {
  label: string;
  description: string;
  vendorParameter: string;
}

export interface WorkflowStep {
  question: string;
  choices: WorkflowChoice[];
}

export interface WorkflowGuide {
  id: string;
  name: string;
  intro: string;
  steps: WorkflowStep[];
}

const workflowGuides: Record<string, WorkflowGuide> = {
  s1: {
    id: 's1',
    name: 'Small Format Paper',
    intro: 'Tell us the size, paper weight, and ink preferences so we can prepare your sheets just right.',
    steps: [
      {
        question: 'How big is the paper?',
        choices: [
          {
            label: 'A6 (Postcard)',
            description: 'Tiny, like a postcard.',
            vendorParameter: 'Size: A6 (105 × 148 mm)',
          },
          {
            label: 'A5 (Half letter)',
            description: 'Half the height of a A4.',
            vendorParameter: 'Size: A5 (148 × 210 mm)',
          },
          {
            label: 'A4 (Letter)',
            description: 'Standard letter-paper size.',
            vendorParameter: 'Size: A4 (210 × 297 mm)',
          },
          {
            label: 'A3 (Double letter)',
            description: 'Big sheets for posters.',
            vendorParameter: 'Size: A3 (297 × 420 mm)',
          },
        ],
      },
      {
        question: 'How thick should the paper be?',
        choices: [
          {
            label: 'Normal',
            description: 'Normal plain paper.',
            vendorParameter: 'Paper type: Standard (80 gsm)',
          },
          {
            label: 'Thin & Light',
            description: 'Feels like a magazine sheet.',
            vendorParameter: 'Paper type: Standard (80 gsm)',
          },
          {
            label: 'Thick & Strong',
            description: 'Like a high-end photo paper.',
            vendorParameter: 'Paper type: Premium (100 gsm)',
          },
        ],
      },
      {
        question: 'What color ink should we use?',
        choices: [
          {
            label: 'Black and white',
            description: 'Simple and economical.',
            vendorParameter: 'Print color: Black & White',
          },
          {
            label: 'Full Color',
            description: 'All the colors for vivid prints.',
            vendorParameter: 'Print color: Full Color (CMYK)',
          },
        ],
      },
    ],
  },
  s2: {
    id: 's2',
    name: 'Cards & Stationery',
    intro: 'Help us know how the card should feel and look so we can map it to the right tooling.',
    steps: [
      {
        question: 'How big is the card?',
        choices: [
          {
            label: 'Standard (Business card)',
            description: 'Fits in every wallet or pocket.',
            vendorParameter: 'Size: 85 × 55 mm (CR80 for ID cards)',
          },
          {
            label: 'Custom Size',
            description: 'You tell us the width and height.',
            vendorParameter: 'Size: Custom (W × H in mm)',
          },
        ],
      },
      {
        question: 'How thick should it feel?',
        choices: [
          {
            label: 'Normal Card',
            description: 'Traditional business card stiffness.',
            vendorParameter: 'Card stock: 14 pt uncoated',
          },
          {
            label: 'Super Thick',
            description: 'Feels extra sturdy in the hand.',
            vendorParameter: 'Card stock: 32 pt ultra-thick',
          },
        ],
      },
      {
        question: 'Do you want a special shine?',
        choices: [
          {
            label: 'Shiny Letters',
            description: 'Gold or silver foil for prestige.',
            vendorParameter: 'Finishing: Foil stamping (Gold/Silver)',
          },
          {
            label: 'Bumpy Letters',
            description: 'Raised text you can feel.',
            vendorParameter: 'Finishing: Embossing',
          },
        ],
      },
    ],
  },
  s3: {
    id: 's3',
    name: 'Periodicals & Publications',
    intro: 'We need the bare facts, like how many pages and the binding style, before we print your magazine or newspaper.',
    steps: [
      {
        question: 'How many pages will it have?',
        choices: [
          {
            label: 'Enter page count',
            description: 'Keep it in multiples of four for saddle-stitching.',
            vendorParameter: 'Page count: [number] (multiple of 4)',
          },
        ],
      },
      {
        question: 'What is the size?',
        choices: [
          {
            label: 'Magazine (A4)',
            description: 'Standard magazine spread.',
            vendorParameter: 'Size: A4 (210 × 297 mm)',
          },
          {
            label: 'Newspaper (Tabloid)',
            description: 'Large broadsheet style.',
            vendorParameter: 'Size: Tabloid (280 × 430 mm)',
          },
        ],
      },
      {
        question: 'How should we bind it?',
        choices: [
          {
            label: 'Staples',
            description: 'Like a booklet or community paper.',
            vendorParameter: 'Binding: Saddle stitch',
          },
          {
            label: 'Glue',
            description: 'For thicker magazines and annual reports.',
            vendorParameter: 'Binding: Perfect bound',
          },
        ],
      },
    ],
  },
  s4: {
    id: 's4',
    name: 'Books & Binding',
    intro: 'Tell us the number of pages and the cover style so we can build the binding the right way.',
    steps: [
      {
        question: 'How many pages will the book have?',
        choices: [
          {
            label: 'Enter page count',
            description: 'Use the total sheet count.',
            vendorParameter: 'Page count: [number]',
          },
        ],
      },
      {
        question: 'What size should it be?',
        choices: [
          {
            label: 'Small (A5)',
            description: 'Great for compact field guides.',
            vendorParameter: 'Size: A5 (148 × 210 mm)',
          },
          {
            label: 'Standard (A4)',
            description: 'Office-friendly layout.',
            vendorParameter: 'Size: A4 (210 × 297 mm)',
          },
        ],
      },
      {
        question: 'What cover style do you prefer?',
        choices: [
          {
            label: 'Softcover',
            description: 'Lightweight yet polished.',
            vendorParameter: 'Cover: Softcover (paperback)',
          },
          {
            label: 'Hardcover',
            description: 'Very sturdy and premium.',
            vendorParameter: 'Cover: Casebound (hardcover)',
          },
        ],
      },
    ],
  },
  s5: {
    id: 's5',
    name: 'Apparel & Fabric',
    intro: 'Let’s pick the right garment, quantity, fabric, and print method so we can prep the art properly.',
    steps: [
      {
        question: 'What size shirts do you need?',
        choices: [
          {
            label: 'Small → XXL',
            description: 'Choose from the most common sizes.',
            vendorParameter: 'Garment size: S, M, L, XL, XXL',
          },
        ],
      },
      {
        question: 'How many pieces do you want?',
        choices: [
          {
            label: 'Enter quantity',
            description: 'We can batch print as soon as you give us a number.',
            vendorParameter: 'Quantity: [number]',
          },
        ],
      },
      {
        question: 'What fabric feels right?',
        choices: [
          {
            label: 'Soft Cotton',
            description: 'Classic day-to-day tee.',
            vendorParameter: 'Garment type: 100% cotton',
          },
          {
            label: 'Sporty Fabric',
            description: 'For activewear or performance looks.',
            vendorParameter: 'Garment type: Performance polyester',
          },
        ],
      },
      {
        question: 'How should we print the design?',
        choices: [
          {
            label: 'Ink Squeeze (Screen Print)',
            description: 'Flat ink layers that last.',
            vendorParameter: 'Print method: Screen print',
          },
          {
            label: 'Sewn On (Embroidery)',
            description: 'Threaded detail for badges.',
            vendorParameter: 'Print method: Embroidery',
          },
        ],
      },
    ],
  },
  s6: {
    id: 's6',
    name: 'Promotional Items',
    intro: 'We need just a few measurements so we can fit your logo onto mugs, pens, and more.',
    steps: [
      {
        question: 'How many items do you need?',
        choices: [
          {
            label: 'Enter quantity',
            description: 'Quantity determines setup time.',
            vendorParameter: 'Quantity: [number]',
          },
        ],
      },
      {
        question: 'What material is it?',
        choices: [
          {
            label: 'Ceramic (Mugs)',
            description: 'Standard mug or cup.',
            vendorParameter: 'Item material: Ceramic',
          },
          {
            label: 'Metal (Water bottles)',
            description: 'Durable metal bodies.',
            vendorParameter: 'Item material: Stainless steel',
          },
        ],
      },
      {
        question: 'How big should the picture be?',
        choices: [
          {
            label: 'Small logo',
            description: 'Single location print.',
            vendorParameter: 'Print area: Single location (max 50 × 50 mm)',
          },
          {
            label: 'Wrap it all around',
            description: 'Full 360° coverage.',
            vendorParameter: 'Print area: Full wrap (360°)',
          },
        ],
      },
    ],
  },
  s7: {
    id: 's7',
    name: 'Large Format & Signage',
    intro: 'Share the size and material so the banner, flag, or backdrop matches the space.',
    steps: [
      {
        question: 'How wide and tall is the piece?',
        choices: [
          {
            label: 'Enter width × height',
            description: 'Use cm or m; we’ll convert to mm.',
            vendorParameter: 'Dimensions: W × H in mm',
          },
        ],
      },
      {
        question: 'What is it made of?',
        choices: [
          {
            label: 'Plastic sheet (banner)',
            description: 'Durable yet flexible vinyl.',
            vendorParameter: 'Material: Standard vinyl (13 oz)',
          },
          {
            label: 'Metal sign',
            description: 'Strong panels for outdoors.',
            vendorParameter: 'Material: Aluminum',
          },
        ],
      },
      {
        question: 'How sharp should the picture be?',
        choices: [
          {
            label: 'Normal (Far view)',
            description: 'Great from a distance.',
            vendorParameter: 'Print quality: Standard (720 dpi)',
          },
          {
            label: 'Super clear (Close view)',
            description: 'Retail or exhibition closeups.',
            vendorParameter: 'Print quality: High res (1440 dpi)',
          },
        ],
      },
    ],
  },
  s8: {
    id: 's8',
    name: 'Stickers & Labels',
    intro: 'Stickers need precise cutlines, so let us know the size, quantity, material, and shape.',
    steps: [
      {
        question: 'How big is the sticker?',
        choices: [
          {
            label: 'Width × height',
            description: 'Give a precise size in mm or cm.',
            vendorParameter: 'Dimensions: W × H in mm',
          },
        ],
      },
      {
        question: 'How many do you need?',
        choices: [
          {
            label: 'Enter quantity',
            description: 'We offer small and bulk runs.',
            vendorParameter: 'Quantity: [number]',
          },
        ],
      },
      {
        question: 'What material should it use?',
        choices: [
          {
            label: 'Paper (for indoors)',
            description: 'Good for labels inside.',
            vendorParameter: 'Material: Paper (uncoated)',
          },
          {
            label: 'Plastic (for outdoors)',
            description: 'Weather-resistant vinyl.',
            vendorParameter: 'Material: White vinyl',
          },
        ],
      },
      {
        question: 'What shape should we cut?',
        choices: [
          {
            label: 'Square or circle',
            description: 'Simple shapes, fast cutting.',
            vendorParameter: 'Cut type: Square/rectangle or circle',
          },
          {
            label: 'Custom die-cut',
            description: 'Any custom silhouette you want.',
            vendorParameter: 'Cut type: Custom die-cut shape',
          },
        ],
      },
    ],
  },
  s9: {
    id: 's9',
    name: 'Vinyl & Wraps',
    intro: 'Vehicle wraps and window vinyl need exact coverage and surface type before we print.',
    steps: [
      {
        question: 'How big is the area?',
        choices: [
          {
            label: 'Width × height',
            description: 'Accurate dimensions get the layout right.',
            vendorParameter: 'Dimensions: W × H in mm',
          },
        ],
      },
      {
        question: 'What kind of vinyl do you expect?',
        choices: [
          {
            label: 'Normal Plastic (flat)',
            description: 'Standard surfaces like walls.',
            vendorParameter: 'Vinyl type: Calendered vinyl',
          },
          {
            label: 'Stretchy Plastic (cars)',
            description: 'For curved surfaces.',
            vendorParameter: 'Vinyl type: Cast vinyl (vehicle grade)',
          },
        ],
      },
      {
        question: 'Who installs it?',
        choices: [
          {
            label: 'I install it',
            description: 'You prefer a supply-only kit.',
            vendorParameter: 'Installation: Supply only',
          },
          {
            label: 'We do it',
            description: 'Add pro installation to the order.',
            vendorParameter: 'Installation: Professional installation included',
          },
        ],
      },
    ],
  },
  s10: {
    id: 's10',
    name: 'Packaging & Retail',
    intro: 'Boxes and bags need precise dimensions plus material and closing style.',
    steps: [
      {
        question: 'How big is the box or bag?',
        choices: [
          {
            label: 'Length × Width × Height',
            description: 'Provide each dimension in mm.',
            vendorParameter: 'Dimensions: L × W × H in mm',
          },
        ],
      },
      {
        question: 'How many do you want?',
        choices: [
          {
            label: 'Enter quantity',
            description: 'From sample to full production.',
            vendorParameter: 'Quantity: [number]',
          },
        ],
      },
      {
        question: 'What is it made of?',
        choices: [
          {
            label: 'Thin cardboard (folding cartons)',
            description: 'Light and crisp.',
            vendorParameter: 'Material: Standard cardstock',
          },
          {
            label: 'Thick cardboard (shipping boxes)',
            description: 'For heavier contents.',
            vendorParameter: 'Material: Corrugated cardboard',
          },
        ],
      },
      {
        question: 'How should it close?',
        choices: [
          {
            label: 'Normal flaps (tuck end)',
            description: 'Simple tuck closure.',
            vendorParameter: 'Finishing: Standard tuck end',
          },
          {
            label: 'Magnetic flap',
            description: 'Premium magnetic closure.',
            vendorParameter: 'Finishing: Magnetic flap',
          },
        ],
      },
    ],
  },
  s11: {
    id: 's11',
    name: 'Photo Printing',
    intro: 'Photos are about size and finish; tell us what you want and we will pick the right paper.',
    steps: [
      {
        question: 'How big is the picture?',
        choices: [
          {
            label: 'Standard photo sizes',
            description: '4×6, 5×7, or similar.',
            vendorParameter: 'Size: Standard photo dimensions',
          },
          {
            label: 'Very big enlargement',
            description: 'Custom statement pieces.',
            vendorParameter: 'Size: Custom enlargement (W × H in mm)',
          },
        ],
      },
      {
        question: 'What kind of paper should we use?',
        choices: [
          {
            label: 'Glossy photo paper',
            description: 'Shiny finish for photos.',
            vendorParameter: 'Paper type: Glossy photo',
          },
          {
            label: 'Canvas',
            description: 'Like a painting.',
            vendorParameter: 'Paper type: Canvas',
          },
        ],
      },
      {
        question: 'How do you want it finished?',
        choices: [
          {
            label: 'Print only',
            description: 'Just the photo, no mounts.',
            vendorParameter: 'Mounting: None (print only)',
          },
          {
            label: 'Wrap on a frame',
            description: 'Canvas gallery wrap.',
            vendorParameter: 'Mounting: Gallery wrap (canvas)',
          },
        ],
      },
    ],
  },
};

export type WorkflowGuideKey = keyof typeof workflowGuides;

const resolveWorkflowGuide = (id?: string): WorkflowGuide | undefined => {
  if (!id) {
    return undefined;
  }

  const prefix = id.split('-')[0] as WorkflowGuideKey;
  return workflowGuides[prefix];
};

export const getWorkflowForCategory = (categoryId?: string): WorkflowGuide | undefined => {
  return resolveWorkflowGuide(categoryId);
};

export const getWorkflowForPrintableId = (printableId?: string): WorkflowGuide | undefined => {
  return resolveWorkflowGuide(printableId);
};

export const workflowGuidePrefixes = Object.keys(workflowGuides) as WorkflowGuideKey[];
