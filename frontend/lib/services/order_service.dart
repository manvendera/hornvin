import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../core/constants/api_constants.dart';
import '../models/order_model.dart';

class OrderService {
  final Dio _dio = DioClient().dio;

  Future<List<OrderModel>> getOrders({int page = 1, int limit = 10, String status = ''}) async {
    final response = await _dio.get(ApiConstants.adminOrders, queryParameters: {
      'page': page,
      'limit': limit,
      'status': status,
    });
    final data = response.data['data']['orders'] as List;
    return data.map((e) => OrderModel.fromJson(e)).toList();
  }

  Future<void> updateOrderStatus(String id, String status) async {
    await _dio.put('${ApiConstants.adminOrdersUpdateStatus}/$id', data: {
      'status': status,
    });
  }
}
