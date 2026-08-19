import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface OnboardingLegalDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  version: string;
  document: string;
  acknowledged: boolean;
  onAcknowledge: () => void;
}

/**
 * Displays the complete legal text in the same desktop-dialog/mobile-sheet
 * pattern used elsewhere in the portal. A caller may enable its checkbox only
 * after the user makes the explicit acknowledgement at the bottom.
 */
export function OnboardingLegalDocumentModal({
  open,
  onOpenChange,
  title,
  version,
  document,
  acknowledged,
  onAcknowledge,
}: OnboardingLegalDocumentModalProps) {
  const acknowledge = () => {
    onAcknowledge();
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={`Version ${version} — please read the full document before acknowledging.`}
      className="max-h-[92vh] overflow-hidden p-0 sm:max-w-3xl"
    >
      <div className="flex max-h-[calc(92vh-5rem)] min-h-[480px] flex-col bg-white">
        <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-5 py-4 sm:px-7">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-printa-red shadow-sm">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Full document reader</p>
            <p className="mt-0.5 text-xs leading-5 text-gray-600">Scroll through the document, then confirm that you have read it. Your final consent remains a separate affirmative checkbox in onboarding.</p>
          </div>
        </div>

        <article className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm leading-6 text-gray-700 sm:px-7">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="mb-4 text-xl font-bold text-gray-900">{children}</h1>,
              h2: ({ children }) => <h2 className="mb-3 mt-7 text-base font-bold text-gray-900">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-2 mt-5 text-sm font-bold text-gray-900">{children}</h3>,
              p: ({ children }) => <p className="mb-3">{children}</p>,
              a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-printa-red underline underline-offset-2">{children}</a>,
              blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-printa-red/40 bg-red-50 px-4 py-3 text-gray-700">{children}</blockquote>,
              ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-5">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-5">{children}</ol>,
              table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="w-full border-collapse text-left text-xs">{children}</table></div>,
              th: ({ children }) => <th className="border border-gray-200 bg-gray-50 px-3 py-2 font-semibold text-gray-900">{children}</th>,
              td: ({ children }) => <td className="border border-gray-200 px-3 py-2 align-top">{children}</td>,
            }}
          >
            {document}
          </ReactMarkdown>
        </article>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
          <p className="hidden text-xs text-gray-400 sm:block">{acknowledged ? "You have acknowledged this document." : "Acknowledgement does not submit onboarding yet."}</p>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Close</Button>
          <Button type="button" className="rounded-xl bg-printa-red text-white hover:bg-red-700" onClick={acknowledge}>
            <Check size={16} className="mr-1.5" />
            {acknowledged ? "Read again & close" : "I have read and understand"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
