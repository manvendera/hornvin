import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(
    const ProviderScope(
      child: DistributorApp(),
    ),
  );
}

class DistributorApp extends ConsumerWidget {
  const DistributorApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(distributorRouterPrvdr);

    return MaterialApp.router(
      title: 'Hornvin Distributor',
      debugShowCheckedModeBanner: false,
      theme: DistributorTheme.theme,
      routerConfig: router,
    );
  }
}
