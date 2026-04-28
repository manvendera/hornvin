import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers/inventory_provider.dart';
import '../../../../core/theme/app_theme.dart';

class DistributorInventoryScreen extends ConsumerWidget {
  const DistributorInventoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inventoryState = ref.watch(inventoryProvider);

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Inventory Management', style: Theme.of(context).textTheme.headlineMedium),
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () => ref.read(inventoryProvider.notifier).fetchInventory(),
              ),
            ],
          ),
            const SizedBox(height: 24),
            Expanded(
              child: inventoryState.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : inventoryState.error != null
                      ? Center(child: Text('Error: ${inventoryState.error}'))
                      : Card(
                          child: ListView.separated(
                            itemCount: inventoryState.items.length,
                            separatorBuilder: (context, index) => const Divider(height: 1),
                            itemBuilder: (context, index) {
                              final item = inventoryState.items[index];
                              final product = item['product'];
                              return ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                leading: CircleAvatar(
                                  backgroundColor: DistributorTheme.lightGray,
                                  child: Icon(Icons.build_circle, color: item['isLowStock'] ? Colors.red : DistributorTheme.darkBlue),
                                ),
                                title: Text(product['name'] ?? 'Unknown Product', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('SKU: ${product['sku'] ?? 'N/A'} | Threshold: ${item['lowStockThreshold']}'),
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('${item['allocatedQuantity']} units',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                          color: item['isLowStock'] ? Colors.red : DistributorTheme.darkBlue,
                                        )),
                                    if (item['isLowStock'])
                                      const Text('LOW STOCK', style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
            ),
        ],
      ),
    );
  }
}
