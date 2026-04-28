import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/inventory/presentation/inventory_screen.dart';
import '../../features/orders/presentation/order_screen.dart';
import '../../features/logistics/presentation/logistics_screen.dart';
import '../../features/retailers/presentation/retailer_screen.dart';
import '../../features/payments/presentation/payment_screen.dart';
import '../../features/reports/presentation/report_screen.dart';
import '../../shared/layout/distributor_layout.dart';

final distributorRouterPrvdr = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const DistributorLoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => DistributorLayout(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const DistributorDashboardScreen(),
          ),
          GoRoute(
            path: '/inventory',
            builder: (context, state) => const DistributorInventoryScreen(),
          ),
          GoRoute(
            path: '/orders',
            builder: (context, state) => const DistributorOrderScreen(),
          ),
          GoRoute(
            path: '/logistics',
            builder: (context, state) => const DistributorLogisticsScreen(),
          ),
          GoRoute(
            path: '/retailers',
            builder: (context, state) => const DistributorRetailerScreen(),
          ),
          GoRoute(
            path: '/payments',
            builder: (context, state) => const DistributorPaymentScreen(),
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const DistributorReportScreen(),
          ),
        ],
      ),
    ],
  );
});
