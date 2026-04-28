import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_constants.dart';

class OrderRepository {
  final _dio = DistributorDioClient().dio;

  Future<List<dynamic>> getOrders() async {
    final response = await _dio.get(DistributorApiConstants.orders);
    return response.data['data'];
  }

  Future<void> updateOrderStatus(String orderId, String status) async {
    await _dio.patch('${DistributorApiConstants.orders}/$orderId/status', data: {
      'status': status,
    });
  }
}
