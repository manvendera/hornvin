import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/features/profile/data/services/profile_service.dart';
import 'package:hornvin_admin/features/profile/domain/models/admin_profile_model.dart';
import 'package:hornvin_admin/features/auth/providers/auth_provider.dart';

final profileProvider = AsyncNotifierProvider<ProfileNotifier, AdminProfile>(() {
  return ProfileNotifier();
});

class ProfileNotifier extends AsyncNotifier<AdminProfile> {
  @override
  FutureOr<AdminProfile> build() async {
    return _fetchProfile();
  }

  Future<AdminProfile> _fetchProfile() async {
    return ref.read(profileServiceProvider).getProfile();
  }

  Future<void> updateProfile({
    required String name,
    required String phoneNumber,
    required String email,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final updatedProfile = await ref.read(profileServiceProvider).updateProfile({
        'name': name,
        'phoneNumber': phoneNumber,
        'email': email,
      });
      return updatedProfile;
    });
  }

  Future<void> uploadImage(List<int> bytes, String fileName) async {
    // Optimistic UI update could be done here, but let's wait for API
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final imageUrl = await ref.read(profileServiceProvider).uploadProfileImage(bytes, fileName);
      // Re-fetch profile to get updated avatar URL or update locally
      final currentProfile = state.value;
      if (currentProfile != null) {
        return currentProfile.copyWith(avatar: imageUrl);
      }
      return _fetchProfile();
    });
  }

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await ref.read(profileServiceProvider).changePassword(
            currentPassword: currentPassword,
            newPassword: newPassword,
          );
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ref.read(profileServiceProvider).logout();
    } finally {
      // Always trigger auth state change to logged out
      ref.read(authProvider.notifier).logout();
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchProfile());
  }
}
