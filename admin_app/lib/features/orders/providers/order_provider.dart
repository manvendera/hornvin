import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/providers/service_providers.dart';
import 'package:hornvin_admin/models/order_model.dart';

class OrderState {
  final bool isLoading;
  final String? error;
  final List<OrderModel> orders;

  OrderState({
    this.isLoading = false,
    this.error,
    this.orders = const [],
  });

  OrderState copyWith({
    bool? isLoading,
    String? error,
    List<OrderModel>? orders,
  }) {
    return OrderState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      orders: orders ?? this.orders,
    );
  }
}

final orderProvider = NotifierProvider<OrderNotifier, OrderState>(() {
  return OrderNotifier();
});

class OrderNotifier extends Notifier<OrderState> {
  @override
  OrderState build() {
    Future.microtask(() => _fetchOrders());
    return OrderState(isLoading: true);
  }

  Future<void> _fetchOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final orders = await ref.read(orderServiceProvider).getOrders();
      state = state.copyWith(isLoading: false, orders: orders);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> updateOrderStatus(String id, String status) async {
    try {
      await ref.read(orderServiceProvider).updateOrderStatus(id, status);
      await _fetchOrders();
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
}
