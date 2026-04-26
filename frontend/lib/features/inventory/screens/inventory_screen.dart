import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/inventory_provider.dart';

class InventoryScreen extends ConsumerWidget {
  const InventoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inventoryState = ref.watch(inventoryProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Inventory',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            ElevatedButton.icon(
              onPressed: () {
                // Show allocate stock modal
              },
              icon: const Icon(Icons.assignment),
              label: const Text('Allocate Stock'),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Expanded(
          child: Card(
            child: inventoryState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : inventoryState.error != null
                    ? Center(child: Text(inventoryState.error!))
                    : ListView.builder(
                        itemCount: inventoryState.inventory.length,
                        itemBuilder: (context, index) {
                          final item = inventoryState.inventory[index];
                          final isLowStock = item.stockCount < 10;
                          
                          return ListTile(
                            title: Text(item.name),
                            subtitle: Text('Category: ${item.category}'),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: isLowStock ? Colors.red[100] : Colors.green[100],
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                '${item.stockCount} in stock',
                                style: TextStyle(
                                  color: isLowStock ? Colors.red[900] : Colors.green[900],
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ),
      ],
    );
  }
}
