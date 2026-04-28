import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class DistributorRetailerScreen extends StatelessWidget {
  const DistributorRetailerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Retailer Network', style: Theme.of(context).textTheme.headlineMedium),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.person_add_alt_1),
                  label: const Text('Add New Retailer'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: Card(
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Search retailers by name, location or ID...',
                          prefixIcon: const Icon(Icons.search),
                          fillColor: DistributorTheme.lightGray,
                        ),
                      ),
                    ),
                    Expanded(
                      child: _buildRetailerList(),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRetailerList() {
    final retailers = [
      {'name': 'Galaxy Motors', 'location': 'New Delhi', 'orders': '124', 'status': 'Active'},
      {'name': 'Auto Care Hub', 'location': 'Mumbai', 'orders': '89', 'status': 'Active'},
      {'name': 'Speed King', 'location': 'Bangalore', 'orders': '56', 'status': 'Pending'},
      {'name': 'Elite Spares', 'location': 'Chennai', 'orders': '210', 'status': 'Active'},
    ];

    return ListView.separated(
      itemCount: retailers.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final r = retailers[index];
        return ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          leading: CircleAvatar(
            backgroundColor: DistributorTheme.darkBlue,
            child: Text(r['name']![0], style: const TextStyle(color: Colors.white)),
          ),
          title: Text(r['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text('${r['location']} | ${r['orders']} Total Orders'),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildStatusIndicator(r['status']!),
              const SizedBox(width: 16),
              IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
            ],
          ),
          onTap: () {},
        );
      },
    );
  }

  Widget _buildStatusIndicator(String status) {
    final color = status == 'Active' ? Colors.green : Colors.orange;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }
}
