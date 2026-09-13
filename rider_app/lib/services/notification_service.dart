import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../theme/app_theme.dart';
import 'supabase_service.dart';

// Top-level background message handler for FCM
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Handling a background push message: ${message.messageId}');
}

class NotificationService {
  static final AudioPlayer _audioPlayer = AudioPlayer();
  static final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  static final Set<String> _knownOrderIds = {};
  static bool _initialized = false;
  static bool _pushInitialized = false;

  // Initialize push notification services
  static Future<void> initializePushNotifications() async {
    if (_pushInitialized) return;

    try {
      // 1. Initialize Firebase if configured
      await Firebase.initializeApp();

      // 2. Set background messaging handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // 3. Request permissions on Android 13+ / iOS
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('User notification permission status: ${settings.authorizationStatus}');

      // 4. Initialize Local Notifications Channel for Heads-up alerts
      const androidChannel = AndroidNotificationChannel(
        'rider_delivery_channel',
        'Rider Delivery Alerts',
        description: 'Instant alerts for new available orders and assignments.',
        importance: Importance.max,
        playSound: true,
        sound: RawResourceAndroidNotificationSound('notification'),
      );

      final androidPlugin = _localNotifications
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
      await androidPlugin?.createNotificationChannel(androidChannel);

      const initSettingsAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
      const initSettings = InitializationSettings(android: initSettingsAndroid);

      await _localNotifications.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (response) {
          debugPrint('Notification clicked: ${response.payload}');
        },
      );

      // 5. Get and register FCM token
      final token = await messaging.getToken();
      if (token != null) {
        debugPrint('FCM Registration Token: $token');
        await SupabaseService.registerPushToken(token);
      }

      // Listen for token refreshes
      messaging.onTokenRefresh.listen((newToken) async {
        await SupabaseService.registerPushToken(newToken);
      });

      // 6. Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Got a message whilst in the foreground!');
        playChime();

        final notification = message.notification;
        if (notification != null) {
          _localNotifications.show(
            notification.hashCode,
            notification.title ?? 'New Delivery Available! 🚴',
            notification.body ?? 'Check your rider app for details.',
            NotificationDetails(
              android: AndroidNotificationDetails(
                androidChannel.id,
                androidChannel.name,
                channelDescription: androidChannel.description,
                importance: Importance.max,
                priority: Priority.high,
                icon: '@mipmap/ic_launcher',
              ),
            ),
            payload: message.data['order_id'],
          );
        }
      });

      _pushInitialized = true;
    } catch (e) {
      debugPrint('Notice: Push notification service setup skipped or pending configuration: $e');
    }
  }

  // Play audio chime
  static Future<void> playChime() async {
    try {
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('notification.wav'));
    } catch (e) {
      debugPrint('Error playing notification chime: $e');
    }
  }

  // Check for newly available orders and notify rider
  static Future<void> checkForNewDeliveries(
    BuildContext context,
    List<Map<String, dynamic>> orders, {
    bool isOnline = true,
  }) async {
    if (!isOnline) return;

    final availableOrders = orders.where((o) {
      final status = (o['status'] as String? ?? '').toLowerCase();
      final paymentStatus = (o['payment_status'] as String? ?? '').toLowerCase();
      final assignedRiderId = o['assigned_rider_id'] as String?;

      final isPaidOrConfirmed = (paymentStatus == 'paid') ||
          (status == 'confirmed' || status == 'processing' || status == 'shipped');

      return assignedRiderId == null &&
          isPaidOrConfirmed &&
          status != 'pending' &&
          status != 'delivered' &&
          status != 'cancelled' &&
          status != 'refunded';
    }).toList();

    final currentIds = availableOrders.map((o) => o['id'] as String).toSet();

    if (!_initialized) {
      // First run: store current set without ringing so existing orders don't chime on app start
      _knownOrderIds.addAll(currentIds);
      _initialized = true;
      return;
    }

    // Find new orders that were not present previously
    final newOrders = availableOrders.where((o) => !_knownOrderIds.contains(o['id'])).toList();

    if (newOrders.isNotEmpty) {
      _knownOrderIds.addAll(newOrders.map((o) => o['id'] as String));

      // Play audio alert chime
      await playChime();

      // Show top alert notification banner on rider's phone
      if (context.mounted) {
        showNewDeliveryDialog(context, newOrders.first);
      }
    }
  }

  // Show rich notification alert dialog on rider phone
  static void showNewDeliveryDialog(BuildContext context, Map<String, dynamic> order) {
    final trackingCode = order['tracking_code'] as String? ??
        (order['id'] as String? ?? '').substring(0, 8).toUpperCase();
    final city = order['shipping_city'] as String? ?? 'Accra';
    final region = order['shipping_region'] as String? ?? '';
    final amount = (order['total_amount'] as num?)?.toStringAsFixed(2) ?? '0.00';
    final currency = order['currency'] as String? ?? 'GHS';

    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'New Delivery',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 350),
      pageBuilder: (ctx, anim1, anim2) => const SizedBox.shrink(),
      transitionBuilder: (ctx, anim1, anim2, child) {
        final curvedAnim = CurvedAnimation(parent: anim1, curve: Curves.easeOutBack);
        return Transform.scale(
          scale: curvedAnim.value,
          child: Opacity(
            opacity: anim1.value,
            child: AlertDialog(
              backgroundColor: AppTheme.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: BorderSide(color: AppTheme.primary.withValues(alpha: 0.4), width: 1.5),
              ),
              contentPadding: const EdgeInsets.all(20),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Animated pulsing badge
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.primary.withValues(alpha: 0.15),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primary.withValues(alpha: 0.3),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: const Icon(LucideIcons.bike, color: AppTheme.primary, size: 32),
                  ),
                  const SizedBox(height: 16),

                  const Text(
                    'NEW DELIVERY AVAILABLE! 🔔',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.primary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Order #$trackingCode',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 12,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Order Details Card
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F1620),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Icon(LucideIcons.mapPin, size: 14, color: Colors.white.withValues(alpha: 0.4)),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                region.isNotEmpty ? '$city, $region' : city,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Payout / Total', style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 12)),
                            Text('$currency $amount', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 15)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Claim Now Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        Navigator.of(ctx).pop();
                        try {
                          await SupabaseService.claimOrder(order['id']);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Delivery Claimed Successfully! 🚴'),
                                backgroundColor: AppTheme.primary,
                              ),
                            );
                            Navigator.of(context).pushNamed('/order/${order['id']}');
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(e.toString().replaceAll('Exception: ', '')),
                                backgroundColor: Colors.red.shade700,
                              ),
                            );
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      icon: const Icon(LucideIcons.bike, size: 18),
                      label: const Text('Claim Delivery Now 🚴', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Dismiss button
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: Text(
                      'Dismiss',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
