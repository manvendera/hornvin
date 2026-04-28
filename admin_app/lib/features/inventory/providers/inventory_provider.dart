import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/providers/service_providers.dart';
import 'package:hornvin_admin/models/product_model.dart';

class InventoryState {
  final bool isLoading;
  final String? error;
  final List<ProductModel> inventory;

  InventoryState({
    this.isLoading = false,
    this.error,
    this.inventory = const [],
  });

  InventoryState copyWith({
    bool? isLoading,
    String? error,
    List<ProductModel>? inventory,
  }) {
    return InventoryState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      inventory: inventory ?? this.inventory,
    );
  }
}

final inventoryProvider = NotifierProvider<InventoryNotifier, InventoryState>(() {
  return InventoryNotifier();
});

class InventoryNotifier extends Notifier<InventoryState> {
  @override
  InventoryState build() {
    Future.microtask(() => _fetchInventory());
    return InventoryState(isLoading: true);
  }

  Future<void> _fetchInventory() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final inventory = await ref.read(inventoryServiceProvider).getInventory();
      state = state.copyWith(isLoading: false, inventory: inventory);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> allocateStock(String productId, String distributorId, int quantity) async {
    try {
      await ref.read(inventoryServiceProvider).allocateStock(productId, distributorId, quantity);
      await _fetchInventory();
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
}
