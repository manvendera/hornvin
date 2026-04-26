class OrderModel {
  final String id;
  final String customerId;
  final double totalAmount;
  final String status;
  final String createdAt;

  OrderModel({
    required this.id,
    required this.customerId,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['_id'] ?? '',
      customerId: json['customer'] ?? '',
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'Pending',
      createdAt: json['createdAt'] ?? '',
    );
  }
}
