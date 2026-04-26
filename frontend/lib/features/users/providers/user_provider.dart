import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/service_providers.dart';
import '../../../models/user_model.dart';

class UserState {
  final bool isLoading;
  final String? error;
  final List<UserModel> distributors;
  final List<UserModel> garages;
  final List<UserModel> customers;

  UserState({
    this.isLoading = false,
    this.error,
    this.distributors = const [],
    this.garages = const [],
    this.customers = const [],
  });

  UserState copyWith({
    bool? isLoading,
    String? error,
    List<UserModel>? distributors,
    List<UserModel>? garages,
    List<UserModel>? customers,
  }) {
    return UserState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      distributors: distributors ?? this.distributors,
      garages: garages ?? this.garages,
      customers: customers ?? this.customers,
    );
  }
}

final userProvider = NotifierProvider<UserNotifier, UserState>(() {
  return UserNotifier();
});

class UserNotifier extends Notifier<UserState> {
  @override
  UserState build() {
    _fetchUsers();
    return UserState();
  }

  Future<void> _fetchUsers() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final service = ref.read(userServiceProvider);
      final results = await Future.wait([
        service.getDistributors(),
        service.getGarages(),
        service.getCustomers(),
      ]);
      
      state = state.copyWith(
        isLoading: false,
        distributors: results[0],
        garages: results[1],
        customers: results[2],
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
