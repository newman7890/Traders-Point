import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Shield,
  Lock,
  Eye,
  Database,
  Bell,
  Users,
  Globe,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Truck,
  Store,
  DollarSign,
  Scale,
  Clock,
  Printer,
  ExternalLink,
  HelpCircle,
  KeyRound,
  ShieldAlert,
  ShoppingBag,
  BadgeCheck,
  X,
  ChevronRight,
  PhoneCall,
  Mail,
  Share2
} from "lucide-react";
import { toast } from "sonner";

export type PolicyTab = "terms" | "privacy" | "buyer" | "seller" | "rider";

interface PolicySection {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
  highlight?: string;
  content: string[];
  subsections?: {
    subtitle: string;
    points: string[];
  }[];
}

interface TabData {
  id: PolicyTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  sections: PolicySection[];
}

interface PrivacyPolicyProps {
  defaultTab?: PolicyTab;
}

const POLICY_DATA: TabData[] = [
  {
    id: "terms",
    label: "Terms of Service",
    shortLabel: "Terms",
    icon: Scale,
    description: "Official agreement governing the use of TradesPoint.store marketplace and services.",
    sections: [
      {
        id: "terms-acceptance",
        title: "1. Acceptance of Terms & Eligibility",
        icon: Scale,
        badge: "Binding Agreement",
        content: [
          "Welcome to TradesPoint.store. By accessing, browsing, registering an account, or conducting any transactions on our website or mobile applications, you agree to be bound by these Terms of Service.",
          "To use our platform, you must be at least 18 years of age or possess legal parental/guardian consent. By creating an account, you represent and warrant that you meet all eligibility requirements.",
          "These terms constitute a legally binding agreement between you and TradesPoint.store (operated in Ghana). If you do not agree with any part of these terms, you must immediately discontinue use of the platform.",
        ],
      },
      {
        id: "terms-account",
        title: "2. User Accounts & Security",
        icon: Lock,
        badge: "Security Standard",
        content: [
          "You are responsible for maintaining the confidentiality of your account credentials, login passwords, and OTP codes. You agree to accept responsibility for all activities that occur under your account.",
          "You must provide accurate, current, and complete information during registration and keep your contact details updated.",
          "Account sharing, multi-account manipulation, creation of fake profiles, or identity impersonation is strictly prohibited and results in immediate account suspension and blacklisting.",
        ],
      },
      {
        id: "terms-orders-pricing",
        title: "3. Pricing, Payments & Currency",
        icon: DollarSign,
        badge: "GH₵ (GHS)",
        content: [
          "All prices on TradesPoint.store are listed in Ghana Cedis (GH₵ / GHS) and include all applicable platform processing fees unless otherwise stated.",
          "We process payments securely through our certified payment partner Paystack, supporting Visa, Mastercard, MTN Mobile Money (MoMo), Telecel Cash, AT Money, and Cash on Delivery (COD) where available.",
          "While we take all reasonable steps to ensure accurate catalog pricing, inadvertent typographical errors or system glitches may occur. In such rare events, TradesPoint reserves the right to cancel the order and provide a 100% full refund to the buyer.",
        ],
      },
      {
        id: "terms-fulfillment",
        title: "4. Order Fulfillment & Delivery",
        icon: Truck,
        badge: "24–48h Dispatch",
        content: [
          "Sellers are required to process, pack, and prepare orders for dispatch within 24 to 48 hours of order placement.",
          "Delivery is fulfilled by verified TradesPoint logistics riders and delivery partners. Real-time GPS tracking and live status updates are provided via your order confirmation and tracking portal.",
          "Every order requires a secure 4-digit Delivery OTP (One-Time Password) that the customer must provide to the rider upon package inspection to complete the delivery handoff.",
        ],
      },
      {
        id: "terms-prohibited",
        title: "5. Prohibited Conduct & Activities",
        icon: ShieldAlert,
        badge: "Strict Zero Tolerance",
        content: [
          "Users agree not to engage in any fraudulent, unlawful, deceptive, or abusive behavior on the platform.",
          "Prohibited activities include: attempting to bypass payment channels, contacting riders or sellers for illicit off-platform settlements, posting defamatory reviews, submitting fake orders, and uploading malicious code.",
          "Violators are subject to immediate account termination, forfeiture of funds, and legal escalation to law enforcement agencies.",
        ],
      },
      {
        id: "terms-ip",
        title: "6. Intellectual Property",
        icon: FileText,
        badge: "Protected",
        content: [
          "All platform content, graphics, logos, button icons, software, UI design, database structures, and trade names are the exclusive property of TradesPoint.store or its content suppliers.",
          "Sellers warrant that all product images, descriptions, and media they upload do not infringe upon any third-party copyrights, patents, or trademarks.",
        ],
      },
      {
        id: "terms-liability",
        title: "7. Limitation of Liability & Disclaimers",
        icon: Shield,
        badge: "Marketplace Intermediary",
        content: [
          "TradesPoint acts as a multi-vendor marketplace connecting verified independent sellers, licensed logistics riders, and end customers.",
          "To the maximum extent permitted by applicable law in Ghana, TradesPoint shall not be liable for indirect, incidental, punitive, or consequential damages resulting from third-party vendor products beyond our established Buyer Protection and Return Policy.",
        ],
      },
      {
        id: "terms-governing",
        title: "8. Governing Law & Dispute Resolution",
        icon: Scale,
        badge: "Republic of Ghana",
        content: [
          "These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Ghana.",
          "Any dispute, controversy, or claim arising out of or relating to your use of TradesPoint shall first be submitted to TradesPoint Customer Mediation. If unresolved within 30 days, it shall be resolved by competent courts in Ghana.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    shortLabel: "Privacy",
    icon: Lock,
    description: "How TradesPoint collects, secures, uses, and protects your personal data and privacy.",
    sections: [
      {
        id: "privacy-collection",
        title: "1. Information We Collect",
        icon: Database,
        badge: "Data Minimization",
        content: [
          "We collect only the essential personal information required to deliver a seamless e-commerce and delivery experience.",
        ],
        subsections: [
          {
            subtitle: "Personal & Contact Details",
            points: [
              "Full name, email address, active phone number, and account password (stored with cryptographic hashing).",
              "Saved delivery addresses, GPS drop-off coordinates, nearby landmarks, and recipient phone numbers.",
            ],
          },
          {
            subtitle: "Transaction & Payment Records",
            points: [
              "Order history, items purchased, transaction reference codes, and billing details.",
              "Note: Sensitive credit card details and MoMo PINs are never stored on TradesPoint servers. They are tokenized and processed exclusively by PCI-DSS Level 1 certified Paystack.",
            ],
          },
          {
            subtitle: "Technical & Device Diagnostics",
            points: [
              "Device type, operating system version, browser type, IP address, and FCM tokens for push notification delivery.",
              "Live delivery location data shared temporarily during active order transit.",
            ],
          },
        ],
      },
      {
        id: "privacy-usage",
        title: "2. How We Use Your Data",
        icon: Eye,
        badge: "Purpose-Driven",
        content: [
          "We use the collected information for specific, legitimate business purposes:",
          "• Order Processing & Fulfillment: Transmitting necessary delivery details to assigned riders and sellers.",
          "• Real-Time Order Tracking: Enabling live GPS package status updates and OTP verification.",
          "• Platform Communications: Sending transactional SMS, email confirmations, delivery receipts, and critical security alerts.",
          "• Fraud Prevention & Security: Detecting unauthorized logins, fake orders, and suspicious payment behavior.",
          "• Customer Service: Assisting with inquiries, cancellations, disputes, and returns.",
        ],
      },
      {
        id: "privacy-sharing",
        title: "3. Information Sharing & Third Parties",
        icon: Users,
        badge: "Zero Data Sale",
        content: [
          "TradesPoint does NOT sell, rent, or trade your personal information to third-party marketing companies.",
          "We only share required data with:",
          "• Assigned Delivery Riders: First name, delivery address, and contact number strictly during the active delivery window.",
          "• Marketplace Sellers: Item specifications and buyer shipping details needed to pack and fulfill the order.",
          "• Payment Gateway: Paystack for secure transaction clearing.",
          "• Regulatory & Law Enforcement: Strictly when required under Ghanaian statutory laws or court orders.",
        ],
      },
      {
        id: "privacy-security",
        title: "4. Data Security & Storage",
        icon: Shield,
        badge: "256-bit TLS / RLS",
        content: [
          "All data transmitted between your browser/app and our servers is secured using modern TLS 1.3 / SSL 256-bit encryption.",
          "Database operations employ strict PostgreSQL Row-Level Security (RLS) policies, guaranteeing that users, sellers, and riders can only access authorized data records.",
          "Automated vulnerability scans, encrypted backups, and access-control mechanisms are enforced round the clock.",
        ],
      },
      {
        id: "privacy-cookies",
        title: "5. Cookies & Local Storage",
        icon: Globe,
        badge: "Essential & Functional",
        content: [
          "We utilize lightweight cookies and browser local storage to:",
          "• Maintain your secure login session across app navigation.",
          "• Remember items in your shopping bag and recently viewed products.",
          "• Save your chosen language preferences (English, French, Spanish, etc.).",
          "You can clear or disable cookies in your browser settings at any time.",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. Your Privacy Rights & Data Control",
        icon: CheckCircle2,
        badge: "User Empowerment",
        content: [
          "You maintain full control over your personal data on TradesPoint:",
          "• Right to Access: View and review your profile and order history at any time.",
          "• Right to Rectification: Update your contact details, names, and addresses in Settings.",
          "• Right to Erasure: Request permanent deletion of your account and personal records by contacting support.",
          "• Opt-Out: Unsubscribe from promotional marketing messages with a single click.",
        ],
      },
    ],
  },
  {
    id: "buyer",
    label: "Buyer Protection & Returns",
    shortLabel: "Buyer & Returns",
    icon: RotateCcw,
    description: "Our 48-Hour Return Guarantee, secure OTP handoff, and full refund policy.",
    sections: [
      {
        id: "buyer-guarantee",
        title: "1. The TradesPoint Buyer Guarantee",
        icon: BadgeCheck,
        badge: "100% Protected",
        content: [
          "Every purchase made on TradesPoint.store is backed by our comprehensive Buyer Protection Program.",
          "When you place an order, your payment is held safely in escrow until the package is delivered to you and confirmed via your secret Delivery OTP.",
          "If an item is counterfeit, damaged during transport, defective, or significantly different from the seller's catalog listing, you are entitled to a free return and 100% full refund.",
        ],
      },
      {
        id: "buyer-otp",
        title: "2. Delivery Inspection & OTP Verification",
        icon: KeyRound,
        badge: "Critical Step",
        content: [
          "For your security, every order is assigned a unique 4-digit Delivery OTP displayed on your Order Details and Tracking page.",
          "When the rider arrives with your order:",
          "1. Inspect the exterior package and confirm the seller's name and item count.",
          "2. Only provide the 4-digit OTP to the rider once you have physically received the package.",
          "⚠️ Never disclose your Delivery OTP over phone calls or WhatsApp before the rider has arrived at your location.",
        ],
      },
      {
        id: "buyer-window",
        title: "3. 48-Hour Return Window",
        icon: Clock,
        badge: "48 Hours",
        content: [
          "Buyers have exactly 48 hours from the timestamp of confirmed delivery to initiate a return request.",
          "Eligibility requirements for returns:",
          "• Item is damaged, defective, or malfunctioning upon unboxing.",
          "• Item received is the wrong model, color, size, or significantly misdescribed.",
          "• Item must be in original condition with all manufacturer packaging, tags, cables, user manuals, and warranty cards included.",
        ],
      },
      {
        id: "buyer-non-returnable",
        title: "4. Non-Returnable Items",
        icon: AlertTriangle,
        badge: "Exceptions",
        content: [
          "For hygiene, safety, and regulatory reasons, the following items cannot be returned unless delivered damaged or defective:",
          "• Perishable food items and groceries.",
          "• Intimate apparel, swimwear, and personal hygiene products (if seal is opened).",
          "• Customized, personalized, or engraved items.",
          "• Digital gift cards or downloadable software keys.",
        ],
      },
      {
        id: "buyer-refunds",
        title: "5. Refund Timelines & Methods",
        icon: DollarSign,
        badge: "Fast Settlement",
        content: [
          "Once a returned item is received and inspected by our verification team:",
          "• Mobile Money (MTN, Telecel, AT): Refunds reflect within 12 to 24 hours.",
          "• Card Payments (Visa/Mastercard): Refunds reflect in 2 to 5 business days depending on your bank.",
          "• Store Credit: Instant 100% wallet credit available for immediate re-use on any item.",
        ],
      },
      {
        id: "buyer-cancellation",
        title: "6. Order Cancellation Policy",
        icon: X,
        badge: "Free Cancellation",
        content: [
          "Buyers may cancel any order free of charge as long as the seller has not marked the order as dispatched or handed it to a logistics rider.",
          "If the order is already out for delivery with a rider, standard return procedures apply upon delivery.",
        ],
      },
    ],
  },
  {
    id: "seller",
    label: "Seller Guidelines & Payouts",
    shortLabel: "Seller Policy",
    icon: Store,
    description: "Marketplace standards, listing compliance, commission structure, and seller payouts.",
    sections: [
      {
        id: "seller-verification",
        title: "1. Seller Onboarding & KYC",
        icon: BadgeCheck,
        badge: "Verified Merchants",
        content: [
          "To maintain marketplace integrity, all merchants must undergo identity verification (Ghana Card, Business Registration, or verified phone number).",
          "TradesPoint reviews and approves seller store applications before listings go live.",
          "Sellers are responsible for keeping inventory levels accurate and prices competitive.",
        ],
      },
      {
        id: "seller-prohibited-items",
        title: "2. Prohibited & Restricted Products",
        icon: ShieldAlert,
        badge: "Zero Tolerance",
        content: [
          "Sellers must never list or sell:",
          "• Counterfeit, replica, pirated, or unauthorized reproduction goods.",
          "• Illegal narcotics, prescription drugs without proper licensing, or hazardous substances.",
          "• Weapons, explosives, stolen items, or counterfeit currencies.",
          "Violating stores are permanently closed and reported to regulatory authorities.",
        ],
      },
      {
        id: "seller-fulfillment-sla",
        title: "3. Fulfillment & Dispatch SLA (24–48h)",
        icon: Clock,
        badge: "Strict SLA",
        content: [
          "Sellers must confirm and package orders within 24 hours of notification.",
          "Packages must be securely sealed, labeled with the TradesPoint Order ID, and handed to the assigned rider promptly.",
          "Repeated late fulfillments, out-of-stock cancellations, or ghost orders degrade seller score and lead to store deactivation.",
        ],
      },
      {
        id: "seller-commission-payouts",
        title: "4. Commission & Payout Schedule",
        icon: DollarSign,
        badge: "Automated Payouts",
        content: [
          "TradesPoint charges a transparent platform commission (standard 15% or category-specific rate) deducted automatically at payout.",
          "Payouts are disbursed automatically to the seller's registered Mobile Money or Bank Account upon verified order completion.",
          "Sellers can monitor real-time earnings, pending settlements, and payout logs from their Seller Dashboard.",
        ],
      },
    ],
  },
  {
    id: "rider",
    label: "Rider Code of Conduct",
    shortLabel: "Rider Policy",
    icon: Truck,
    description: "Delivery standards, mandatory OTP verification, safety, and anti-harassment rules.",
    sections: [
      {
        id: "rider-otp",
        title: "1. Mandatory Delivery OTP Verification",
        icon: KeyRound,
        badge: "Strict Rule",
        content: [
          "Riders must NEVER mark an order as 'Delivered' without physically receiving and entering the customer's 4-digit Delivery OTP into the Rider App.",
          "Bypassing OTP, guessing codes, or marking items delivered before customer handoff constitutes immediate grounds for permanent account termination.",
        ],
      },
      {
        id: "rider-conduct",
        title: "2. Professionalism & Customer Respect",
        icon: Users,
        badge: "Zero Harassment",
        content: [
          "Riders must treat all customers, sellers, and platform agents with courtesy and respect.",
          "Zero tolerance for verbal abuse, sexual harassment, inappropriate messages, or uninvited contact after delivery.",
          "Riders must wear clean apparel, carry approved delivery bags, and handle fragile parcels with extreme care.",
        ],
      },
      {
        id: "rider-anti-extortion",
        title: "3. Zero Extortion & Price Tampering",
        icon: ShieldAlert,
        badge: "Fixed Fees",
        content: [
          "All delivery fees are calculated and collected through TradesPoint.store.",
          "Riders are strictly forbidden from demanding additional unauthorized 'tips', fuel surcharges, or inflated delivery fees from customers or sellers.",
        ],
      },
      {
        id: "rider-gps-safety",
        title: "4. GPS Tracking & Road Safety",
        icon: Globe,
        badge: "Live Safety",
        content: [
          "Riders must keep GPS location services active during transit for real-time customer tracking and safety.",
          "Riders must comply with all national traffic regulations, helmet laws, and speed limits across Ghana.",
          "Using GPS spoofers, mock locations, or multi-accounting results in permanent blacklist.",
        ],
      },
    ],
  },
];

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ defaultTab = "privacy" }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Determine active tab from URL search param `tab` or defaultTab prop
  const activeTab = useMemo<PolicyTab>(() => {
    const tabParam = searchParams.get("tab") as PolicyTab | null;
    if (tabParam && POLICY_DATA.some((t) => t.id === tabParam)) {
      return tabParam;
    }
    return defaultTab;
  }, [searchParams, defaultTab]);

  const handleTabChange = (newTab: PolicyTab) => {
    setSearchParams({ tab: newTab });
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentTabData = useMemo(() => {
    return POLICY_DATA.find((t) => t.id === activeTab) || POLICY_DATA[0];
  }, [activeTab]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return currentTabData.sections;
    const q = searchQuery.toLowerCase();
    return currentTabData.sections.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchBadge = s.badge?.toLowerCase().includes(q);
      const matchContent = s.content.some((c) => c.toLowerCase().includes(q));
      const matchSub = s.subsections?.some(
        (sub) =>
          sub.subtitle.toLowerCase().includes(q) ||
          sub.points.some((p) => p.toLowerCase().includes(q))
      );
      return matchTitle || matchBadge || matchContent || matchSub;
    });
  }, [currentTabData, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `TradesPoint.store - ${currentTabData.label}`,
          text: `Read the official ${currentTabData.label} for TradesPoint.store`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Policy link copied to clipboard!");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-foreground pb-24 print:bg-white print:text-black print:pb-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/60 px-4 py-3 print:hidden">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full border border-border/80 flex items-center justify-center hover:bg-secondary/60 transition-colors"
                aria-label="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2 font-plus-jakarta">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  TradesPoint Policy Center
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  Official Terms, Privacy & Marketplace Standards
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                title="Print Policy"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                title="Share Policy Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 pt-6 sm:pt-8">
          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white p-6 sm:p-8 mb-6 shadow-xl border border-emerald-800/30"
          >
            <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute right-6 bottom-6 opacity-10 pointer-events-none">
              <Shield className="w-48 h-48 text-emerald-300" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Official TradesPoint.store Policies
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Transparency, Security & Trust
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed mb-4">
                Learn how we safeguard your personal data, secure payments in escrow, guarantee authentic goods, and enforce strict delivery standards across Ghana.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Effective: September 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Governed by the Laws of Ghana
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  256-bit Encrypted
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3.5 border border-border/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">100% Authentic</p>
                <p className="text-[10px] text-muted-foreground">Buyer Protection</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3.5 border border-border/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">OTP Handoff</p>
                <p className="text-[10px] text-muted-foreground">Secure Deliveries</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3.5 border border-border/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">48h Return Window</p>
                <p className="text-[10px] text-muted-foreground">Easy Money Back</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3.5 border border-border/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Zero Data Sale</p>
                <p className="text-[10px] text-muted-foreground">GDPR & DPA 2012</p>
              </div>
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <div className="sticky top-16 z-20 bg-[#F8FAFC]/90 dark:bg-[#0B0F19]/90 backdrop-blur-md pt-1 pb-3 mb-4 print:hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar p-1 bg-secondary/40 dark:bg-slate-900/90 rounded-2xl border border-border/60">
              {POLICY_DATA.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar & Tab Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-border/80 shadow-sm mb-6 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 font-plus-jakarta">
                  {React.createElement(currentTabData.icon, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400" })}
                  {currentTabData.label}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {currentTabData.description}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${currentTabData.shortLabel}...`}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {searchQuery && (
              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Showing {filteredSections.length} result{filteredSections.length !== 1 ? "s" : ""} for{" "}
                  <strong className="text-foreground">"{searchQuery}"</strong>
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Quick Jump Index (when not searching) */}
          {!searchQuery && (
            <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/60 print:hidden">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Table of Contents:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentTabData.sections.map((sec, idx) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(sec.id);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                        setActiveSectionId(sec.id);
                        setTimeout(() => setActiveSectionId(null), 2000);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border/80 text-[11px] font-medium text-muted-foreground hover:text-emerald-600 hover:border-emerald-500/40 transition-colors"
                  >
                    <span className="text-emerald-600 font-bold">{idx + 1}.</span>
                    <span className="truncate max-w-[180px] sm:max-w-none">{sec.title.replace(/^\d+\.\s*/, "")}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Policy Sections Accordions / Cards */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {filteredSections.length > 0 ? (
                filteredSections.map((section, index) => {
                  const Icon = section.icon;
                  const isHighlighted = activeSectionId === section.id;
                  return (
                    <motion.article
                      id={section.id}
                      key={section.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.04 }}
                      className={`scroll-mt-32 rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border transition-all duration-300 shadow-sm ${
                        isHighlighted
                          ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.02]"
                          : "border-border/80 hover:border-border"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-foreground font-plus-jakarta">
                            {section.title}
                          </h4>
                        </div>

                        {section.badge && (
                          <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {section.badge}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {section.content.map((paragraph, pIdx) => (
                          <p key={pIdx} className="whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {section.subsections && (
                        <div className="mt-4 pt-3 border-t border-border/40 space-y-3.5">
                          {section.subsections.map((sub, sIdx) => (
                            <div key={sIdx} className="bg-secondary/20 dark:bg-slate-950/50 rounded-xl p-3.5 border border-border/40">
                              <h5 className="text-xs sm:text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {sub.subtitle}
                              </h5>
                              <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                {sub.points.map((pt, ptIdx) => (
                                  <li key={ptIdx} className="flex items-start gap-2">
                                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.article>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-border/80">
                  <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <h4 className="text-base font-bold text-foreground mb-1">No matching articles found</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    We couldn't find any policy sections matching "{searchQuery}".
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Links & Related Documentation */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
            <Link
              to="/sell"
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border/80 hover:border-emerald-500/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                    Become a Verified Seller
                  </h5>
                  <p className="text-xs text-muted-foreground">Learn about payouts, commission & onboarding</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
            </Link>

            <Link
              to="/rider/login"
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border/80 hover:border-emerald-500/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                    Rider Portal & Delivery Hub
                  </h5>
                  <p className="text-xs text-muted-foreground">Logistics code of conduct & live routing</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>

          {/* Support & Contact Card */}
          <div className="mt-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-slate-900/40 rounded-2xl p-6 border border-emerald-500/20 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Have Questions About Our Policies?
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                  Our dedicated compliance and customer support team is available 24/7 to assist with buyer protection claims, returns, or privacy inquiries.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to="/settings/contact"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <footer className="mt-12 text-center text-xs text-muted-foreground pb-6 border-t border-border/60 pt-6">
            <p className="font-medium text-foreground">
              TradesPoint.store — Multi-Vendor Marketplace & Delivery Network
            </p>
            <p className="mt-1 text-[11px]">
              © {new Date().getFullYear()} TradesPoint.store. All rights reserved. Registered in Accra, Ghana.
            </p>
          </footer>
        </div>
      </div>
      <div className="print:hidden">
        <BottomNav />
      </div>
    </>
  );
};

export default PrivacyPolicy;
