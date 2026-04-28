import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/inventory_repository.dart';

class InventoryState {
  final bool isLoading;
  final String? error;
  final List<dynamic> items;

  InventoryState({this.isLoading = false, this.error, this.items = const []});

  InventoryState copyWith({bool? isLoading, String? error, List<dynamic>? items}) {
    return InventoryState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      items: items ?? this.items,
    );
  }
}

class InventoryNotifier extends StateNotifier<InventoryState> {
  final InventoryRepository _repository;

  InventoryNotifier(this._repository) : super(InventoryState()) {
    fetchInventory();
  }

  Future<void> fetchInventory() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final items = await _repository.getInventory();
      state = state.copyWith(isLoading: false, items: items);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> updateStock(String id, int quantity, String type) async {
    try {
      await _repository.updateStock(id, quantity, type);
      await fetchInventory(); // Refresh list
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final inventoryRepositoryProvider = Provider((ref) => InventoryRepository());
final inventoryProvider = StateNotifierProvider<InventoryNotifier, InventoryState>((ref) {
  return InventoryNotifier(ref.watch(inventoryRepositoryProvider));
});
