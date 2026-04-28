import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class DistributorLogisticsScreen extends StatelessWidget {
  const DistributorLogisticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Logistics & Deliveries', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 24),
            Row(
              children: [
                _buildLogisticsStat('Active Agents', '8', Icons.person_pin_circle, Colors.blue),
                const SizedBox(width: 16),
                _buildLogisticsStat('In Transit', '14', Icons.local_shipping, Colors.orange),
                const SizedBox(width: 16),
                _buildLogisticsStat('Delivered (Today)', '32', Icons.task_alt, Colors.green),
              ],
            ),
            const SizedBox(height: 32),
            Expanded(
              child: Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Text('Delivery Status Tracking', style: Theme.of(context).textTheme.titleLarge),
                    ),
                    const Divider(height: 1),
                    Expanded(
                      child: ListView.separated(
                        itemCount: 10,
                        separatorBuilder: (context, index) => const Divider(height: 1),
                        itemBuilder: (context, index) => _buildDeliveryItem(context, index),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: DistributorTheme.primaryRed,
        icon: const Icon(Icons.add_road, color: Colors.white),
        label: const Text('Assign New Delivery', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _buildLogisticsStat(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 24)),
                Text(label, style: const TextStyle(color: DistributorTheme.textSecondary, fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryItem(BuildContext context, int index) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: const CircleAvatar(
        backgroundColor: DistributorTheme.lightGray,
        child: Icon(Icons.delivery_dining, color: DistributorTheme.darkBlue),
      ),
      title: Text('Order #ORD-772$index', style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text('Agent: Rajesh Kumar | Phone: +91 98765 43210'),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: index % 3 == 0 ? Colors.orange.withValues(alpha: 0.1) : Colors.blue.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              index % 3 == 0 ? 'In Transit' : 'Assigned',
              style: TextStyle(
                color: index % 3 == 0 ? Colors.orange : Colors.blue,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 4),
          const Text('ETA: 45 Mins', style: TextStyle(color: Colors.grey, fontSize: 11)),
        ],
      ),
      onTap: () {},
    );
  }
}
