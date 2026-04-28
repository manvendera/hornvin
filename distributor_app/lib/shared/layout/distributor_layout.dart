import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class DistributorLayout extends StatelessWidget {
  final Widget child;
  const DistributorLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Fixed Sidebar
          const _DistributorSidebar(),
          // Main Content Area
          Expanded(
            child: Column(
              children: [
                const _DistributorTopBar(),
                Expanded(
                  child: Container(
                    color: DistributorTheme.lightGray,
                    child: child,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DistributorSidebar extends StatelessWidget {
  const _DistributorSidebar();

  @override
  Widget build(BuildContext context) {
    final state = GoRouterState.of(context);
    final currentPath = state.uri.toString();

    return Container(
      width: 250,
      color: DistributorTheme.darkBlue,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            child: const Row(
              children: [
                Icon(Icons.local_shipping, color: Colors.white, size: 32),
                SizedBox(width: 12),
                Text(
                  'HORNVIN',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white24, indent: 24, endIndent: 24),
          const SizedBox(height: 16),
          _buildNavItem(context, Icons.dashboard_outlined, 'Dashboard', currentPath == '/', '/'),
          _buildNavItem(context, Icons.inventory_2_outlined, 'Inventory', currentPath == '/inventory', '/inventory'),
          _buildNavItem(context, Icons.shopping_cart_outlined, 'Orders', currentPath == '/orders', '/orders'),
          _buildNavItem(context, Icons.people_outline, 'Retailers', currentPath == '/retailers', '/retailers'),
          _buildNavItem(context, Icons.account_balance_wallet_outlined, 'Payments', currentPath == '/payments', '/payments'),
          _buildNavItem(context, Icons.analytics_outlined, 'Reports', currentPath == '/reports', '/reports'),
          const Spacer(),
          const Divider(color: Colors.white24, indent: 24, endIndent: 24),
          _buildNavItem(context, Icons.logout, 'Logout', false, '/login', isLogout: true),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, IconData icon, String title, bool selected, String route, {bool isLogout = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        onTap: () => context.go(route),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        tileColor: selected ? DistributorTheme.primaryRed : Colors.transparent,
        leading: Icon(icon, color: selected ? Colors.white : Colors.white70, size: 22),
        title: Text(
          title,
          style: TextStyle(
            color: selected ? Colors.white : Colors.white70,
            fontWeight: selected ? FontWeight.bold : FontWeight.normal,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}

class _DistributorTopBar extends StatelessWidget {
  const _DistributorTopBar();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: DistributorTheme.borderGray)),
      ),
      child: Row(
        children: [
          const Text(
            'Welcome back, Distributor',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: DistributorTheme.darkBlue,
            ),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.notifications_none, color: DistributorTheme.darkBlue),
            onPressed: () {},
          ),
          const SizedBox(width: 16),
          const VerticalDivider(indent: 20, endIndent: 20),
          const SizedBox(width: 16),
          const CircleAvatar(
            backgroundColor: DistributorTheme.primaryRed,
            child: Icon(Icons.person, color: Colors.white),
          ),
        ],
      ),
    );
  }
}
