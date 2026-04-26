import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../core/constants/api_constants.dart';
import '../models/user_model.dart';

class UserService {
  final Dio _dio = DioClient().dio;

  Future<List<UserModel>> getDistributors() async {
    final response = await _dio.get(ApiConstants.adminDistributors);
    final data = response.data['data'] as List;
    return data.map((e) => UserModel.fromJson(e)).toList();
  }

  Future<List<UserModel>> getGarages() async {
    final response = await _dio.get(ApiConstants.adminGarages);
    final data = response.data['data'] as List;
    return data.map((e) => UserModel.fromJson(e)).toList();
  }

  Future<List<UserModel>> getCustomers() async {
    final response = await _dio.get(ApiConstants.adminCustomers);
    final data = response.data['data'] as List;
    return data.map((e) => UserModel.fromJson(e)).toList();
  }
}
