import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Bike,
  PackageCheck,
  KeyRound,
  UserCheck,
  HeartHandshake,
  DollarSign,
  Package,
  HardHat,
  Lock,
  Store,
  Ban,
  PhoneCall,
  Star,
  UserX,
  RefreshCw,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RiderPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  showAgreeButton?: boolean;
  onAgree?: () => void;
}

export const RIDER_POLICY_ARTICLES = [
  {
    number: 1,
    title: "Rider Registration",
    icon: UserCheck,
    points: [
      "Rider registration information must be accurate and complete.",
      "Riders may be required to provide identification and other information requested by TradesPoint.store.",
      "TradesPoint.store may review and approve rider applications before a rider can accept deliveries.",
      "Riders must keep their account information and contact details up to date.",
      "A rider must not allow another person to use their rider account.",
    ],
  },
  {
    number: 2,
    title: "Rider Responsibilities",
    icon: ShieldCheck,
    intro: "Riders are responsible for handling every assigned order carefully and professionally.",
    points: [
      "Accept only orders they are able to complete.",
      "Pick up the correct item from the seller.",
      "Keep customer orders safe and secure during transportation.",
      "Deliver orders to the correct customer and location.",
      "Follow the delivery instructions provided through the platform.",
      "Update the delivery status accurately.",
      "Obtain the required delivery confirmation or OTP before completing an order.",
      "Report delivery problems to TradesPoint.store as soon as possible.",
    ],
  },
  {
    number: 3,
    title: "Accepting Delivery Orders",
    icon: Bike,
    points: [
      "TradesPoint.store may notify available riders when a delivery order becomes available.",
      "Where multiple riders are notified, a rider may accept the order according to the platform's delivery system.",
      "Once a rider accepts an order, the rider is expected to make a reasonable effort to complete the delivery.",
      "Riders must not repeatedly accept orders and then abandon, delay, or cancel them without a valid reason.",
      "Repeated failure to complete accepted orders may result in temporary restrictions or suspension.",
    ],
  },
  {
    number: 4,
    title: "Picking Up Orders",
    icon: PackageCheck,
    intro: "When collecting an order from a seller, riders should:",
    points: [
      "Confirm that they are collecting the correct order.",
      "Check the order information provided by TradesPoint.store.",
      "Handle the product carefully.",
      "Report visible damage, missing items, or discrepancies before leaving the pickup location where reasonably possible.",
      "A rider must not open, use, replace, or alter a customer's package unless required for a legitimate delivery or safety reason.",
    ],
  },
  {
    number: 5,
    title: "Delivery Confirmation and OTP",
    icon: KeyRound,
    highlight: true,
    intro:
      "TradesPoint.store may use a delivery OTP or another verification method to confirm that an order has been delivered to the correct customer. Where an OTP is required:",
    points: [
      "The rider must request the OTP from the customer at the time of delivery.",
      "The rider must enter the correct OTP into the delivery system.",
      "The rider must not guess, create, reuse, or manipulate an OTP.",
      "A rider must not mark an order as delivered when it has not actually been delivered.",
      "Riders must not ask customers to provide OTPs before the order is delivered unless the platform specifically instructs them to do so.",
      "The delivery confirmation must accurately reflect what happened.",
    ],
  },
  {
    number: 6,
    title: "Failed Deliveries",
    icon: AlertTriangle,
    intro:
      "If a rider cannot complete a delivery, the rider must report the reason through the appropriate TradesPoint system. Examples include:",
    points: [
      "Customer cannot be reached.",
      "Incorrect or incomplete address.",
      "Customer refuses the order.",
      "Unsafe delivery location.",
      "Vehicle or transportation problem.",
      "Product issue discovered during delivery.",
      "Other circumstances preventing successful delivery.",
    ],
    footer:
      "Riders must not falsely mark an order as delivered simply because they were unable to complete the delivery.",
  },
  {
    number: 7,
    title: "Customer Conduct",
    icon: HeartHandshake,
    intro: "Riders must treat customers respectfully and professionally. Riders must not:",
    points: [
      "Threaten, insult, harass, or intimidate customers.",
      "Demand unauthorized additional payments.",
      "Discriminate against customers.",
      "Pressure customers to provide positive reviews.",
      "Make inappropriate personal requests.",
      "Use customer information for personal purposes.",
    ],
    footer: "Any serious dispute with a customer should be reported to TradesPoint.store.",
  },
  {
    number: 8,
    title: "Delivery Fees and Payments",
    icon: DollarSign,
    points: [
      "Riders must not charge customers an additional delivery fee outside the amount authorized by TradesPoint.store.",
      "If a customer has already paid the delivery fee through TradesPoint.store, the rider must not demand another delivery payment unless the platform specifically authorizes it.",
      "Riders must not manipulate delivery charges or payment information.",
      "Any cash or payment collected on behalf of TradesPoint.store must be handled according to the instructions provided by TradesPoint.",
    ],
  },
  {
    number: 9,
    title: "Product Safety and Care",
    icon: Package,
    intro:
      "Riders must make reasonable efforts to protect customer products while transporting them. Riders must not:",
    points: [
      "Intentionally damage products.",
      "Tamper with packages.",
      "Exchange one customer's order with another.",
      "Leave products in an unsafe or unauthorized location without appropriate instructions.",
      "Transport an order in a manner that unnecessarily risks damage.",
    ],
    footer:
      "If an order is damaged while in the rider's possession, the rider must report the incident promptly.",
  },
  {
    number: 10,
    title: "Rider Safety",
    icon: HardHat,
    intro: "Riders are responsible for following applicable road and transportation laws. Riders should:",
    points: [
      "Ride or drive responsibly.",
      "Follow traffic laws.",
      "Use appropriate safety equipment.",
      "Avoid dangerous driving.",
      "Avoid using a phone in a way that creates a safety risk while riding or driving.",
      "Never operate a vehicle while impaired by alcohol or drugs.",
    ],
    footer:
      "TradesPoint.store expects riders to prioritize their own safety, customer safety, and public safety.",
  },
  {
    number: 11,
    title: "Customer Privacy",
    icon: Lock,
    intro:
      "Riders may receive customer information such as: Name, Phone number, Delivery address, and Order information. This information is provided only for the purpose of completing the delivery. Riders must not:",
    points: [
      "Save customer information for personal use.",
      "Share customer information with unauthorized people.",
      "Contact customers for unrelated personal reasons.",
      "Use customer addresses or phone numbers for marketing or solicitation.",
      "Sell or distribute customer information.",
    ],
  },
  {
    number: 12,
    title: "Seller Privacy",
    icon: Store,
    points: [
      "Riders may also receive information about sellers and pickup locations.",
      "Such information must be used only for completing assigned deliveries and must not be misused or shared without authorization.",
    ],
  },
  {
    number: 13,
    title: "Prohibited Rider Activities",
    icon: Ban,
    isDanger: true,
    intro: "Riders must not engage in any of the following strictly prohibited actions:",
    points: [
      "Steal or intentionally withhold customer orders.",
      "Mark undelivered orders as delivered.",
      "Manipulate delivery OTPs.",
      "Create fake delivery records.",
      "Accept orders with no intention of completing them.",
      "Create multiple rider accounts to manipulate the delivery system.",
      "Share their rider account with another person.",
      "Manipulate their location or GPS information to gain unauthorized delivery opportunities.",
      "Collude with customers or sellers to commit fraud.",
      "Request unauthorized fees.",
      "Tamper with the TradesPoint delivery system.",
      "Attempt to access information or accounts they are not authorized to access.",
    ],
  },
  {
    number: 14,
    title: "Lost, Damaged, or Missing Orders",
    icon: PackageCheck,
    points: [
      "If an order is lost, damaged, or missing while under a rider's responsibility, the rider must immediately notify TradesPoint.store and provide accurate information about what happened.",
      "TradesPoint.store may investigate the incident and may request relevant evidence or information from the rider.",
      "Where there is evidence of intentional misconduct, fraud, theft, or serious negligence, TradesPoint.store may take appropriate action.",
    ],
  },
  {
    number: 15,
    title: "Communication With TradesPoint",
    icon: PhoneCall,
    points: [
      "Riders must remain reasonably reachable while completing an active delivery.",
      "If a rider experiences a problem with an order, they should contact TradesPoint.store through the available support system instead of abandoning the order.",
      "Riders should provide truthful and accurate information when reporting delivery issues.",
    ],
  },
  {
    number: 16,
    title: "Ratings and Performance",
    icon: Star,
    intro: "TradesPoint.store may monitor rider performance using information such as:",
    points: [
      "Successful deliveries.",
      "Delivery completion rates.",
      "Order cancellations.",
      "Customer complaints.",
      "Delivery times.",
      "Failed deliveries.",
      "Customer ratings.",
      "Policy violations.",
    ],
    footer:
      "Riders who consistently provide reliable and professional service may maintain good standing on the platform. Poor performance or repeated violations may result in restrictions or suspension.",
  },
  {
    number: 17,
    title: "Account Suspension or Removal",
    icon: UserX,
    isDanger: true,
    intro:
      "TradesPoint.store may temporarily suspend, restrict, or permanently remove a rider account where necessary. Reasons may include:",
    points: [
      "Fraud.",
      "Theft.",
      "Repeated failed deliveries.",
      "Falsifying delivery information.",
      "OTP manipulation.",
      "Customer harassment.",
      "Unauthorized charges.",
      "Account sharing.",
      "Serious safety violations.",
      "Misuse of customer information.",
      "Damage or loss caused by intentional misconduct.",
      "Attempts to manipulate the TradesPoint delivery system.",
      "Repeated violations of this Rider Policy.",
    ],
    footer:
      "Where appropriate, TradesPoint.store may investigate an incident before making a final decision.",
  },
  {
    number: 18,
    title: "Professional Conduct",
    icon: Award,
    intro:
      "Riders represent the TradesPoint delivery service while completing orders. Riders are therefore expected to:",
    points: [
      "Be respectful.",
      "Communicate professionally.",
      "Handle orders responsibly.",
      "Follow delivery instructions.",
      "Maintain appropriate personal conduct.",
      "Protect the reputation and trust of the TradesPoint marketplace.",
    ],
  },
  {
    number: 19,
    title: "Policy Updates",
    icon: RefreshCw,
    points: [
      "TradesPoint.store may update this Rider Policy when necessary to improve delivery operations, security, customer protection, rider safety, or compliance.",
      "Riders are responsible for reviewing updated policies and complying with them.",
    ],
  },
  {
    number: 20,
    title: "Acceptance",
    icon: FileCheck,
    highlight: true,
    points: [
      "By registering as a TradesPoint rider or accepting delivery orders through the platform, you confirm that you have read, understood, and agreed to follow this Rider Policy.",
    ],
    footer: "TradesPoint.store — Shop more. Save more. Live better.",
  },
];

