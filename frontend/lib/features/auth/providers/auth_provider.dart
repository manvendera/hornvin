import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/service_providers.dart';

class AuthState {
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  AuthState({this.isLoading = false, this.error, this.isAuthenticated = false});

  AuthState copyWith({bool? isLoading, String? error, bool? isAuthenticated}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    // Set global 401 handler
    DioClient.onUnauthorized = logout;
    _init();
    return AuthState();
  }

  Future<void> _init() async {
    final token = await ref.read(authServiceProvider).getToken();
    if (token != null) {
      state = state.copyWith(isAuthenticated: true);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final authService = ref.read(authServiceProvider);
      final responseData = await authService.login(email, password);
      
      final data = responseData['data'];
      final token = data != null ? data['token']?.toString() : null;
      
      if (token == null) {
        state = state.copyWith(isLoading: false, error: 'Server returned no token');
        return false;
      }

      await authService.saveToken(token);
      state = state.copyWith(isLoading: false, isAuthenticated: true);
      return true;
    } catch (e) {
      String errorMessage = 'Login failed';
      if (e is DioException) {
        errorMessage = e.response?.data['message']?.toString() ?? 'Connection error';
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    }
  }

  Future<void> logout() async {
    await ref.read(authServiceProvider).deleteToken();
    state = AuthState(isAuthenticated: false);
  }
}
