import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class DistributorOrderScreen extends StatelessWidget {
  const DistributorOrderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Order Management'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'All Orders'),
              Tab(text: 'Pending'),
              Tab(text: 'Shipped'),
              Tab(text: 'Delivered'),
            ],
            indicatorColor: DistributorTheme.primaryRed,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
          ),
        ),
        body: TabBarView(
          children: [
            _buildOrderList(context),
            _buildOrderList(context, status: 'Pending'),
            _buildOrderList(context, status: 'Shipped'),
            _buildOrderList(context, status: 'Delivered'),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderList(BuildContext context, {String? status}) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 8,
      itemBuilder: (context, index) => Card(
        margin: const EdgeInsets.only(bottom: 16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('ORD-#782$index', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const Text('Galaxy Motors | 12 May 2024', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                  _buildStatusChip(status ?? (index % 2 == 0 ? 'Pending' : 'Shipped')),
                ],
              ),
              const Divider(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Items: 4 Products', style: TextStyle(fontWeight: FontWeight.w500)),
                  Text('Total: ₹14,500', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: DistributorTheme.darkBlue)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {},
                      child: const Text('View Details'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {},
                      child: const Text('Accept Order'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    switch (status) {
      case 'Pending': color = Colors.orange; break;
      case 'Shipped': color = Colors.blue; break;
      case 'Delivered': color = Colors.green; break;
      default: color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
    );
  }
}
