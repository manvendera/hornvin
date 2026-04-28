import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hornvin_admin/features/auth/screens/login_screen.dart';
import 'package:hornvin_admin/features/dashboard/screens/dashboard_screen.dart';
import 'package:hornvin_admin/features/products/screens/product_screen.dart';
import 'package:hornvin_admin/features/products/screens/bulk_upload_screen.dart';
import 'package:hornvin_admin/features/users/screens/user_screen.dart';
import 'package:hornvin_admin/features/orders/screens/order_screen.dart';
import 'package:hornvin_admin/features/inventory/screens/inventory_screen.dart';
import 'package:hornvin_admin/features/reports/screens/report_screen.dart';
import 'package:hornvin_admin/features/notifications/screens/notification_screen.dart';
import 'package:hornvin_admin/shared/layout/main_layout.dart';
import 'package:hornvin_admin/features/auth/providers/auth_provider.dart';
import 'package:hornvin_admin/features/auth/screens/role_selection_screen.dart';
import 'package:hornvin_admin/features/auth/screens/phone_input_screen.dart';
import 'package:hornvin_admin/features/auth/screens/otp_verification_screen.dart';
import 'package:hornvin_admin/features/auth/screens/final_registration_screen.dart';
import 'package:hornvin_admin/features/profile/presentation/screens/profile_screen.dart';
import 'package:hornvin_admin/features/sales_team/screens/sales_team_screen.dart';

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;
  RouterNotifier(this._ref) {
    _ref.listen(authProvider, (previous, next) => notifyListeners());
  }

  String? redirect(BuildContext context, GoRouterState state) {
    final authState = _ref.read(authProvider);
    final isLoggingIn = state.uri.path == '/login';
    final isSigningUp = state.uri.path == '/signup';
    final isLoggedIn = authState.isAuthenticated;

    if (!isLoggedIn && !isLoggingIn && !isSigningUp) return '/login';
    if (isLoggedIn && (isLoggingIn || isSigningUp)) return '/dashboard';
    return null;
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = RouterNotifier(ref);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: notifier,
    redirect: notifier.redirect,
    routes: [
      GoRoute(
        path: '/',
        redirect: (context, state) => '/dashboard',
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const RoleSelectionScreen(),
      ),
      GoRoute(
        path: '/auth/phone-input',
        builder: (context, state) {
          final role = state.extra as String? ?? 'customer';
          return PhoneInputScreen(role: role);
        },
      ),
      GoRoute(
        path: '/auth/otp-verify',
        builder: (context, state) {
          final data = state.extra as Map<String, dynamic>;
          return OtpVerificationScreen(
            phone: data['phone'],
            role: data['role'],
          );
        },
      ),
      GoRoute(
        path: '/auth/final-register',
        builder: (context, state) {
          final data = state.extra as Map<String, dynamic>;
          return FinalRegistrationScreen(
            phone: data['phone'],
            role: data['role'],
            otp: data['otp'],
          );
        },
      ),
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
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
            path: '/distributors',
            builder: (context, state) => const UserScreen(initialTabIndex: 0),
          ),
          GoRoute(
            path: '/garages',
            builder: (context, state) => const UserScreen(initialTabIndex: 1),
          ),
          GoRoute(
            path: '/customers',
            builder: (context, state) => const UserScreen(initialTabIndex: 2),
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
          GoRoute(
            path: '/sales-team',
            builder: (context, state) => const SalesTeamScreen(),
          ),
        ],
      ),
    ],
  );
});
