import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../core/constants/api_constants.dart';
import '../models/product_model.dart';

class InventoryService {
  final Dio _dio = DioClient().dio;

  Future<List<ProductModel>> getInventory({int page = 1, int limit = 20}) async {
    final response = await _dio.get(ApiConstants.adminInventory, queryParameters: {
      'page': page,
      'limit': limit,
    });
    final data = response.data['data']['inventory'] as List;
    return data.map((e) => ProductModel.fromJson(e)).toList();
  }

  Future<void> allocateStock(String productId, String distributorId, int quantity) async {
    await _dio.post(ApiConstants.adminInventoryAllocate, data: {
      'productId': productId,
      'distributorId': distributorId,
      'quantity': quantity,
    });
  }
}
