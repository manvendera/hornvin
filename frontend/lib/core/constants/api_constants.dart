class ApiConstants {
  // Use 10.0.2.2 for Android emulator, 127.0.0.1 or localhost for web/desktop
  static const String baseUrl = 'http://127.0.0.1:5000/api';
  
  static const String adminLogin = '/admin/login';
  static const String adminProfile = '/admin/profile';
  static const String adminDashboard = '/admin/dashboard';
  static const String adminProducts = '/admin/products';
  static const String adminProductsBulkUpload = '/admin/products/bulk-upload';
  static const String adminInventory = '/admin/inventory';
  static const String adminInventoryAllocate = '/admin/inventory/allocate';
  static const String adminDistributors = '/admin/distributors';
  static const String adminGarages = '/admin/garages';
  static const String adminCustomers = '/admin/customers';
  static const String adminOrders = '/admin/orders';
  static const String adminOrdersUpdateStatus = '/admin/orders/update-status';
  static const String adminReportsSales = '/admin/reports/sales';
  static const String adminReportsGst = '/admin/reports/gst';
  static const String adminNotificationsBroadcast = '/admin/notifications/broadcast';
}
