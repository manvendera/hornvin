import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).uri.path;

    return Container(
      width: 250,
      color: AppTheme.secondaryColor,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            child: const Text(
              'HORNVIN',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
              ),
            ),
          ),
          const Divider(color: Colors.white24, height: 1),
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
                  icon: Icons.store_outlined,
                  title: 'Inventory',
                  isSelected: currentPath.startsWith('/inventory'),
                  onTap: () => context.go('/inventory'),
                ),
                _SidebarItem(
                  icon: Icons.people_outline,
                  title: 'Users',
                  isSelected: currentPath.startsWith('/users'),
                  onTap: () => context.go('/users'),
                ),
                _SidebarItem(
                  icon: Icons.shopping_cart_outlined,
                  title: 'Orders',
                  isSelected: currentPath.startsWith('/orders'),
                  onTap: () => context.go('/orders'),
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
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? AppTheme.primaryColor : Colors.white70,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? Colors.white : Colors.white70,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      selectedTileColor: Colors.white.withValues(alpha: 0.1),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
    );
  }
}
