import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'core/init_service.dart';
import 'routing/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await InitService.initialize();
  runApp(const ElitzeSentinalApp());
}

class ElitzeSentinalApp extends StatelessWidget {
  const ElitzeSentinalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Elitze Sentinal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: AppRouter.home,
      onGenerateRoute: AppRouter.generateRoute,
    );
  }
}
