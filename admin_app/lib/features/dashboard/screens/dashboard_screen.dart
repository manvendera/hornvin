import 'package:flutter/material.dart';
import 'package:hornvin_admin/core/theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dashboard Overview',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Welcome back, here is what is happening today.',
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.download, size: 20),
                label: const Text('Export Report'),
              ),
            ],
          ),
          const SizedBox(height: 32),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 4,
            crossAxisSpacing: 24,
            mainAxisSpacing: 24,
            childAspectRatio: 1.5,
            children: const [
              _StatCard(
                title: 'Total Revenue',
                value: '₹45,67,230',
                icon: Icons.payments_outlined,
                color: Colors.green,
                trend: '+12.5%',
              ),
              _StatCard(
                title: 'Active Orders',
                value: '1,284',
                icon: Icons.shopping_bag_outlined,
                color: AppTheme.royalBlue,
                trend: '+5.2%',
              ),
              _StatCard(
                title: 'Pending Inquiries',
                value: '42',
                icon: Icons.question_answer_outlined,
                color: AppTheme.primaryRed,
                trend: '-2.4%',
              ),
              _StatCard(
                title: 'New Customers',
                value: '156',
                icon: Icons.person_add_outlined,
                color: Colors.orange,
                trend: '+18.7%',
              ),
            ],
          ),
          const SizedBox(height: 32),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: _DashboardPanel(
                  title: 'Recent Transactions',
                  child: _RecentTransactionsTable(),
                ),
              ),
              const SizedBox(width: 24),
              const Expanded(
                flex: 1,
                child: _DashboardPanel(
                  title: 'Sales by Category',
                  child: _CategorySalesList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String trend;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.trend,
  });

  @override
  Widget build(BuildContext context) {
    final isPositive = trend.startsWith('+');

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: AppTheme.badgeDecoration(isPositive ? Colors.green : Colors.red),
                  child: Text(
                    trend,
                    style: TextStyle(
                      color: isPositive ? Colors.green : Colors.red,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardPanel extends StatelessWidget {
  final String title;
  final Widget child;

  const _DashboardPanel({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            child,
          ],
        ),
      ),
    );
  }
}

class _RecentTransactionsTable extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DataTable(
      columns: const [
        DataColumn(label: Text('ORDER ID')),
        DataColumn(label: Text('CUSTOMER')),
        DataColumn(label: Text('DATE')),
        DataColumn(label: Text('STATUS')),
        DataColumn(label: Text('AMOUNT')),
      ],
      rows: [
        _buildRow('ORD-9021', 'Aman Gupta', '24 Oct, 2023', 'Completed', '₹12,450'),
        _buildRow('ORD-9022', 'Rahul Dev', '24 Oct, 2023', 'Pending', '₹8,120'),
        _buildRow('ORD-9023', 'Suresh Kumar', '23 Oct, 2023', 'Shipped', '₹15,000'),
        _buildRow('ORD-9024', 'Megha Jain', '22 Oct, 2023', 'Completed', '₹4,300'),
      ],
    );
  }

  DataRow _buildRow(String id, String name, String date, String status, String amount) {
    Color statusColor;
    switch (status) {
      case 'Completed': statusColor = Colors.green; break;
      case 'Pending': statusColor = Colors.orange; break;
      default: statusColor = AppTheme.royalBlue;
    }

    return DataRow(cells: [
      DataCell(Text(id, style: const TextStyle(fontWeight: FontWeight.w600))),
      DataCell(Text(name)),
      DataCell(Text(date)),
      DataCell(
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: AppTheme.badgeDecoration(statusColor),
          child: Text(
            status,
            style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ),
      ),
      DataCell(Text(amount, style: const TextStyle(fontWeight: FontWeight.bold))),
    ]);
  }
}

class _CategorySalesList extends StatelessWidget {
  const _CategorySalesList();

  @override
  Widget build(BuildContext context) {
    final items = [
      {'name': 'Engine Oil', 'sales': '45%', 'color': AppTheme.primaryRed},
      {'name': 'Brake Pads', 'sales': '25%', 'color': AppTheme.royalBlue},
      {'name': 'Tires', 'sales': '20%', 'color': Colors.orange},
      {'name': 'Other', 'sales': '10%', 'color': Colors.grey},
    ];

    return Column(
      children: items.map((item) => Padding(
        padding: const EdgeInsets.only(bottom: 20),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: item['color'] as Color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                item['name'] as String,
                style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w500),
              ),
            ),
            Text(
              item['sales'] as String,
              style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      )).toList(),
    );
  }
}
