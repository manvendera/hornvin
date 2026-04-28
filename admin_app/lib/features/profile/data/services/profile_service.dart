import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/network/dio_client.dart';
import 'package:hornvin_admin/features/profile/domain/models/admin_profile_model.dart';

final profileServiceProvider = Provider((ref) {
  return ProfileService(DioClient().dio);
});

class ProfileService {
  final Dio _dio;

  ProfileService(this._dio);

  /// Fetch Admin Profile
  Future<AdminProfile> getProfile() async {
    try {
      final response = await _dio.get('/v1/auth/profile'); // Using the established auth route
      return AdminProfile.fromJson(response.data['data'] ?? response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Update Profile Info
  Future<AdminProfile> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/v1/auth/update-profile', data: data);
      return AdminProfile.fromJson(response.data['data'] ?? response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Update Profile Picture
  Future<String> uploadProfileImage(List<int> bytes, String fileName) async {
    try {
      FormData formData = FormData.fromMap({
        "image": MultipartFile.fromBytes(bytes, filename: fileName),
      });

      final response = await _dio.post('/v1/auth/upload-avatar', data: formData);
      return response.data['url']; // Expecting backend to return the URL
    } catch (e) {
      rethrow;
    }
  }

  /// Change Password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _dio.put('/v1/auth/change-password', data: {
        'oldPassword': currentPassword,
        'newPassword': newPassword,
      });
    } catch (e) {
      rethrow;
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _dio.post('/v1/auth/logout');
    } catch (e) {
      // Even if API fails, we proceed with local logout
      rethrow;
    }
  }
}
