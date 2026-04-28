class DeliveryModel {
  final String id;
  final String orderId;
  final String orderNumber;
  final String agentName;
  final String agentPhone;
  final String status; // Assigned, Picked, Delivered
  final DateTime? estimatedDelivery;

  DeliveryModel({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.agentName,
    required this.agentPhone,
    required this.status,
    this.estimatedDelivery,
  });

  factory DeliveryModel.fromJson(Map<String, dynamic> json) {
    return DeliveryModel(
      id: json['id'] ?? json['_id'] ?? '',
      orderId: json['orderId'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      agentName: json['agentName'] ?? 'Not Assigned',
      agentPhone: json['agentPhone'] ?? '',
      status: json['status'] ?? 'Pending',
      estimatedDelivery: json['estimatedDelivery'] != null ? DateTime.parse(json['estimatedDelivery']) : null,
    );
  }
}
