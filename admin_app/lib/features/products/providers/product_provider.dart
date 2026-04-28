import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/providers/service_providers.dart';
import 'package:hornvin_admin/models/product_model.dart';
import 'dart:async';

class ProductState {
  final bool isLoading;
  final String? error;
  final List<ProductModel> products;

  ProductState({
    this.isLoading = false,
    this.error,
    this.products = const [],
  });

  ProductState copyWith({
    bool? isLoading,
    String? error,
    List<ProductModel>? products,
  }) {
    return ProductState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      products: products ?? this.products,
    );
  }
}

final productProvider = NotifierProvider<ProductNotifier, ProductState>(() {
  return ProductNotifier();
});

class ProductNotifier extends Notifier<ProductState> {
  @override
  ProductState build() {
    // Use Future.microtask to avoid "uninitialized provider" error
    Future.microtask(() => _fetchProducts());
    return ProductState(isLoading: true);
  }

  Future<void> _fetchProducts() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final products = await ref.read(productServiceProvider).getProducts();
      state = state.copyWith(isLoading: false, products: products);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addProduct(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await ref.read(productServiceProvider).addProduct(data);
      await _fetchProducts();
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> deleteProduct(String id) async {
    try {
      await ref.read(productServiceProvider).deleteProduct(id);
      await _fetchProducts();
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
}
