class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String status;
  final String? phone;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.phone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      status: json['isActive'] == false ? 'Inactive' : (json['approvalStatus'] ?? 'Active'),
      phone: json['phone'] ?? json['phoneNumber'],
    );
  }
}
