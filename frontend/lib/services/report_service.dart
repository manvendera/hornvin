import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../core/constants/api_constants.dart';

class ReportService {
  final Dio _dio = DioClient().dio;

  Future<Map<String, dynamic>> getSalesReports(String period) async {
    final response = await _dio.get(ApiConstants.adminReportsSales, queryParameters: {
      'period': period,
    });
    return response.data['data'];
  }

  Future<List<dynamic>> getGstReports(String month) async {
    final response = await _dio.get(ApiConstants.adminReportsGst, queryParameters: {
      'month': month,
    });
    return response.data['data']['gstReports'] as List;
  }
}
