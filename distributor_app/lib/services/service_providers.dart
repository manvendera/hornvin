import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../services/distributor_service.dart';
import '../models/distributor_models.dart';
import '../models/order_model.dart';

// Services
final authServicePrvdr = Provider((ref) => AuthService());
final distributorServicePrvdr = Provider((ref) => DistributorService());

// Auth State
final authStatePrvdr = StateProvider<UserModel?>((ref) => null);

// Inventory
final inventoryPrvdr = FutureProvider<List<ProductModel>>((ref) async {
  return ref.watch(distributorServicePrvdr).getInventory();
});

// Orders
final ordersPrvdr = FutureProvider<List<OrderModel>>((ref) async {
  return ref.watch(distributorServicePrvdr).getOrders();
});

// Dashboard Stats
final dashboardStatsPrvdr = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.watch(distributorServicePrvdr).getDashboardStats();
});
