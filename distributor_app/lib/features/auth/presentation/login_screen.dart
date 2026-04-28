import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';

class DistributorLoginScreen extends ConsumerStatefulWidget {
  const DistributorLoginScreen({super.key});

  @override
  ConsumerState<DistributorLoginScreen> createState() => _DistributorLoginScreenState();
}

class _DistributorLoginScreenState extends ConsumerState<DistributorLoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    ref.listen(authProvider, (previous, next) {
      if (next.isAuthenticated) {
        context.go('/');
      }
      // Note: We also show error in the UI now, so SnackBar is optional
    });

    return Scaffold(
      backgroundColor: DistributorTheme.lightGray,
      body: Center(
        child: SingleChildScrollView(
          child: Container(
            width: 400,
            margin: const EdgeInsets.symmetric(vertical: 40),
            padding: const EdgeInsets.all(40),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.local_shipping, size: 64, color: DistributorTheme.primaryRed),
                const SizedBox(height: 24),
                const Text(
                  'HORNVIN DISTRIBUTOR',
                  style: TextStyle(
                    fontSize: 24, 
                    fontWeight: FontWeight.bold, 
                    color: DistributorTheme.darkBlue
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Enter your phone to receive OTP', 
                  style: TextStyle(color: Colors.grey)
                ),
                if (authState.error != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Text(
                      authState.error!,
                      style: const TextStyle(color: Colors.red, fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
                const SizedBox(height: 32),
                TextField(
                  controller: _phoneController,
                  enabled: !_otpSent,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone),
                    hintText: '+91 XXXXX XXXXX',
                  ),
                  keyboardType: TextInputType.phone,
                ),
                if (_otpSent) ...[
                  const SizedBox(height: 16),
                  TextField(
                    controller: _otpController,
                    decoration: const InputDecoration(
                      labelText: 'Enter OTP',
                      prefixIcon: Icon(Icons.lock_outline),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ],
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: authState.isLoading
                        ? null
                        : () async {
                            if (!_otpSent) {
                              final success = await ref
                                  .read(authProvider.notifier)
                                  .sendOtp(_phoneController.text);
                              if (success) {
                                setState(() => _otpSent = true);
                              }
                            } else {
                              await ref
                                  .read(authProvider.notifier)
                                  .login(_phoneController.text, _otpController.text);
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DistributorTheme.primaryRed,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: authState.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2, 
                              color: Colors.white
                            ),
                          )
                        : Text(_otpSent ? 'VERIFY & LOGIN' : 'SEND OTP'),
                  ),
                ),
                if (_otpSent) ...[
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => setState(() {
                      _otpSent = false;
                      _otpController.clear();
                    }),
                    child: const Text('Change Phone Number'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
