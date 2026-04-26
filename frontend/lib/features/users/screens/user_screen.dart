import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/user_provider.dart';

class UserScreen extends ConsumerWidget {
  const UserScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.watch(userProvider);

    return DefaultTabController(
      length: 3,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Users',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          const TabBar(
            tabs: [
              Tab(text: 'Distributors'),
              Tab(text: 'Garages'),
              Tab(text: 'Customers'),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: userState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : userState.error != null
                    ? Center(child: Text(userState.error!))
                    : TabBarView(
                        children: [
                          _buildUserList(userState.distributors),
                          _buildUserList(userState.garages),
                          _buildUserList(userState.customers),
                        ],
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserList(List users) {
    if (users.isEmpty) {
      return const Center(child: Text('No users found.'));
    }
    return ListView.builder(
      itemCount: users.length,
      itemBuilder: (context, index) {
        final user = users[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(child: Text(user.name[0].toUpperCase())),
            title: Text(user.name),
            subtitle: Text(user.email),
            trailing: Chip(
              label: Text(user.status),
              backgroundColor: user.status == 'Active' ? Colors.green[100] : Colors.orange[100],
            ),
          ),
        );
      },
    );
  }
}
