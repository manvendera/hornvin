import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hornvin_admin/features/auth/providers/auth_provider.dart';
import 'package:hornvin_admin/features/profile/presentation/providers/profile_provider.dart';
import 'package:hornvin_admin/core/theme/app_theme.dart';
import 'sidebar.dart';

class MainLayout extends ConsumerWidget {
  final Widget child;

  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Row(
        children: [
          const Sidebar(),
          Expanded(
            child: Column(
              children: [
                const _TopNavbar(),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(24),
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

class _TopNavbar extends ConsumerWidget {
  const _TopNavbar();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(profileProvider);

    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: const BoxDecoration(
        color: AppTheme.darkBlue,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Admin Management System',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none, color: Colors.white),
                onPressed: () {},
              ),
              const SizedBox(width: 16),
              profileAsync.when(
                data: (profile) => CircleAvatar(
                  radius: 18,
                  backgroundColor: AppTheme.royalBlue,
                  backgroundImage: profile.avatar != null ? NetworkImage(profile.avatar!) : null,
                  child: profile.avatar == null ? const Icon(Icons.person, size: 20, color: Colors.white) : null,
                ),
                loading: () => const CircleAvatar(
                  radius: 18,
                  backgroundColor: Colors.grey,
                  child: SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  ),
                ),
                error: (err, stack) => const CircleAvatar(
                  radius: 18,
                  backgroundColor: Colors.grey,
                  child: Icon(Icons.person, color: Colors.white, size: 20),
                ),
              ),
              const SizedBox(width: 12),
              PopupMenuButton<String>(
                offset: const Offset(0, 40),
                child: Row(
                  children: [
                    Text(
                      profileAsync.when(
                        data: (p) => p.name,
                        loading: () => 'Admin',
                        error: (err, stack) => 'Admin',
                      ),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    const Icon(Icons.arrow_drop_down, color: Colors.white),
                  ],
                ),
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'profile',
                    child: Row(
                      children: [
                        Icon(Icons.person_outline, size: 20),
                        SizedBox(width: 12),
                        Text('Profile Settings'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'logout',
                    child: Row(
                      children: [
                        Icon(Icons.logout, size: 20, color: AppTheme.primaryRed),
                        SizedBox(width: 12),
                        Text('Logout', style: TextStyle(color: AppTheme.primaryRed)),
                      ],
                    ),
                  ),
                ],
                onSelected: (value) {
                  if (value == 'profile') {
                    GoRouter.of(context).push('/profile');
                  } else if (value == 'logout') {
                    ref.read(authProvider.notifier).logout();
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
