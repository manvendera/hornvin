class OrderModel {
  final String id;
  final String orderNumber;
  final String retailerName;
  final double totalAmount;
  final String status;
  final DateTime createdAt;
  final List<OrderItem>? items;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.retailerName,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] ?? json['_id'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      retailerName: json['retailerName'] ?? (json['customer'] != null ? json['customer']['name'] : 'Unknown'),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'Pending',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      items: (json['items'] as List?)?.map((i) => OrderItem.fromJson(i)).toList(),
    );
  }
}

class OrderItem {
  final String productId;
  final String productName;
  final int quantity;
  final double price;

  OrderItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId'] ?? '',
      productName: json['productName'] ?? '',
      quantity: json['quantity'] ?? 0,
      price: (json['price'] ?? 0).toDouble(),
    );
  }
}
