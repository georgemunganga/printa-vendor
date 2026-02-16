/**
 * BOTTOM SHEET USAGE EXAMPLES
 *
 * This file contains examples of how to use the BottomSheet component.
 * Copy and paste these patterns into your components.
 */

import React from "react";
import { BottomSheet, BottomSheetSimple, useBottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════
// Example 1: Basic bottom sheet with title and description
// ═══════════════════════════════════════════════════════════════

export const BasicExample = () => {
  const { isOpen, open, close } = useBottomSheet();

  return (
    <>
      <Button onClick={open}>Open Bottom Sheet</Button>

      <BottomSheet
        open={isOpen}
        onClose={close}
        title="Select an option"
        description="Choose from the options below"
      >
        <div className="space-y-2">
          <button className="w-full p-3 text-left rounded-xl hover:bg-gray-50">
            Option 1
          </button>
          <button className="w-full p-3 text-left rounded-xl hover:bg-gray-50">
            Option 2
          </button>
          <button className="w-full p-3 text-left rounded-xl hover:bg-gray-50">
            Option 3
          </button>
        </div>
      </BottomSheet>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// Example 2: Simple bottom sheet without header (custom layout)
// ═══════════════════════════════════════════════════════════════

export const SimpleExample = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Simple Sheet</Button>

      <BottomSheetSimple
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="p-6"
      >
        <h3 className="text-xl font-bold mb-4">Custom Layout</h3>
        <p className="text-gray-600 mb-4">
          You have full control over the layout.
        </p>
        <Button onClick={() => setIsOpen(false)} className="w-full">
          Close
        </Button>
      </BottomSheetSimple>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// Example 3: Form in bottom sheet
// ═══════════════════════════════════════════════════════════════

export const FormExample = () => {
  const { isOpen, open, close } = useBottomSheet();
  const [name, setName] = React.useState("");

  const handleSubmit = () => {
    console.log("Submitted:", name);
    close();
  };

  return (
    <>
      <Button onClick={open}>Add Item</Button>

      <BottomSheet
        open={isOpen}
        onClose={close}
        title="Add new item"
        description="Fill in the details below"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl"
              placeholder="Enter name"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={close} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// Example 4: List selection
// ═══════════════════════════════════════════════════════════════

export const ListExample = () => {
  const { isOpen, open, close } = useBottomSheet();
  const [selected, setSelected] = React.useState<string | null>(null);

  const items = [
    { id: "1", name: "Option A", desc: "First option" },
    { id: "2", name: "Option B", desc: "Second option" },
    { id: "3", name: "Option C", desc: "Third option" },
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    close();
  };

  return (
    <>
      <Button onClick={open}>
        {selected ? `Selected: ${items.find((i) => i.id === selected)?.name}` : "Select"}
      </Button>

      <BottomSheet open={isOpen} onClose={close} title="Choose an option">
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="w-full p-3 text-left rounded-xl hover:bg-gray-50 border border-gray-100"
            >
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// Example 5: Confirmation dialog
// ═══════════════════════════════════════════════════════════════

export const ConfirmExample = () => {
  const { isOpen, open, close } = useBottomSheet();

  const handleConfirm = () => {
    console.log("Confirmed!");
    close();
  };

  return (
    <>
      <Button onClick={open} variant="destructive">
        Delete Item
      </Button>

      <BottomSheet
        open={isOpen}
        onClose={close}
        title="Are you sure?"
        description="This action cannot be undone."
      >
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={close} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-red-600 hover:bg-red-700">
            Delete
          </Button>
        </div>
      </BottomSheet>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// Example 6: Using state directly (without hook)
// ═══════════════════════════════════════════════════════════════

export const StateExample = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open</Button>

      <BottomSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Direct State Control"
      >
        <p className="text-gray-600">
          You can use useState directly if you prefer.
        </p>
      </BottomSheet>
    </>
  );
};
