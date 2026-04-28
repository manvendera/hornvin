import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DistributorDioClient {
  static final DistributorDioClient _instance = DistributorDioClient._internal();
  factory DistributorDioClient() => _instance;

  late Dio dio;
  final _storage = const FlutterSecureStorage();

  DistributorDioClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: 'http://localhost:5000/api', // Update with actual backend URL
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'distributor_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            // Auto logout on 401
            await _storage.delete(key: 'distributor_token');
            // In a real app, you'd trigger a global state change to redirect to login
          }
          return handler.next(e);
        },
      ),
    );
  }
}
