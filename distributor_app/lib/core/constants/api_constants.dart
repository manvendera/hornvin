class DistributorApiConstants {
  static const String baseUrl = 'http://localhost:5000/api';
  
  static const String login = '/distributor/auth/login';
  static const String register = '/distributor/auth/register';
  static const String verifyOtp = '/distributor/auth/verify-otp';
  
  // Distributor Modules
  static const String dashboard = '/distributor/dashboard';
  static const String inventory = '/distributor/inventory';
  static const String orders = '/distributor/orders';
  static const String updateOrderStatus = '/distributor/orders/';
  static const String delivery = '/distributor/delivery';
  static const String payments = '/distributor/payments';
  static const String garages = '/distributor/garages';
  static const String notifications = '/distributor/notifications';
  static const String reports = '/distributor/reports';
  static const String returns = '/distributor/returns';
}
