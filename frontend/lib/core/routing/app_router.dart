import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/products/screens/product_screen.dart';
import '../../features/products/screens/bulk_upload_screen.dart';
import '../../features/users/screens/user_screen.dart';
import '../../features/orders/screens/order_screen.dart';
import '../../features/inventory/screens/inventory_screen.dart';
import '../../features/reports/screens/report_screen.dart';
import '../../features/notifications/screens/notification_screen.dart';
import '../../shared/layout/main_layout.dart';
import '../../features/auth/providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggingIn = state.uri.path == '/login';
      final isLoggedIn = authState.isAuthenticated;

      if (!isLoggedIn && !isLoggingIn) return '/login';
      if (isLoggedIn && isLoggingIn) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/products',
            builder: (context, state) => const ProductScreen(),
          ),
          GoRoute(
            path: '/bulk-upload',
            builder: (context, state) => const BulkUploadScreen(),
          ),
          GoRoute(
            path: '/users',
            builder: (context, state) => const UserScreen(),
          ),
          GoRoute(
            path: '/orders',
            builder: (context, state) => const OrderScreen(),
          ),
          GoRoute(
            path: '/inventory',
            builder: (context, state) => const InventoryScreen(),
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const ReportScreen(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationScreen(),
          ),
        ],
      ),
    ],
  );
});
