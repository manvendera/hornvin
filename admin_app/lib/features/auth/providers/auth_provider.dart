import 'package:dio/dio.dart';
import 'package:hornvin_admin/core/network/dio_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/providers/service_providers.dart';

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

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? role,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final authService = ref.read(authServiceProvider);
      await authService.register({
        'name': name,
        'email': email,
        'password': password,
        'role': role ?? 'customer',
      });
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      String errorMessage = 'Registration failed';
      if (e is DioException) {
        errorMessage = e.response?.data['message']?.toString() ?? 'Connection error';
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    }
  }

  Future<bool> sendPhoneOTP(String phoneNumber, String role) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final authService = ref.read(authServiceProvider);
      await authService.sendOtp(phoneNumber, role);
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      String errorMessage = 'Failed to send OTP';
      if (e is DioException) {
        errorMessage = e.response?.data['message']?.toString() ?? 'Connection error';
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    }
  }

  Future<bool> registerWithOtp({
    required String name,
    required String phoneNumber,
    required String password,
    required String otp,
    required String role,
    String? email,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final authService = ref.read(authServiceProvider);
      final responseData = await authService.registerWithOtp({
        'name': name,
        'phoneNumber': phoneNumber,
        'password': password,
        'otp': otp,
        'role': role,
        'email': email,
      });

      final token = responseData['token']?.toString();
      if (token != null) {
        await authService.saveToken(token);
        state = state.copyWith(isLoading: false, isAuthenticated: true);
        return true;
      }
      
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      String errorMessage = 'Registration failed';
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
