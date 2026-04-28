class AdminProfile {
  final String id;
  final String name;
  final String email;
  final String? phoneNumber;
  final String? avatar;
  final String role;
  final DateTime? createdAt;

  AdminProfile({
    required this.id,
    required this.name,
    required this.email,
    this.phoneNumber,
    this.avatar,
    required this.role,
    this.createdAt,
  });

  factory AdminProfile.fromJson(Map<String, dynamic> json) {
    // Backend returns user data inside a 'user' object or directly
    final data = json['user'] ?? json['data'] ?? json;
    return AdminProfile(
      id: data['_id'] ?? data['id'] ?? '',
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      phoneNumber: data['phoneNumber'],
      avatar: data['avatar'],
      role: data['role'] ?? 'admin',
      createdAt: data['createdAt'] != null ? DateTime.parse(data['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'phoneNumber': phoneNumber,
      'avatar': avatar,
      'role': role,
    };
  }

  AdminProfile copyWith({
    String? name,
    String? email,
    String? phoneNumber,
    String? avatar,
    String? role,
  }) {
    return AdminProfile(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      avatar: avatar ?? this.avatar,
      role: role ?? this.role,
      createdAt: createdAt,
    );
  }
}
