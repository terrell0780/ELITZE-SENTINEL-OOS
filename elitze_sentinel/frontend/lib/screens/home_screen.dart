import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../routing/app_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const List<Map<String, dynamic>> _features = [
    {'title': 'Fusion Dashboard', 'icon': Icons.dashboard, 'desc': 'Advanced fusion processing with FABLE governance', 'route': AppRouter.fusion},
    {'title': 'Voice Agent', 'icon': Icons.mic, 'desc': 'Multi-persona voice interface with VoxMorph FX', 'route': AppRouter.voice},
    {'title': 'Agent Builder', 'icon': Icons.widgets, 'desc': 'Build and deploy autonomous agents', 'route': AppRouter.agents},
    {'title': 'Marketplace', 'icon': Icons.store, 'desc': 'Plugin marketplace with OPAL permissions', 'route': AppRouter.marketplace},
    {'title': 'Workspaces', 'icon': Icons.workspaces, 'desc': 'Collaborative workspaces with role management', 'route': AppRouter.workspaces},
    {'title': 'Governance', 'icon': Icons.security, 'desc': 'FABLE governance protocol oversight', 'route': AppRouter.fusion},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [AppTheme.neonCyan, AppTheme.neonPurple],
          ).createShader(bounds),
          child: const Text(
            'ELITZE SENTINAL',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22),
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.85,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: _features.length,
                itemBuilder: (context, index) => _FeatureCard(data: _features[index]),
              ),
            ),
            Container(
              margin: const EdgeInsets.only(top: 8, bottom: 16),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.neonGreen.withOpacity(0.5), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, color: AppTheme.neonGreen, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'FABLE Governance Active',
                    style: TextStyle(color: AppTheme.neonGreen, fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final Map<String, dynamic> data;
  const _FeatureCard({required this.data});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, data['route'] as String),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.darkCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.neonCyan.withOpacity(0.2), width: 1),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(data['icon'] as IconData, color: AppTheme.neonCyan, size: 32),
            const SizedBox(height: 12),
            Text(
              data['title'] as String,
              style: const TextStyle(
                color: AppTheme.whiteText,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              data['desc'] as String,
              style: const TextStyle(color: AppTheme.greyText, fontSize: 12),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
