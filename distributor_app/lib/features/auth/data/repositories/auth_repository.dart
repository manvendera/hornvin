import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_constants.dart';

class AuthRepository {
  final _dio = DistributorDioClient().dio;

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final response = await _dio.post(DistributorApiConstants.register, data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post(DistributorApiConstants.login, data: {
      'email': email,
      'password': password,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> verifyOtp(String phoneNumber, String otp) async {
    final response = await _dio.post(DistributorApiConstants.verifyOtp, data: {
      'phoneNumber': phoneNumber,
      'otp': otp,
    });
    return response.data;
  }
}