export const RiderPolicyModal = ({
  isOpen,
  onClose,
  showAgreeButton = false,
  onAgree,
}: RiderPolicyModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = RIDER_POLICY_ARTICLES.filter((article) => {
    const q = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(q) ||
      article.number.toString().includes(q) ||
      (article.intro && article.intro.toLowerCase().includes(q)) ||
      (article.footer && article.footer.toLowerCase().includes(q)) ||
      article.points.some((p) => p.toLowerCase().includes(q))
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-[#0b0f19] border border-white/10 text-white flex flex-col p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-white/10 bg-[#101726]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4ade80]/15 flex items-center justify-center border border-[#4ade80]/30 text-[#4ade80]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                TradesPoint.store Rider Policy
              </DialogTitle>
              <p className="text-xs text-white/50 mt-0.5">
                Official Rules, Responsibilities & Delivery Standards (20 Articles)
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search policy articles (e.g. OTP, failed deliveries, safety)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-[#080c14] border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#4ade80]/60 focus:ring-1 focus:ring-[#4ade80]/30"
            />
          </div>
        </DialogHeader>

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0b0f19]">
          {/* Top Intro Notice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#121c2e] to-[#0f172a] border border-[#4ade80]/20 text-xs text-white/80 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 text-[#4ade80] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" /> Welcome to TradesPoint.store
            </div>
            <p>
              This Rider Policy establishes the rules, responsibilities, and standards that all delivery riders
              using the TradesPoint delivery platform are expected to follow.
            </p>
            <p className="text-white/60 font-medium">
              By registering or accepting delivery orders through TradesPoint.store, you agree to comply with this policy.
            </p>
          </div>

          {/* Articles list */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-xs">
              No policy sections found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredArticles.map((article) => {
              const IconComp = article.icon;
              return (
                <div
                  key={article.number}
                  className={`p-5 rounded-xl border transition-all ${
                    article.isDanger
                      ? "bg-red-950/15 border-red-500/30"
                      : article.highlight
                      ? "bg-[#101e33] border-[#4ade80]/40"
                      : "bg-[#111827]/80 border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        article.isDanger
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : article.highlight
                          ? "bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40"
                          : "bg-white/10 text-white/80 border border-white/10"
                      }`}
                    >
                      {article.number}
                    </span>
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-bold flex items-center gap-2 ${
                          article.isDanger
                            ? "text-red-300"
                            : article.highlight
                            ? "text-[#4ade80]"
                            : "text-white"
                        }`}
                      >
                        <IconComp className="w-4 h-4 inline-block opacity-80" />
                        {article.number}. {article.title}
                      </h3>
                    </div>
                  </div>

                  {article.intro && (
                    <p className="text-xs text-white/70 mb-2.5 font-medium leading-relaxed">
                      {article.intro}
                    </p>
                  )}

                  <ul className="space-y-2 text-xs text-white/80">
                    {article.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                            article.isDanger
                              ? "bg-red-400"
                              : article.highlight
                              ? "bg-[#4ade80]"
                              : "bg-white/40"
                          }`}
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {article.footer && (
                    <p
                      className={`text-xs mt-3 pt-2.5 border-t border-white/5 font-semibold ${
                        article.isDanger
                          ? "text-red-400/90"
                          : article.highlight
                          ? "text-[#4ade80]"
                          : "text-white/60"
                      }`}
                    >
                      {article.footer}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#101726] flex items-center justify-between gap-4">
          <div className="text-[11px] text-white/40 hidden sm:block">
            Strict compliance is enforced on all active delivery riders.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white text-xs h-9"
            >
              Close
            </Button>
            {showAgreeButton && (
              <Button
                onClick={() => {
                  if (onAgree) onAgree();
                  onClose();
                }}
                className="bg-gradient-to-r from-[#4ade80] to-[#16a34a] text-gray-950 font-bold hover:brightness-110 text-xs h-9 px-5"
              >
                I Agree & Accept Policy
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
