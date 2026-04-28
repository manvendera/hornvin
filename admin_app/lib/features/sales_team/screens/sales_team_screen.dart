import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/network/dio_client.dart';

class SalesTeamScreen extends ConsumerStatefulWidget {
  const SalesTeamScreen({super.key});

  @override
  ConsumerState<SalesTeamScreen> createState() => _SalesTeamScreenState();
}

class _SalesTeamScreenState extends ConsumerState<SalesTeamScreen> {
  bool _isLoading = true;
  List<dynamic> _members = [];

  @override
  void initState() {
    super.initState();
    _fetchSalesTeam();
  }

  Future<void> _fetchSalesTeam() async {
    setState(() => _isLoading = true);
    try {
      final response = await DioClient().dio.get('/admin/sales-team');
      if (response.data['success']) {
        setState(() {
          _members = response.data['data']['salesTeam'];
        });
      }
    } catch (e) {
      debugPrint('Error fetching sales team: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Sales Team Management',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            ElevatedButton.icon(
              onPressed: () => _showAddMemberDialog(),
              icon: const Icon(Icons.add),
              label: const Text('Add Sales Executive'),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Expanded(
          child: Card(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _members.isEmpty
                    ? const Center(child: Text('No sales team members found'))
                    : ListView.separated(
                        itemCount: _members.length,
                        separatorBuilder: (context, index) => const Divider(),
                        itemBuilder: (context, index) {
                          final member = _members[index];
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                              child: Text(member['name'][0].toString().toUpperCase()),
                            ),
                            title: Text(member['name']),
                            subtitle: Text(member['email']),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.red),
                              onPressed: () => _deleteMember(member['_id']),
                            ),
                          );
                        },
                      ),
          ),
        ),
      ],
    );
  }

  Future<void> _deleteMember(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Delete'),
        content: const Text('Are you sure you want to remove this sales executive?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await DioClient().dio.delete('/admin/sales-team/$id');
        _fetchSalesTeam();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to delete: $e')),
          );
        }
      }
    }
  }

  void _showAddMemberDialog() {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
    final passwordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Sales Executive'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Name')),
              TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Email')),
              TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone')),
              TextField(
                controller: passwordController,
                decoration: const InputDecoration(labelText: 'Initial Password'),
                obscureText: true,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              try {
                await DioClient().dio.post('/admin/sales-team', data: {
                  'name': nameController.text.trim(),
                  'email': emailController.text.trim(),
                  'phone': phoneController.text.trim(),
                  'password': passwordController.text.trim(),
                });
                if (context.mounted) Navigator.pop(context);
                _fetchSalesTeam();
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to add: $e')),
                  );
                }
              }
            },
            child: const Text('Add Member'),
          ),
        ],
      ),
    );
  }
}
