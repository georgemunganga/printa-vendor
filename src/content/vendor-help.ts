export type HelpIconName =
  | "rocket"
  | "orders"
  | "pos"
  | "inventory"
  | "store"
  | "team"
  | "billing"
  | "security"
  | "troubleshooting";

export interface HelpAction {
  label: string;
  path: string;
}

export interface HelpArticle {
  slug: string;
  title: string;
  summary: string;
  steps: string[];
  notes?: string[];
  action?: HelpAction;
}

export interface HelpTopic {
  slug: string;
  title: string;
  description: string;
  icon: HelpIconName;
  articles: HelpArticle[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    description: "Complete onboarding, approval, and your first store setup.",
    icon: "rocket",
    articles: [
      {
        slug: "complete-onboarding",
        title: "Complete vendor onboarding",
        summary: "Submit the business and store details Printa needs before your vendor workspace can be approved.",
        steps: [
          "Open vendor onboarding and complete every required business, contact, and store field.",
          "Review your operating details and submit the application.",
          "Wait for vendor approval. The portal will show when approval is still pending.",
          "After approval, open Stores and select the store you want to operate.",
        ],
        notes: ["Submitting onboarding does not approve the vendor automatically."],
        action: { label: "Open onboarding", path: "/onboarding" },
      },
      {
        slug: "select-a-store",
        title: "Select and return to a store",
        summary: "Choose the store whose orders, POS, inventory, and settings you want to manage.",
        steps: [
          "Open Stores from the vendor workspace.",
          "Choose a store and enter its staff PIN when required.",
          "The selected store remains active when you refresh the browser.",
          "Use Sign Out of Store in the sidebar when you need to return to the store list.",
        ],
        action: { label: "Open stores", path: "/dashboard/stores" },
      },
    ],
  },
  {
    slug: "orders-and-print-jobs",
    title: "Orders and print jobs",
    description: "Understand order types, production states, and customer communication.",
    icon: "orders",
    articles: [
      {
        slug: "print-jobs-and-till-sales",
        title: "Print jobs and till sales are different",
        summary: "Printa keeps production work separate from ordinary goods sold through the till.",
        steps: [
          "A print job contains a printable product and follows the production workflow.",
          "A till sale records ordinary custom inventory, such as shoes or accessories, without creating print production work.",
          "Order History labels each record as Print job or Till sale.",
          "The store production queue only shows work that requires printing.",
        ],
        action: { label: "Open order history", path: "/dashboard/orders" },
      },
      {
        slug: "manage-a-print-job",
        title: "Manage a print job",
        summary: "Review specifications and move a print order through each valid production stage once.",
        steps: [
          "Open the print job from the store queue or Order History.",
          "Review the customer, files, quantities, specifications, and fulfilment method.",
          "Start production only when the order is ready to be worked on.",
          "Use the next available status action as work progresses. Do not repeat the current status action.",
          "Mark the job ready or complete only after the corresponding work is finished.",
        ],
        notes: ["The backend is authoritative if another operator updates the order first. Refresh the job before retrying a rejected transition."],
        action: { label: "Open store queue", path: "/dashboard/store" },
      },
      {
        slug: "chat-with-a-customer",
        title: "Chat about an order",
        summary: "Use the order conversation when a specification, file, pickup, or delivery detail needs clarification.",
        steps: [
          "Open the chat bubble on an active print job or open Chat from the store navigation.",
          "Select the order conversation.",
          "Check the Order Context panel before replying so the message matches the correct customer and order.",
          "Send text or a supported attachment when it is needed to resolve the question.",
        ],
        action: { label: "Open chat", path: "/dashboard/chat" },
      },
    ],
  },
  {
    slug: "pos-and-receipts",
    title: "POS and receipts",
    description: "Run walk-in sales and give customers a receipt.",
    icon: "pos",
    articles: [
      {
        slug: "complete-a-pos-sale",
        title: "Complete a POS sale",
        summary: "Sell available store inventory from the till and record the correct order type.",
        steps: [
          "Open POS after selecting a store.",
          "Add visible products and adjust quantities in the order panel.",
          "Proceed to checkout and select an available payment method.",
          "Review the total and complete the sale once.",
          "A print product enters the production queue; an ordinary custom item is recorded as a till sale.",
        ],
        action: { label: "Open POS", path: "/dashboard/pos" },
      },
      {
        slug: "payment-methods",
        title: "POS payment methods",
        summary: "Choose only payment methods that are enabled in the checkout interface.",
        steps: [
          "Select Cash or another currently enabled method.",
          "Debit Card is marked Coming soon and cannot be used to proceed.",
          "Do not complete a sale until the customer payment has been confirmed by the method you selected.",
        ],
        notes: ["A disabled payment card keeps the Proceed button disabled."],
      },
      {
        slug: "print-or-email-a-receipt",
        title: "Print or email a receipt",
        summary: "Use the success panel after a completed sale to provide the customer with a receipt.",
        steps: [
          "Complete the POS sale and wait for the success panel.",
          "Choose Print receipt to open the browser print dialog.",
          "Choose Email receipt, enter the customer's email address, and select Send receipt.",
          "The email is sent through Printa; the portal does not open your personal email application.",
        ],
        action: { label: "Open POS", path: "/dashboard/pos" },
      },
    ],
  },
  {
    slug: "inventory",
    title: "Inventory",
    description: "Manage Printa catalogue products and vendor-owned custom items.",
    icon: "inventory",
    articles: [
      {
        slug: "printa-and-custom-inventory",
        title: "Printa inventory and custom inventory",
        summary: "Use the inventory tabs to keep platform print products separate from goods your shop creates.",
        steps: [
          "Open Inventory and use Printa inventory for catalogue products claimed by this store.",
          "Use Custom inventory for vendor-owned goods or services outside the Printa catalogue.",
          "Select New Product and choose the inventory type in the first wizard step.",
          "For a custom item, enter its name and category; the SKU is optional and can be generated.",
          "Set the store price, stock quantity, and POS visibility before saving.",
        ],
        action: { label: "Open inventory", path: "/dashboard/inventory" },
      },
      {
        slug: "stock-and-visibility",
        title: "Control stock and POS visibility",
        summary: "Keep quantities current and decide which items cashiers can sell.",
        steps: [
          "Edit an inventory item to change its price or stock quantity.",
          "Turn Visible in POS on when the item should appear at the till.",
          "Hide an item when it should remain in inventory but must not be sold.",
          "Completed POS sales reduce stock for the store item sold.",
        ],
        notes: ["An item without an image uses the standard product icon."],
        action: { label: "Open inventory", path: "/dashboard/inventory" },
      },
    ],
  },
  {
    slug: "store-settings",
    title: "Store settings",
    description: "Configure store identity, operations, notifications, privacy, and security.",
    icon: "store",
    articles: [
      {
        slug: "configure-your-store",
        title: "Configure your store",
        summary: "Store owners and authorised managers can update the information used across the portal.",
        steps: [
          "Select the store and open Store Settings.",
          "Update store details used on POS, receipts, orders, and customer-facing surfaces.",
          "Review operating hours and availability settings before accepting work.",
          "Save one settings section at a time and wait for confirmation.",
        ],
        notes: ["A staff member needs the relevant settings permission. The backend still checks every update."],
        action: { label: "Open store settings", path: "/dashboard/settings" },
      },
    ],
  },
  {
    slug: "team-and-access",
    title: "Team and access",
    description: "Invite staff, assign permissions, and operate store shifts.",
    icon: "team",
    articles: [
      {
        slug: "roles-and-permissions",
        title: "Roles and permissions",
        summary: "Give each team member access to the work they are responsible for.",
        steps: [
          "Open Team from the owner workspace.",
          "Add or invite the team member and assign the appropriate role.",
          "Choose their store access and permissions.",
          "Ask the team member to sign in and verify only the authorised navigation and actions are available.",
        ],
        notes: ["Only authorised users can manage the team. Hidden controls do not replace backend permission checks."],
        action: { label: "Open team", path: "/dashboard/team" },
      },
      {
        slug: "staff-pins-and-shifts",
        title: "Staff PINs and shifts",
        summary: "Use staff PIN access for store operations and shift records.",
        steps: [
          "Select the store and enter the assigned staff PIN when prompted.",
          "Open Shift Management to begin or end a store shift where required.",
          "Use the staff PIN reset flow if access has been lost.",
          "Sign out of the store when handing the device to another operator.",
        ],
        action: { label: "Open shift management", path: "/dashboard/shift-management" },
      },
    ],
  },
  {
    slug: "subscriptions-and-payments",
    title: "Subscriptions and payments",
    description: "Compare the two vendor plans and activate one with mobile money.",
    icon: "billing",
    articles: [
      {
        slug: "vendor-plans",
        title: "Vendor subscription plans",
        summary: "Printa currently presents Pro at K500 and Enterprise at K1,500, subject to the live plan catalogue.",
        steps: [
          "Open Subscription from the owner workspace.",
          "Compare the live Pro and Enterprise plan features.",
          "Select the plan that fits the vendor operation.",
          "The amount shown by the live billing catalogue is authoritative before payment.",
        ],
        action: { label: "Open subscription", path: "/dashboard/subscription" },
      },
      {
        slug: "pay-with-mobile-money",
        title: "Activate a subscription with mobile money",
        summary: "Start the subscription checkout and approve the payment request on the registered phone.",
        steps: [
          "Select a configured plan and continue to payment.",
          "Enter the mobile money number and choose MTN, Airtel, or Zamtel.",
          "Confirm the payment request on the phone.",
          "Return to the portal and verify the checkout if it does not update automatically.",
        ],
        notes: ["Do not submit repeated payments while the first checkout is still being verified."],
        action: { label: "Open subscription", path: "/dashboard/subscription" },
      },
    ],
  },
  {
    slug: "account-and-security",
    title: "Account and security",
    description: "Manage profile details, sessions, and permission errors.",
    icon: "security",
    articles: [
      {
        slug: "session-and-refresh",
        title: "Session and browser refresh",
        summary: "A valid session and selected store are restored after a normal browser refresh.",
        steps: [
          "Sign in through the vendor portal and select a store.",
          "Refresh the current page; the portal should restore the same authorised workspace.",
          "If the session has expired or been revoked, sign in again.",
          "If the wrong store is active, use Sign Out of Store and choose the correct store.",
        ],
        action: { label: "Open profile", path: "/dashboard/profile" },
      },
      {
        slug: "permission-denied",
        title: "Resolve a permission error",
        summary: "A permission message usually means the current staff role cannot use that route or action.",
        steps: [
          "Confirm that you selected the intended store.",
          "Ask the store owner or an authorised manager to review your role and permissions.",
          "Refresh after the permission is updated.",
          "Contact Printa Support if the backend still rejects an action the role should allow.",
        ],
        action: { label: "Open team access", path: "/dashboard/team" },
      },
    ],
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Recover from connection, loading, payment, and workflow errors.",
    icon: "troubleshooting",
    articles: [
      {
        slug: "page-or-data-will-not-load",
        title: "A page or its data will not load",
        summary: "Use the visible retry path and capture useful context if the problem continues.",
        steps: [
          "Check the connection message in the portal and confirm the device is online.",
          "Use Retry on the affected card or page instead of submitting the business action again.",
          "Refresh once if no mutation is pending.",
          "If the error continues, contact support with the route, store, time, and exact message.",
        ],
        notes: ["Do not include passwords, one-time codes, card details, or mobile money PINs in a support request."],
        action: { label: "Contact support", path: "/dashboard/support" },
      },
      {
        slug: "order-status-conflict",
        title: "An order status action is rejected",
        summary: "The order may already be in that state or another operator may have updated it first.",
        steps: [
          "Read the current status shown on the order.",
          "Refresh the order to retrieve the authoritative backend state.",
          "Use only the next action made available by the refreshed page.",
          "Contact support with the order ID and exact error if no valid next action appears.",
        ],
        action: { label: "Open order history", path: "/dashboard/orders" },
      },
    ],
  },
];

export const FEATURED_ARTICLES = [
  ["getting-started", "select-a-store"],
  ["orders-and-print-jobs", "print-jobs-and-till-sales"],
  ["pos-and-receipts", "complete-a-pos-sale"],
  ["inventory", "printa-and-custom-inventory"],
] as const;

export const getHelpTopic = (topicSlug?: string) => HELP_TOPICS.find((topic) => topic.slug === topicSlug);

export const getHelpArticle = (topicSlug?: string, articleSlug?: string) => {
  const topic = getHelpTopic(topicSlug);
  return { topic, article: topic?.articles.find((article) => article.slug === articleSlug) };
};

export const searchHelp = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return HELP_TOPICS.flatMap((topic) => topic.articles
    .filter((article) => [topic.title, article.title, article.summary, ...article.steps, ...(article.notes ?? [])].join(" ").toLowerCase().includes(normalized))
    .map((article) => ({ topic, article })));
};
