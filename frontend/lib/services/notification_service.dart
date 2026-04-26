import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../core/constants/api_constants.dart';

class NotificationService {
  final Dio _dio = DioClient().dio;

  Future<void> broadcastNotification(String title, String message, List<String> targetRoles) async {
    await _dio.post(ApiConstants.adminNotificationsBroadcast, data: {
      'title': title,
      'message': message,
      'targetRoles': targetRoles,
    });
  }
}
