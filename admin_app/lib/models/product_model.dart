class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final String category;
  final List<String> imageUrls;
  final int stockCount;
  final String status;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.imageUrls,
    required this.stockCount,
    required this.status,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    // Handle case where product is nested under 'product' key
    final Map<String, dynamic> data = (json.containsKey('product') && json['product'] is Map)
        ? Map<String, dynamic>.from(json['product'])
        : json;

    return ProductModel(
      id: data['_id']?.toString() ?? '',
      name: data['name']?.toString() ?? '',
      description: data['description']?.toString() ?? '',
      price: (data['price'] ?? 0).toDouble(),
      category: data['category'] is Map 
          ? (data['category']['name']?.toString() ?? '') 
          : (data['category']?.toString() ?? ''),
      imageUrls: (data['images'] as List? ?? [])
          .map((img) {
            if (img is Map) return img['url']?.toString() ?? '';
            return img.toString();
          })
          .where((url) => url.isNotEmpty)
          .toList(),
      stockCount: data['stock'] is int ? data['stock'] : int.tryParse(data['stock']?.toString() ?? '0') ?? 0,
      status: data['status']?.toString() ?? 'Active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'price': price,
      'category': category,
      'status': status,
    };
  }
}
