import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class MainLayout extends StatelessWidget {
  final Widget child;
  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          const Sidebar(),
          Expanded(
            child: Container(
              color: DistributorTheme.lightGray,
              child: Column(
                children: [
                  const TopBar(),
                  Expanded(child: child),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class Sidebar extends StatelessWidget {
  const Sidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).uri.toString();

    return Container(
      width: 260,
      color: DistributorTheme.darkBlue,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            alignment: Alignment.centerLeft,
            child: Row(
              children: [
                const Icon(Icons.local_shipping, color: Colors.white, size: 32),
                const SizedBox(width: 12),
                const Text(
                  'HORNVIN',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white24, indent: 24, endIndent: 24),
          const SizedBox(height: 16),
          _SidebarItem(
            icon: Icons.dashboard_outlined,
            label: 'Dashboard',
            route: '/',
            isActive: currentRoute == '/',
          ),
          _SidebarItem(
            icon: Icons.inventory_2_outlined,
            label: 'Inventory',
            route: '/inventory',
            isActive: currentRoute == '/inventory',
          ),
          _SidebarItem(
            icon: Icons.shopping_cart_outlined,
            label: 'Orders',
            route: '/orders',
            isActive: currentRoute == '/orders',
          ),
          _SidebarItem(
            icon: Icons.account_balance_wallet_outlined,
            label: 'Payments',
            route: '/payments',
            isActive: currentRoute == '/payments',
          ),
          _SidebarItem(
            icon: Icons.bar_chart_outlined,
            label: 'Reports',
            route: '/reports',
            isActive: currentRoute == '/reports',
          ),
          const Spacer(),
          const Divider(color: Colors.white24, indent: 24, endIndent: 24),
          _SidebarItem(
            icon: Icons.settings_outlined,
            label: 'Settings',
            route: '/settings',
            isActive: currentRoute == '/settings',
          ),
          _SidebarItem(
            icon: Icons.logout,
            label: 'Logout',
            route: '/login',
            isActive: false,
            onTap: () {
              // Handle logout logic here
              context.go('/login');
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;
  final bool isActive;
  final VoidCallback? onTap;

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.route,
    required this.isActive,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: InkWell(
        onTap: onTap ?? () => context.go(route),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? DistributorTheme.primaryRed : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(icon, color: isActive ? Colors.white : Colors.white70, size: 20),
              const SizedBox(width: 16),
              Text(
                label,
                style: TextStyle(
                  color: isActive ? Colors.white : Colors.white70,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TopBar extends StatelessWidget {
  const TopBar({super.key});

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
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.notifications_none, color: DistributorTheme.darkBlue),
            onPressed: () {},
          ),
          const SizedBox(width: 16),
          const VerticalDivider(indent: 20, endIndent: 20),
          const SizedBox(width: 16),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text(
                'Mega Distributor',
                style: TextStyle(fontWeight: FontWeight.bold, color: DistributorTheme.darkBlue),
              ),
              Text(
                'ID: DIST-9021',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
          ),
          const SizedBox(width: 12),
          const CircleAvatar(
            backgroundColor: DistributorTheme.primaryRed,
            child: Icon(Icons.person, color: Colors.white),
          ),
        ],
      ),
    );
  }
}
