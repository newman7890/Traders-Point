import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_theme.dart';

class RiderPolicyScreen extends StatefulWidget {
  final bool showAgreeButton;
  final VoidCallback? onAgree;

  const RiderPolicyScreen({
    super.key,
    this.showAgreeButton = false,
    this.onAgree,
  });

  @override
  State<RiderPolicyScreen> createState() => _RiderPolicyScreenState();
}

class _RiderPolicyScreenState extends State<RiderPolicyScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  static const List<Map<String, dynamic>> _policyArticles = [
    {
      'number': 1,
      'title': 'Rider Registration',
      'icon': LucideIcons.userCheck,
      'points': [
        'Rider registration information must be accurate and complete.',
        'Riders may be required to provide identification and other information requested by TradesPoint.store.',
        'TradesPoint.store may review and approve rider applications before a rider can accept deliveries.',
        'Riders must keep their account information and contact details up to date.',
        'A rider must not allow another person to use their rider account.',
      ],
    },
    {
      'number': 2,
      'title': 'Rider Responsibilities',
      'icon': LucideIcons.shieldCheck,
      'intro': 'Riders are responsible for handling every assigned order carefully and professionally.',
      'points': [
        'Accept only orders they are able to complete.',
        'Pick up the correct item from the seller.',
        'Keep customer orders safe and secure during transportation.',
        'Deliver orders to the correct customer and location.',
        'Follow the delivery instructions provided through the platform.',
        'Update the delivery status accurately.',
        'Obtain the required delivery confirmation or OTP before completing an order.',
        'Report delivery problems to TradesPoint.store as soon as possible.',
      ],
    },
    {
      'number': 3,
      'title': 'Accepting Delivery Orders',
      'icon': LucideIcons.bike,
      'points': [
        'TradesPoint.store may notify available riders when a delivery order becomes available.',
        'Where multiple riders are notified, a rider may accept the order according to the platform\'s delivery system.',
        'Once a rider accepts an order, the rider is expected to make a reasonable effort to complete the delivery.',
        'Riders must not repeatedly accept orders and then abandon, delay, or cancel them without a valid reason.',
        'Repeated failure to complete accepted orders may result in temporary restrictions or suspension.',
      ],
    },
    {
      'number': 4,
      'title': 'Picking Up Orders',
      'icon': LucideIcons.packageCheck,
      'intro': 'When collecting an order from a seller, riders should:',
      'points': [
        'Confirm that they are collecting the correct order.',
        'Check the order information provided by TradesPoint.store.',
        'Handle the product carefully.',
        'Report visible damage, missing items, or discrepancies before leaving the pickup location where reasonably possible.',
        'A rider must not open, use, replace, or alter a customer\'s package unless required for a legitimate delivery or safety reason.',
      ],
    },
    {
      'number': 5,
      'title': 'Delivery Confirmation and OTP',
      'icon': LucideIcons.keyRound,
      'intro': 'TradesPoint.store uses a delivery OTP to verify that an order has been delivered to the correct customer. Where an OTP is required:',
      'points': [
        'The rider must request the OTP from the customer at the time of physical delivery.',
        'The rider must enter the correct OTP into the delivery app.',
        'The rider must not guess, create, reuse, or manipulate an OTP.',
        'A rider must not mark an order as delivered when it has not actually been delivered.',
        'Riders must not ask customers to provide OTPs before the order is delivered.',
        'The delivery confirmation must accurately reflect what happened.',
      ],
    },
    {
      'number': 6,
      'title': 'Failed Deliveries',
      'icon': LucideIcons.alertTriangle,
      'intro': 'If a rider cannot complete a delivery, the rider must report the reason through the app. Examples include:',
      'points': [
        'Customer cannot be reached.',
        'Incorrect or incomplete address.',
        'Customer refuses the order.',
        'Unsafe delivery location.',
        'Vehicle or transportation problem.',
        'Product issue discovered during delivery.',
        'Other circumstances preventing successful delivery.',
        'Riders must not falsely mark an order as delivered simply because they were unable to complete the delivery.',
      ],
    },
    {
      'number': 7,
      'title': 'Customer Conduct',
      'icon': LucideIcons.messageSquare,
      'intro': 'Riders must treat customers respectfully and professionally. Riders must not:',
      'points': [
        'Threaten, insult, harass, or intimidate customers.',
        'Demand unauthorized additional payments.',
        'Discriminate against customers.',
        'Pressure customers to provide positive reviews.',
        'Make inappropriate personal requests.',
        'Use customer information for personal purposes.',
        'Any serious dispute with a customer should be reported to TradesPoint.store immediately.',
      ],
    },
    {
      'number': 8,
      'title': 'Delivery Fees and Payments',
      'icon': LucideIcons.dollarSign,
      'points': [
        'Riders must not charge customers an additional delivery fee outside the amount authorized by TradesPoint.store.',
        'If a customer has already paid the delivery fee through TradesPoint.store, the rider must not demand another delivery payment unless the platform specifically authorizes it.',
        'Riders must not manipulate delivery charges or payment information.',
        'Any cash or payment collected on behalf of TradesPoint.store must be handled strictly according to instructions provided by TradesPoint.',
      ],
    },
    {
      'number': 9,
      'title': 'Product Safety and Care',
      'icon': LucideIcons.shieldAlert,
      'intro': 'Riders must make reasonable efforts to protect customer products while transporting them. Riders must not:',
      'points': [
        'Intentionally damage products.',
        'Tamper with packages.',
        'Exchange one customer\'s order with another.',
        'Leave products in an unsafe or unauthorized location without appropriate instructions.',
        'Transport an order in a manner that unnecessarily risks damage.',
        'If an order is damaged while in the rider\'s possession, the rider must report the incident promptly.',
      ],
    },
    {
      'number': 10,
      'title': 'Rider Safety',
      'icon': LucideIcons.heartPulse,
      'intro': 'Riders are responsible for following applicable road and transportation laws. Riders should:',
      'points': [
        'Ride or drive responsibly.',
        'Follow traffic laws and speed regulations.',
        'Use appropriate safety equipment (e.g. helmets, reflective gear).',
        'Avoid dangerous or reckless driving.',
        'Avoid using a phone in a way that creates a safety risk while riding or driving.',
        'Never operate a vehicle while impaired by alcohol or drugs.',
        'TradesPoint.store expects riders to prioritize their own safety, customer safety, and public safety.',
      ],
    },
    {
      'number': 11,
      'title': 'Customer Privacy',
      'icon': LucideIcons.lock,
      'intro': 'Riders receive customer information (Name, Phone number, Delivery address, Order info) strictly for completing the delivery. Riders must not:',
      'points': [
        'Save customer information for personal use.',
        'Share customer information with unauthorized people.',
        'Contact customers for unrelated personal reasons.',
        'Use customer addresses or phone numbers for marketing or solicitation.',
        'Sell or distribute customer information.',
      ],
    },
    {
      'number': 12,
      'title': 'Seller Privacy',
      'icon': LucideIcons.building,
      'points': [
        'Riders may also receive information about sellers and pickup locations.',
        'Such information must be used only for completing assigned deliveries and must not be misused or shared without authorization.',
      ],
    },
    {
      'number': 13,
      'title': 'Prohibited Rider Activities',
      'icon': LucideIcons.ban,
      'isDanger': true,
      'intro': 'Riders must strictly NOT:',
      'points': [
        'Steal or intentionally withhold customer orders.',
        'Mark undelivered orders as delivered.',
        'Manipulate delivery OTPs.',
        'Create fake delivery records.',
        'Accept orders with no intention of completing them.',
        'Create multiple rider accounts to manipulate the delivery system.',
        'Share their rider account with another person.',
        'Manipulate their location or GPS information to gain unauthorized delivery opportunities.',
        'Collude with customers or sellers to commit fraud.',
        'Request unauthorized fees.',
        'Tamper with the TradesPoint delivery system.',
        'Attempt to access information or accounts they are not authorized to access.',
      ],
    },
    {
      'number': 14,
      'title': 'Lost, Damaged, or Missing Orders',
      'icon': LucideIcons.packageX,
      'points': [
        'If an order is lost, damaged, or missing while under a rider\'s responsibility, the rider must immediately notify TradesPoint.store and provide accurate information about what happened.',
        'TradesPoint.store may investigate the incident and request relevant evidence or information from the rider.',
        'Where there is evidence of intentional misconduct, fraud, theft, or serious negligence, TradesPoint.store may take appropriate legal and platform disciplinary action.',
      ],
    },
    {
      'number': 15,
      'title': 'Communication With TradesPoint',
      'icon': LucideIcons.headset,
      'points': [
        'Riders must remain reasonably reachable while completing an active delivery.',
        'If a rider experiences a problem with an order, they should contact TradesPoint.store through the available support system instead of abandoning the order.',
        'Riders should provide truthful and accurate information when reporting delivery issues.',
      ],
    },
    {
      'number': 16,
      'title': 'Ratings and Performance',
      'icon': LucideIcons.star,
      'intro': 'TradesPoint.store monitors rider performance using metrics such as:',
      'points': [
        'Successful deliveries & completion rates.',
        'Order cancellations and delays.',
        'Customer complaints & satisfaction ratings.',
        'Delivery times and failed deliveries.',
        'Policy adherence and professionalism.',
        'Riders who consistently provide reliable service maintain top standing. Poor performance or repeated violations may result in restrictions or suspension.',
      ],
    },
    {
      'number': 17,
      'title': 'Account Suspension or Removal',
      'icon': LucideIcons.gavel,
      'isDanger': true,
      'intro': 'TradesPoint.store may temporarily suspend, restrict, or permanently remove a rider account for grounds including:',
      'points': [
        'Fraud, theft, or package withholding.',
        'Repeated failed deliveries or falsifying delivery information.',
        'OTP manipulation or marking orders delivered without actual handover.',
        'Customer harassment or unauthorized charges.',
        'Account sharing or location/GPS spoofing.',
        'Serious safety violations or operating under influence.',
        'Misuse of customer personal information.',
        'Damage or loss caused by intentional misconduct.',
        'Attempts to manipulate the TradesPoint delivery system.',
        'Repeated violations of this Rider Policy.',
      ],
    },
    {
      'number': 18,
      'title': 'Professional Conduct',
      'icon': LucideIcons.award,
      'intro': 'Riders represent TradesPoint while on delivery and are expected to:',
      'points': [
        'Be respectful and courteous to customers, sellers, and hub staff.',
        'Communicate professionally at all times.',
        'Handle packages responsibly with care.',
        'Follow delivery instructions provided.',
        'Maintain appropriate personal conduct and hygiene.',
        'Protect the reputation and trust of the TradesPoint marketplace.',
      ],
    },
    {
      'number': 19,
      'title': 'Policy Updates',
      'icon': LucideIcons.info,
      'points': [
        'TradesPoint.store may update this Rider Policy when necessary to improve delivery operations, security, customer protection, rider safety, or compliance.',
        'Riders are responsible for reviewing updated policies and continuing to comply with them.',
      ],
    },
    {
      'number': 20,
      'title': 'Acceptance & Agreement',
      'icon': LucideIcons.checkCircle2,
      'points': [
        'By registering as a TradesPoint rider or accepting delivery orders through the platform, you confirm that you have read, understood, and agreed to follow this Rider Policy.',
        'TradesPoint.store — Shop more. Save more. Live better.',
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _searchQuery.isEmpty
        ? _policyArticles
        : _policyArticles.where((article) {
            final title = (article['title'] as String).toLowerCase();
            final points = (article['points'] as List<String>).join(' ').toLowerCase();
            final q = _searchQuery.toLowerCase();
            return title.contains(q) || points.contains(q);
          }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Row(
          children: [
            Icon(LucideIcons.shieldCheck, color: AppTheme.primary, size: 20),
            SizedBox(width: 8),
            Text(
              'Rider Policy (20 Articles)',
              style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      bottomNavigationBar: widget.showAgreeButton
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
              ),
              child: SafeArea(
                child: SizedBox(
                  height: 52,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    icon: const Icon(LucideIcons.checkCircle2, size: 20),
                    label: const Text(
                      'I Have Read & Agree to the Rider Policy',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    onPressed: () {
                      widget.onAgree?.call();
                      Navigator.of(context).pop();
                    },
                  ),
                ),
              ),
            )
          : null,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Policy Hero Banner
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F291E), Color(0xFF131D2E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(LucideIcons.shieldAlert, color: AppTheme.primary, size: 24),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'TradesPoint.store Rider Policy',
                              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Official Delivery Code of Conduct & Standards',
                              style: TextStyle(color: Color(0xFF4ADE80), fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Welcome to TradesPoint.store. This Rider Policy establishes the rules, responsibilities, and standards that all delivery riders using the TradesPoint delivery platform are expected to follow.\n\nBy registering or accepting delivery orders through TradesPoint.store, you agree to comply with this policy.',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12, height: 1.45),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Search input
            Container(
              height: 48,
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Row(
                children: [
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 14),
                    child: Icon(LucideIcons.search, size: 18, color: Color(0xFF9CA3AF)),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        hintText: 'Search policy rules, OTP, safety, fees...',
                        hintStyle: TextStyle(color: Color(0xFF6B7280), fontSize: 13),
                        border: InputBorder.none,
                        isDense: true,
                      ),
                      onChanged: (v) => setState(() => _searchQuery = v),
                    ),
                  ),
                  if (_searchQuery.isNotEmpty)
                    IconButton(
                      icon: const Icon(LucideIcons.x, size: 16, color: Colors.white),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // List of 20 Policy Articles
            if (filtered.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: Text(
                    'No policy section matching "$_searchQuery"',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 13),
                  ),
                ),
              )
            else
              ...filtered.map((article) => _buildArticleCard(article)),

            const SizedBox(height: 24),

            // Acceptance footer note
            Center(
              child: Column(
                children: [
                  const Icon(LucideIcons.checkCircle2, color: AppTheme.primary, size: 28),
                  const SizedBox(height: 8),
                  const Text(
                    'TradesPoint.store',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Shop more. Save more. Live better.',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontStyle: FontStyle.italic, fontSize: 12),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildArticleCard(Map<String, dynamic> article) {
    final number = article['number'] as int;
    final title = article['title'] as String;
    final icon = article['icon'] as IconData;
    final points = article['points'] as List<String>;
    final intro = article['intro'] as String?;
    final isDanger = article['isDanger'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDanger ? const Color(0xFF1E1214) : AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDanger
              ? Colors.red.withValues(alpha: 0.3)
              : Colors.white.withValues(alpha: 0.06),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isDanger
                      ? Colors.red.withValues(alpha: 0.2)
                      : AppTheme.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Icon(
                    icon,
                    size: 16,
                    color: isDanger ? const Color(0xFFF87171) : AppTheme.primary,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '$number. $title',
                  style: TextStyle(
                    color: isDanger ? const Color(0xFFFCA5A5) : Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          if (intro != null) ...[
            const SizedBox(height: 10),
            Text(
              intro,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.8),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
          const SizedBox(height: 10),
          ...points.map(
            (p) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 4, right: 8),
                    child: Container(
                      width: 5,
                      height: 5,
                      decoration: BoxDecoration(
                        color: isDanger ? const Color(0xFFF87171) : AppTheme.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      p,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
