import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/providers/service_providers.dart';

class NotificationState {
  final bool isLoading;
  final String? error;
  final bool success;

  NotificationState({
    this.isLoading = false,
    this.error,
    this.success = false,
  });

  NotificationState copyWith({
    bool? isLoading,
    String? error,
    bool? success,
  }) {
    return NotificationState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      success: success ?? this.success,
    );
  }
}

final notificationProvider = NotifierProvider<NotificationNotifier, NotificationState>(() {
  return NotificationNotifier();
});

class NotificationNotifier extends Notifier<NotificationState> {
  @override
  NotificationState build() {
    return NotificationState();
  }

  Future<void> broadcastNotification(String title, String message, List<String> targetRoles) async {
    state = state.copyWith(isLoading: true, error: null, success: false);
    try {
      await ref.read(notificationServiceProvider).broadcastNotification(title, message, targetRoles);
      state = state.copyWith(isLoading: false, success: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString(), success: false);
    }
  }
}
