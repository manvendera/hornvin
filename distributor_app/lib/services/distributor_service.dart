import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../core/constants/api_constants.dart';
import '../models/distributor_models.dart';
import '../models/order_model.dart';

class DistributorService {
  final _dio = DistributorDioClient().dio;

  // Inventory
  Future<List<ProductModel>> getInventory() async {
    try {
      final response = await _dio.get(DistributorDistributorApiConstants.inventory);
      if (response.statusCode == 200) {
        final List data = response.data['data'];
        return data.map((item) => ProductModel.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  // Orders
  Future<List<OrderModel>> getOrders() async {
    try {
      final response = await _dio.get(DistributorDistributorApiConstants.orders);
      if (response.statusCode == 200) {
        final List data = response.data['data'];
        return data.map((item) => OrderModel.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> updateOrderStatus(String orderId, String status) async {
    try {
      final response = await _dio.patch(
        '${DistributorDistributorApiConstants.updateOrderStatus}$orderId/status',
        data: {'status': status},
      );
      return response.statusCode == 200;
    } catch (e) {
      rethrow;
    }
  }

  // Dashboard
  Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _dio.get(DistributorDistributorApiConstants.dashboard);
      if (response.statusCode == 200) {
        return response.data['data'];
      }
      return {};
    } catch (e) {
      rethrow;
    }
  }
}
