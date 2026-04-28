import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class DistributorDashboardScreen extends StatelessWidget {
  const DistributorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Dashboard Overview', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 24),
          Row(
            children: [
              _buildStatCard(context, 'Total Sales', '₹4,52,000', Icons.trending_up, Colors.green),
              const SizedBox(width: 24),
              _buildStatCard(context, 'Pending Orders', '24', Icons.pending_actions, Colors.orange),
              const SizedBox(width: 24),
              _buildStatCard(context, 'Low Stock Items', '12', Icons.warning_amber_rounded, Colors.red),
              const SizedBox(width: 24),
              _buildStatCard(context, 'Outstanding', '₹85,400', Icons.account_balance_wallet, Colors.blue),
            ],
          ),
          const SizedBox(height: 32),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Recent Orders', style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 16),
                        _buildRecentOrdersTable(),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Top Retailers', style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 16),
                        _buildTopRetailersList(),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color),
              ),
              const SizedBox(height: 16),
              Text(title, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 8),
              Text(value, style: Theme.of(context).textTheme.headlineMedium),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentOrdersTable() {
    return Table(
      columnWidths: const {
        0: FlexColumnWidth(1),
        1: FlexColumnWidth(2),
        2: FlexColumnWidth(1),
        3: FlexColumnWidth(1),
      },
      children: [
        TableRow(
          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: DistributorTheme.borderGray))),
          children: [
            _tableHeader('Order ID'),
            _tableHeader('Retailer'),
            _tableHeader('Amount'),
            _tableHeader('Status'),
          ],
        ),
        _tableRow('ORD-982', 'Galaxy Motors', '₹12,450', 'Pending'),
        _tableRow('ORD-981', 'Auto Care Hub', '₹8,900', 'Shipped'),
        _tableRow('ORD-980', 'Speed King', '₹22,100', 'Delivered'),
      ],
    );
  }

  Widget _tableHeader(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Text(text, style: const TextStyle(fontWeight: FontWeight.bold)),
    );
  }

  TableRow _tableRow(String id, String retailer, String amount, String status) {
    return TableRow(
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: DistributorTheme.borderGray))),
      children: [
        Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Text(id)),
        Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Text(retailer)),
        Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Text(amount)),
        Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Text(status)),
      ],
    );
  }

  Widget _buildTopRetailersList() {
    final retailers = [
      {'name': 'Galaxy Motors', 'sales': '₹2.4L'},
      {'name': 'Auto Care Hub', 'sales': '₹1.8L'},
      {'name': 'Speed King', 'sales': '₹1.2L'},
    ];
    return Column(
      children: retailers.map((r) => ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(r['name']!),
        subtitle: Text('Total Sales: ${r['sales']}'),
        trailing: const Icon(Icons.chevron_right),
      )).toList(),
    );
  }
}
