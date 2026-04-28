import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_constants.dart';

class InventoryRepository {
  final _dio = DistributorDioClient().dio;

  Future<List<dynamic>> getInventory() async {
    final response = await _dio.get(DistributorApiConstants.inventory);
    return response.data['data'];
  }

  Future<void> updateStock(String inventoryId, int quantity, String type) async {
    await _dio.patch('${DistributorApiConstants.inventory}/$inventoryId', data: {
      'quantity': quantity,
      'type': type,
    });
  }
}
