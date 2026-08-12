import 'package:flutter/material.dart';
import '../screens/home_screen.dart';
import '../screens/fusion_dashboard.dart';
import '../screens/voice_agent_screen.dart';
import '../screens/agent_builder_screen.dart';
import '../screens/marketplace_screen.dart';
import '../screens/workspace_screen.dart';

class AppRouter {
  static const String home = '/';
  static const String fusion = '/fusion';
  static const String voice = '/voice';
  static const String agents = '/agents';
  static const String marketplace = '/marketplace';
  static const String workspaces = '/workspaces';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case fusion:
        return MaterialPageRoute(builder: (_) => const FusionDashboard());
      case voice:
        return MaterialPageRoute(builder: (_) => const VoiceAgentScreen());
      case agents:
        return MaterialPageRoute(builder: (_) => const AgentBuilderScreen());
      case marketplace:
        return MaterialPageRoute(builder: (_) => const MarketplaceScreen());
      case workspaces:
        return MaterialPageRoute(builder: (_) => const WorkspaceScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => const Scaffold(
            body: Center(child: Text('Route not found')),
          ),
        );
    }
  }
}
