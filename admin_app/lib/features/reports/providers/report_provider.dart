import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hornvin_admin/core/providers/service_providers.dart';

class ReportState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic> salesData;
  final List<dynamic> gstData;

  ReportState({
    this.isLoading = false,
    this.error,
    this.salesData = const {},
    this.gstData = const [],
  });

  ReportState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? salesData,
    List<dynamic>? gstData,
  }) {
    return ReportState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      salesData: salesData ?? this.salesData,
      gstData: gstData ?? this.gstData,
    );
  }
}

final reportProvider = NotifierProvider<ReportNotifier, ReportState>(() {
  return ReportNotifier();
});

class ReportNotifier extends Notifier<ReportState> {
  @override
  ReportState build() {
    fetchReports('monthly', '2023-10'); // Default values
    return ReportState();
  }

  Future<void> fetchReports(String period, String month) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final service = ref.read(reportServiceProvider);
      final results = await Future.wait([
        service.getSalesReports(period),
        service.getGstReports(month),
      ]);
      
      state = state.copyWith(
        isLoading: false,
        salesData: results[0] as Map<String, dynamic>,
        gstData: results[1] as List<dynamic>,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
