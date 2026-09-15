import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  DollarSign,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Lock,
  Percent,
  Clock,
  Building2,
  Smartphone,
  HelpCircle,
  Award,
  AlertTriangle,
  Scale,
  Ban,
  MessageSquare,
  Truck,
  PackageCheck,
  RefreshCw,
  Info,
  ShieldAlert,
  Gavel,
} from "lucide-react";

interface SellerDocumentationModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SellerDocumentationModal({
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: SellerDocumentationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (isControlled && externalOnOpenChange) {
      externalOnOpenChange(val);
    } else {
      setInternalOpen(val);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5 py-0.5 text-xs">
              <Award className="w-3.5 h-3.5" /> Trades Point Partner
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 mt-2">
            <BookOpen className="w-6 h-6 text-primary shrink-0" />
            Seller Account Guide, Payouts & Policies
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Read all details about registering your store, seller payouts, our 10% platform fee, seller terms, and the official TradesPoint.store Seller Policy before joining.
          </p>
        </DialogHeader>

        <Tabs defaultValue="payouts" className="mt-4 space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted rounded-xl gap-1">
            <TabsTrigger value="payouts" className="text-xs py-2 gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Payouts & 10% Fee
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs py-2 gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Registration Guide
            </TabsTrigger>
            <TabsTrigger value="terms" className="text-xs py-2 gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" /> Seller Policy (15 Articles)
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs py-2 gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Privacy & Security
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PAYOUTS & 10% FEE */}
          <TabsContent value="payouts" className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-300">
                  Transparent 10% Platform Commission Fee
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400">
                Trades Point charges a simple <strong>10% commission fee</strong> only when you successfully sell an item. There are no registration fees, no monthly subscriptions, and no hidden charges!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white dark:bg-card p-3 rounded-lg border text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Registration Fee</span>
                  <span className="text-lg font-extrabold text-emerald-600">GH₵ 0.00 (FREE)</span>
                </div>
                <div className="bg-white dark:bg-card p-3 rounded-lg border text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Monthly Fee</span>
                  <span className="text-lg font-extrabold text-emerald-600">GH₵ 0.00 (FREE)</span>
                </div>
                <div className="bg-white dark:bg-card p-3 rounded-lg border text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Seller Net Earnings</span>
                  <span className="text-lg font-extrabold text-primary">90% of Sale</span>
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-4 space-y-3 bg-card">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> How & When You Get Paid
              </h4>
              <p className="text-xs text-muted-foreground">
                When a customer buys your product on Trades Point, your funds are securely processed and transferred directly into your registered payout wallet:
              </p>

              <div className="space-y-2 pt-1 text-xs">
                <div className="p-3 bg-muted/60 rounded-lg flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Mobile Money Payouts (MTN, Telecel, AirtelTigo)</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Earnings are transferred directly into your MoMo account within <strong>24 hours (Next Business Day)</strong> after payment confirmation.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted/60 rounded-lg flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Bank Account Direct Deposits</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Bank transfers settle into your registered Ghana bank account within <strong>24–48 hours</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted/60 rounded-lg flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Hub Drop-off Verification</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Once you deliver sold items to any official Trades Point Hub, your earnings move to <em>"Paid Out"</em> in your seller dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Breakdown */}
            <div className="border rounded-xl p-4 space-y-2 text-xs bg-gray-50/50 dark:bg-muted/30">
              <h5 className="font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Real-World Example:
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 bg-white dark:bg-card rounded border">
                  <span className="text-muted-foreground text-[10px] block">Customer Pays</span>
                  <span className="font-bold text-foreground">GH₵ 100.00</span>
                </div>
                <div className="p-2 bg-white dark:bg-card rounded border">
                  <span className="text-muted-foreground text-[10px] block">Platform Fee (10%)</span>
                  <span className="font-bold text-amber-600">- GH₵ 10.00</span>
                </div>
                <div className="p-2 bg-white dark:bg-card rounded border">
                  <span className="text-muted-foreground text-[10px] block">Your Net Earnings (90%)</span>
                  <span className="font-bold text-emerald-600">GH₵ 90.00</span>
                </div>
                <div className="p-2 bg-white dark:bg-card rounded border">
                  <span className="text-muted-foreground text-[10px] block">Payout Time</span>
                  <span className="font-bold text-blue-600">Within 24 Hours</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: REGISTRATION GUIDE */}
          <TabsContent value="register" className="space-y-4">
            <div className="border rounded-xl p-4 space-y-3 bg-card">
              <h4 className="font-semibold text-sm text-foreground">
                5-Step Simple Registration Process
              </h4>
              <p className="text-xs text-muted-foreground">
                Follow these 5 easy steps to register your business and get your store verified:
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-foreground">Personal Information</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Provide your legal name, date of birth, contact email, phone number, and residential address.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-foreground">Business Details</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Enter your store's registered business name and physical shop or warehouse address.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-foreground">Ghana Card Identity Verification</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Enter your Ghana Card number and upload clear photos of your Ghana Card ID (front, back) and a selfie.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div>
                    <strong className="text-foreground">Payout Account Setup</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Provide your Mobile Money number (MTN, Telecel, AirtelTigo) or Bank account details where you want your payouts sent.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-xs">
                    5
                  </div>
                  <div>
                    <strong className="text-foreground">Store Setup & Submission</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Add your store name, description, and bio, then submit. Admin verification usually takes under 24 hours!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: SELLER POLICY (15 ARTICLES) */}
          <TabsContent value="terms" className="space-y-4">
            {/* Quick Highlights Summary (Preserved) */}
            <div className="border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                  Quick Operational Highlights
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-muted-foreground">
                <div className="p-2.5 bg-white dark:bg-card border rounded-lg">
                  <strong className="text-foreground block mb-0.5">1. Product Authenticity & Quality</strong>
                  All products must be 100% genuine and accurately described. Counterfeits and illegal items are strictly prohibited.
                </div>
                <div className="p-2.5 bg-white dark:bg-card border rounded-lg">
                  <strong className="text-foreground block mb-0.5">2. Order Dispatch & Fulfillment</strong>
                  Deliver sold items to an official Trades Point Fulfillment Hub or prepare for pickup within 24 to 48 hours.
                </div>
                <div className="p-2.5 bg-white dark:bg-card border rounded-lg">
                  <strong className="text-foreground block mb-0.5">3. Accurate Pricing & Stock</strong>
                  Maintain accurate product prices (GH₵) and real-time inventory counts to avoid stockouts.
                </div>
                <div className="p-2.5 bg-white dark:bg-card border rounded-lg">
                  <strong className="text-foreground block mb-0.5">4. Customer Returns & Guarantee</strong>
                  If an item arrives damaged, defective, or incorrect, Trades Point will review evidence to protect buyer satisfaction.
                </div>
              </div>
            </div>

            {/* Official TradesPoint.store Seller Policy Document Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-white">
                  <Gavel className="w-5 h-5 text-emerald-400" />
                  TradesPoint.store Official Seller Policy
                </h3>
                <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-300">
                  Binding Terms
                </Badge>
              </div>
              <p className="text-xs text-slate-300">
                Welcome to TradesPoint.store. By registering as a seller, you agree to follow the rules and responsibilities outlined in this Seller Policy.
              </p>
            </div>

            {/* Complete 15-Section Policy Body */}
            <div className="space-y-3 text-xs">
              {/* 1. Seller Registration */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Seller Registration</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Seller account registration and application are free.</li>
                  <li>All information provided during registration must be accurate and complete.</li>
                  <li>TradesPoint.store reserves the right to review and approve seller applications.</li>
                  <li>Sellers must keep their account and business information up to date.</li>
                </ul>
              </div>

              {/* 2. Product Listings */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <PackageCheck className="w-4 h-4" />
                  <span>2. Product Listings</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Sellers must provide accurate product names, descriptions, prices, images, variations, and available quantities.</li>
                  <li>Products must be genuine and legally permitted for sale.</li>
                  <li>Sellers must not upload misleading, fraudulent, counterfeit, stolen, or prohibited products.</li>
                  <li>Product images and descriptions should accurately represent the actual product customers will receive.</li>
                  <li>Sellers are responsible for ensuring that their listed products are available and in sellable condition.</li>
                </ul>
              </div>

              {/* 3. Fair Pricing Policy */}
              <div className="p-3.5 border border-emerald-300/60 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>3. Fair Pricing Policy</span>
                </div>
                <p className="text-muted-foreground">
                  Sellers must set <strong>fair and reasonable prices</strong> for products listed on TradesPoint.store. Sellers must not intentionally overprice products simply because they are being sold through the marketplace.
                </p>
                <div className="bg-white dark:bg-card p-3 rounded-lg border space-y-1.5">
                  <strong className="text-foreground block">Why Fair Pricing Matters</strong>
                  <p className="text-muted-foreground">
                    TradesPoint.store is built to give customers access to products at competitive and reasonable prices. Excessive pricing can:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
                    <li>Discourage customers from purchasing.</li>
                    <li>Make sellers' products less competitive compared with similar products.</li>
                    <li>Reduce customer trust in the TradesPoint marketplace.</li>
                    <li>Damage the reputation of both the seller and TradesPoint.store.</li>
                    <li>Make customers feel that they are being taken advantage of.</li>
                  </ul>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Sellers are encouraged to research the normal market price of their products and set prices that are reasonable while still allowing them to make a fair profit.</li>
                  <li>TradesPoint.store may review product prices where there is a reasonable concern that a product has been significantly and unfairly overpriced compared with similar products available on the marketplace or in the relevant market.</li>
                  <li>The purpose of this policy is not to prevent sellers from making a profit, but to maintain a fair marketplace where sellers can earn money while customers receive reasonable value.</li>
                </ul>
              </div>

              {/* 4. Pricing */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>4. Pricing</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Sellers are responsible for setting and maintaining their product prices.</li>
                  <li>Sellers must ensure that prices displayed on TradesPoint.store are accurate.</li>
                  <li>Sellers must not intentionally manipulate prices to deceive customers.</li>
                  <li>Sellers should consider their product cost, operating expenses, market conditions, and a reasonable profit when setting prices.</li>
                </ul>
              </div>

              {/* 5. TradesPoint Commission */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Percent className="w-4 h-4" />
                  <span>5. TradesPoint Commission</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>TradesPoint.store retains <strong>10% of the selling price</strong> of each item sold.</li>
                  <li>Sellers receive the <strong>remaining 90%</strong> of the item selling price, subject to applicable adjustments, refunds, or other agreed deductions.</li>
                  <li>Delivery charges are handled separately according to TradesPoint.store's delivery arrangements.</li>
                </ul>
              </div>

              {/* 6. Orders */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>6. Orders</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Sellers are expected to process and fulfill confirmed orders promptly.</li>
                  <li>Sellers must not cancel orders without a valid reason.</li>
                  <li>If a seller cannot fulfill an order because an item is unavailable, the seller must notify TradesPoint.store as soon as possible.</li>
                  <li>Repeated cancellations, delays, or failure to fulfill orders may result in account restrictions or suspension.</li>
                </ul>
              </div>

              {/* 7. Delivery */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Truck className="w-4 h-4" />
                  <span>7. Delivery</span>
                </div>
                <p className="text-muted-foreground">TradesPoint.store manages customer delivery through its delivery system.</p>
                <div className="bg-muted/50 p-2.5 rounded-lg">
                  <span className="font-semibold text-foreground block mb-1">Sellers may either:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
                    <li>Bring the sold item to a designated TradesPoint location for delivery, or</li>
                    <li>Request TradesPoint pickup where available.</li>
                  </ul>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Sellers are responsible for making the product available for pickup or handover within the required timeframe.</li>
                  <li>The customer is responsible for the applicable delivery fee shown at checkout.</li>
                </ul>
              </div>

              {/* 8. Product Quality */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>8. Product Quality</span>
                </div>
                <span className="font-semibold text-foreground block">Sellers must ensure that products are:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>As described in the listing.</li>
                  <li>Free from undisclosed defects.</li>
                  <li>Properly packaged where necessary.</li>
                  <li>Safe and suitable for delivery.</li>
                </ul>
                <p className="text-muted-foreground pt-1">
                  TradesPoint.store may investigate customer complaints regarding product quality or inaccurate listings.
                </p>
              </div>

              {/* 9. Returns, Refunds and Disputes */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <RefreshCw className="w-4 h-4" />
                  <span>9. Returns, Refunds and Disputes</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Sellers must cooperate with TradesPoint.store when a customer reports a damaged, incorrect, defective, or significantly misrepresented product.</li>
                  <li>Refunds or returns may be required where the seller is responsible for the issue.</li>
                  <li>TradesPoint.store may review evidence from both the seller and customer before making a decision.</li>
                  <li>Sellers must not attempt to resolve marketplace orders by misleading or pressuring customers.</li>
                </ul>
              </div>

              {/* 10. Prohibited Activities */}
              <div className="p-3.5 border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                  <Ban className="w-4 h-4" />
                  <span>10. Prohibited Activities</span>
                </div>
                <p className="text-muted-foreground">Sellers must not use TradesPoint.store to:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Sell illegal or prohibited goods.</li>
                  <li>Sell counterfeit or stolen products.</li>
                  <li>Provide false product information.</li>
                  <li>Manipulate orders, reviews, ratings, or sales.</li>
                  <li>Create multiple accounts to abuse promotions or marketplace systems.</li>
                  <li>Attempt to bypass TradesPoint's commission system.</li>
                  <li>Use customer information for unauthorized marketing or other purposes.</li>
                  <li>Engage in fraudulent activity.</li>
                </ul>
              </div>

              {/* 11. Customer Communication */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>11. Customer Communication</span>
                </div>
                <p className="text-muted-foreground">Sellers must communicate with customers professionally and respectfully.</p>
                <span className="font-semibold text-foreground block">Sellers must not:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Harass or threaten customers.</li>
                  <li>Request unnecessary personal information.</li>
                  <li>Encourage customers to complete transactions outside TradesPoint.store in order to avoid marketplace fees.</li>
                  <li>Mislead customers about orders, prices, delivery, returns, or refunds.</li>
                </ul>
              </div>

              {/* 12. Seller Responsibility */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Scale className="w-4 h-4" />
                  <span>12. Seller Responsibility</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Sellers are responsible for complying with all applicable laws and regulations relating to the products and services they offer.</li>
                  <li>TradesPoint.store acts as a marketplace platform and may take action against sellers who violate this policy.</li>
                </ul>
              </div>

              {/* 13. Account Suspension or Removal */}
              <div className="p-3.5 border border-destructive/30 bg-destructive/5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>13. Account Suspension or Removal</span>
                </div>
                <p className="text-muted-foreground">
                  TradesPoint.store may temporarily suspend, restrict, or permanently remove a seller account if the seller:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Violates this Seller Policy.</li>
                  <li>Repeatedly receives serious customer complaints.</li>
                  <li>Provides false information.</li>
                  <li>Fails to fulfill orders.</li>
                  <li>Attempts fraud or marketplace manipulation.</li>
                  <li>Lists prohibited or illegal products.</li>
                  <li>Attempts to bypass TradesPoint's payment or commission system.</li>
                  <li>Repeatedly engages in unfair or unreasonable pricing practices.</li>
                </ul>
                <p className="text-muted-foreground pt-1 italic">
                  Depending on the situation, TradesPoint.store may also cancel affected orders or withhold payments while an investigation is conducted.
                </p>
              </div>

              {/* 14. Policy Updates */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Info className="w-4 h-4" />
                  <span>14. Policy Updates</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>TradesPoint.store may update this Seller Policy when necessary to improve marketplace safety, operations, or compliance.</li>
                  <li>Sellers will be responsible for reviewing updated policies and continuing to comply with them.</li>
                </ul>
              </div>

              {/* 15. Acceptance */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>15. Acceptance</span>
                </div>
                <p className="text-xs text-foreground font-medium max-w-lg mx-auto">
                  By becoming a seller on TradesPoint.store, you confirm that you have read, understood, and agreed to this Seller Policy.
                </p>
                <div className="pt-2 text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  TradesPoint.store — <span className="text-primary lowercase font-normal italic">Shop more. Save more. Live better.</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: PRIVACY & SECURITY */}
          <TabsContent value="privacy" className="space-y-4">
            <div className="border rounded-xl p-4 space-y-3 bg-card text-xs">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> Seller Privacy & Data Protection Policy
              </h4>

              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-start gap-2.5 p-3 bg-purple-50/50 border border-purple-200 rounded-lg text-purple-900 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300">
                  <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Encrypted Identity Storage</strong>
                    <p className="mt-0.5">
                      Your Ghana Card ID documents and verification selfies are encrypted and securely stored. They are accessed strictly by authorized verification administrators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-gray-50 border rounded-lg text-gray-800 dark:bg-muted/40 dark:border-border dark:text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Financial Credentials Protection</strong>
                    <p className="mt-0.5">
                      Your Mobile Money numbers and Bank account details are exclusively used by Paystack to disburse your payouts securely.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-gray-50 border rounded-lg text-gray-800 dark:bg-muted/40 dark:border-border dark:text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>No Third-Party Sharing</strong>
                    <p className="mt-0.5">
                      Trades Point never sells, rents, or shares your business contact details with third-party marketers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 mt-2 flex justify-end">
          <Button onClick={() => setIsOpen(false)} className="px-6 text-xs sm:text-sm">
            I Understand & Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
