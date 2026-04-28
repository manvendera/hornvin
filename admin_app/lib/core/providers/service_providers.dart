import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/services/auth_service.dart';
import 'package:hornvin_admin/services/product_service.dart';
import 'package:hornvin_admin/services/user_service.dart';
import 'package:hornvin_admin/services/inventory_service.dart';
import 'package:hornvin_admin/services/notification_service.dart';
import 'package:hornvin_admin/services/order_service.dart';
import 'package:hornvin_admin/services/report_service.dart';

final authServiceProvider = Provider((ref) => AuthService());
final productServiceProvider = Provider((ref) => ProductService());
final userServiceProvider = Provider((ref) => UserService());
final inventoryServiceProvider = Provider((ref) => InventoryService());
final notificationServiceProvider = Provider((ref) => NotificationService());
final orderServiceProvider = Provider((ref) => OrderService());
final reportServiceProvider = Provider((ref) => ReportService());
