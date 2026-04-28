import 'package:flutter_test/flutter_test.dart';
import 'package:hornvin_admin/admin/main_admin.dart';

void main() {
  testWidgets('Admin App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const HornvinAdminApp());
  });
}
