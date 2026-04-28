import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class DistributorPaymentScreen extends StatelessWidget {
  const DistributorPaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Billing & Payments', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 24),
            Row(
              children: [
                _buildPaymentCard('Total Receivables', '₹12,45,000', Icons.account_balance, Colors.blue),
                const SizedBox(width: 16),
                _buildPaymentCard('Overdue', '₹2,10,400', Icons.error_outline, Colors.red),
                const SizedBox(width: 16),
                _buildPaymentCard('Collected (MTD)', '₹8,12,000', Icons.payments_outlined, Colors.green),
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
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Transaction History', style: Theme.of(context).textTheme.titleLarge),
                          OutlinedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.download),
                            label: const Text('Export Statement'),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),
                    Expanded(
                      child: _buildTransactionList(),
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

  Widget _buildPaymentCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: DistributorTheme.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: DistributorTheme.borderGray),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 16),
            Text(label, style: const TextStyle(color: DistributorTheme.textSecondary, fontSize: 14)),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: DistributorTheme.darkBlue)),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionList() {
    return ListView.separated(
      itemCount: 15,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) => ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: index % 2 == 0 ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
          child: Icon(
            index % 2 == 0 ? Icons.arrow_downward : Icons.arrow_upward,
            color: index % 2 == 0 ? Colors.green : Colors.red,
            size: 20,
          ),
        ),
        title: Text('Galaxy Motors - Payment Recv.', style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: const Text('TXN_ID: 987234234 | 14 May 2024'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('₹45,000', style: TextStyle(fontWeight: FontWeight.bold, color: index % 2 == 0 ? Colors.green : Colors.red)),
            const Text('Success', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
