import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/network/dio_client.dart';
import '../core/constants/api_constants.dart';
import '../models/distributor_models.dart';

class AuthService {
  final _dio = DistributorDioClient().dio;
  final _storage = const FlutterSecureStorage();

  Future<UserModel?> login(String email, String password) async {
    try {
      final response = await _dio.post(
        DistributorDistributorApiConstants.login,
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = response.data['data'];
        final token = data['token'];
        final userData = data['user'];

        await _storage.write(key: 'distributor_token', value: token);
        return UserModel.fromJson(userData);
      }
      return null;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'distributor_token');
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'distributor_token');
    return token != null;
  }
}
