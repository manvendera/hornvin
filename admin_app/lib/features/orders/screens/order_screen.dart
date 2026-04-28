import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/features/orders/providers/order_provider.dart';

class OrderScreen extends ConsumerWidget {
  const OrderScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderState = ref.watch(orderProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Orders',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 24),
        Expanded(
          child: Card(
            child: orderState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : orderState.error != null
                    ? Center(child: Text(orderState.error!))
                    : ListView.builder(
                        itemCount: orderState.orders.length,
                        itemBuilder: (context, index) {
                          final order = orderState.orders[index];
                          return ListTile(
                            title: Text('Order #${order.id.substring(order.id.length - 6)}'),
                            subtitle: Text('Total: ₹${order.totalAmount} | Date: ${order.createdAt}'),
                            trailing: DropdownButton<String>(
                              value: order.status,
                              items: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
                                  .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                                  .toList(),
                              onChanged: (newStatus) {
                                if (newStatus != null) {
                                  ref.read(orderProvider.notifier).updateOrderStatus(order.id, newStatus);
                                }
                              },
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
