import 'package:dio/dio.dart';
import 'package:hornvin_admin/core/network/dio_client.dart';
import 'package:hornvin_admin/core/constants/api_constants.dart';
import 'package:hornvin_admin/models/product_model.dart';

class ProductService {
  final Dio _dio = DioClient().dio;

  Future<List<ProductModel>> getProducts({int page = 1, int limit = 10, String search = ''}) async {
    try {
      final response = await _dio.get(ApiConstants.adminProducts, queryParameters: {
        'page': page,
        'limit': limit,
        'search': search,
      });
      final data = response.data['data']['products'] as List;
      return data.map((json) => ProductModel.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<ProductModel> addProduct(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(ApiConstants.adminProducts, data: data);
      final productData = response.data['data'];
      return ProductModel.fromJson(productData);
    } catch (e) {
      rethrow;
    }
  }

  Future<ProductModel> updateProduct(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('${ApiConstants.adminProducts}/$id', data: data);
      final productData = response.data['data'];
      return ProductModel.fromJson(productData);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteProduct(String id) async {
    try {
      await _dio.delete('${ApiConstants.adminProducts}/$id');
    } catch (e) {
      rethrow;
    }
  }

  Future<String> uploadImage(FormData formData) async {
    try {
      final response = await _dio.post(ApiConstants.adminUploadImage, data: formData);
      return response.data['data']['url'].toString();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> bulkUpload(FormData formData) async {
    try {
      await _dio.post(ApiConstants.adminProductsBulkUpload, data: formData);
    } catch (e) {
      rethrow;
    }
  }
}
