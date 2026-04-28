import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class DistributorReportScreen extends StatelessWidget {
  const DistributorReportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Reports & Analytics', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 24),
            Row(
              children: [
                _buildReportTypeCard('Sales Report', Icons.bar_chart, 'Monthly breakdown of sales'),
                const SizedBox(width: 16),
                _buildReportTypeCard('Inventory Report', Icons.inventory, 'Stock levels and turnover'),
                const SizedBox(width: 16),
                _buildReportTypeCard('Retailer Performance', Icons.people, 'Top performing retailers'),
              ],
            ),
            const SizedBox(height: 32),
            Text('Quick Insights', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 24,
                mainAxisSpacing: 24,
                childAspectRatio: 1.5,
                children: [
                  _buildInsightChartCard('Revenue Growth', '↑ 12% from last month'),
                  _buildInsightChartCard('Order Fulfillment Rate', '98.5%'),
                  _buildInsightChartCard('Average Order Value', '₹18,400'),
                  _buildInsightChartCard('Stock Turnover Ratio', '4.2x'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportTypeCard(String title, IconData icon, String subtitle) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: DistributorTheme.primaryRed, size: 32),
              const SizedBox(height: 16),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 8),
              Text(subtitle, style: const TextStyle(color: DistributorTheme.textSecondary, fontSize: 14)),
              const SizedBox(height: 16),
              TextButton(onPressed: () {}, child: const Text('Generate Report →')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInsightChartCard(String title, String value) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: const TextStyle(color: DistributorTheme.textSecondary, fontSize: 16)),
            const SizedBox(height: 12),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 32, color: DistributorTheme.darkBlue)),
            const SizedBox(height: 24),
            // Placeholder for a chart
            Container(
              height: 60,
              width: double.infinity,
              decoration: BoxDecoration(
                color: DistributorTheme.lightGray,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(child: Text('Chart Placeholder', style: TextStyle(color: Colors.grey))),
            ),
          ],
        ),
      ),
    );
  }
}
