import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/theme/app_theme.dart';
import 'package:hornvin_admin/core/routing/app_router.dart';

void mainAdmin() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: HornvinAdminApp()));
}

class HornvinAdminApp extends ConsumerWidget {
  const HornvinAdminApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Hornvin Admin Panel',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }
}
