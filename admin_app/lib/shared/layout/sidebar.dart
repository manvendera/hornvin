import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hornvin_admin/core/theme/app_theme.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).uri.path;

    return Container(
      width: 250,
      decoration: const BoxDecoration(
        color: AppTheme.darkBlue,
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 10,
            offset: Offset(2, 0),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            height: 80,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            alignment: Alignment.centerLeft,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryRed,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.directions_car, color: Colors.white),
                ),
                const SizedBox(width: 12),
                const Text(
                  'HORNVIN',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white12, height: 1),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _SidebarItem(
                  icon: Icons.dashboard_outlined,
                  title: 'Dashboard',
                  isSelected: currentPath == '/dashboard',
                  onTap: () => context.go('/dashboard'),
                ),
                _SidebarItem(
                  icon: Icons.inventory_2_outlined,
                  title: 'Products',
                  isSelected: currentPath.startsWith('/products'),
                  onTap: () => context.go('/products'),
                ),
                _SidebarItem(
                  icon: Icons.local_shipping_outlined,
                  title: 'Distributors',
                  isSelected: currentPath.startsWith('/distributors'),
                  onTap: () => context.go('/distributors'),
                ),
                _SidebarItem(
                  icon: Icons.build_outlined,
                  title: 'Garages',
                  isSelected: currentPath.startsWith('/garages'),
                  onTap: () => context.go('/garages'),
                ),
                _SidebarItem(
                  icon: Icons.people_outline,
                  title: 'Customers',
                  isSelected: currentPath.startsWith('/customers'),
                  onTap: () => context.go('/customers'),
                ),
                _SidebarItem(
                  icon: Icons.shopping_cart_outlined,
                  title: 'Orders',
                  isSelected: currentPath.startsWith('/orders'),
                  onTap: () => context.go('/orders'),
                ),
                _SidebarItem(
                  icon: Icons.badge_outlined,
                  title: 'Sales Team',
                  isSelected: currentPath.startsWith('/sales-team'),
                  onTap: () => context.go('/sales-team'),
                ),
                _SidebarItem(
                  icon: Icons.analytics_outlined,
                  title: 'Reports',
                  isSelected: currentPath.startsWith('/reports'),
                  onTap: () => context.go('/reports'),
                ),
                _SidebarItem(
                  icon: Icons.notifications_outlined,
                  title: 'Notifications',
                  isSelected: currentPath.startsWith('/notifications'),
                  onTap: () => context.go('/notifications'),
                ),
                _SidebarItem(
                  icon: Icons.upload_file_outlined,
                  title: 'Bulk Upload',
                  isSelected: currentPath.startsWith('/bulk-upload'),
                  onTap: () => context.go('/bulk-upload'),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Divider(color: Colors.white12, height: 1),
                ),
                _SidebarItem(
                  icon: Icons.settings_outlined,
                  title: 'Settings',
                  isSelected: currentPath == '/profile',
                  onTap: () => context.go('/profile'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _SidebarItem({
    required this.icon,
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: isSelected ? AppTheme.royalBlue : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          hoverColor: AppTheme.royalBlue.withValues(alpha: 0.5),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: isSelected 
                ? const Border(left: BorderSide(color: AppTheme.primaryRed, width: 4))
                : null,
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: isSelected ? Colors.white : Colors.white60,
                  size: 20,
                ),
                const SizedBox(width: 16),
                Text(
                  title,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.white60,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
