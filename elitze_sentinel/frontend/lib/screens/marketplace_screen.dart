import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../services/api_service.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  final _api = ApiService();
  List<Map<String, dynamic>> _plugins = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadPlugins();
  }

  Future<void> _loadPlugins() async {
    setState(() => _loading = true);
    final plugins = await _api.getPlugins();
    setState(() {
      _plugins = plugins;
      _loading = false;
    });
  }

  Future<void> _installPlugin(String id) async {
    final res = await _api.installPlugin(id);
    setState(() {
      final idx = _plugins.indexWhere((p) => p['id'] == id);
      if (idx >= 0) _plugins[idx]['status'] = 'installed';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(res['message']), backgroundColor: AppTheme.neonGreen),
    );
  }

  void _uninstallPlugin(String id) {
    setState(() {
      final idx = _plugins.indexWhere((p) => p['id'] == id);
      if (idx >= 0) _plugins[idx]['status'] = 'available';
    });
  }

  Color _permissionColor(String perm) {
    switch (perm) {
      case 'read': return AppTheme.neonCyan;
      case 'write': return Colors.amber;
      case 'execute': return AppTheme.neonGreen;
      case 'admin': return Colors.redAccent;
      default: return AppTheme.greyText;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Plugin Marketplace')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.neonCyan))
          : RefreshIndicator(
              onRefresh: _loadPlugins,
              child: GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.7,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: _plugins.length,
                itemBuilder: (context, index) {
                  final plugin = _plugins[index];
                  final installed = plugin['status'] == 'installed';
                  final perms = List<String>.from(plugin['permissions'] ?? []);
                  return GestureDetector(
                    onTap: () => _showDetail(context, plugin),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.darkCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: installed ? AppTheme.neonCyan.withOpacity(0.4) : Colors.white12,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(plugin['name'], style: const TextStyle(color: AppTheme.whiteText, fontWeight: FontWeight.bold, fontSize: 14)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: installed ? AppTheme.neonGreen.withOpacity(0.2) : AppTheme.greyText.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  installed ? 'Installed' : 'Available',
                                  style: TextStyle(
                                    color: installed ? AppTheme.neonGreen : AppTheme.greyText,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text('v${plugin['version']}', style: const TextStyle(color: AppTheme.neonCyan, fontSize: 11)),
                          const SizedBox(height: 6),
                          Text(plugin['description'], style: const TextStyle(color: AppTheme.greyText, fontSize: 11), maxLines: 2),
                          const SizedBox(height: 4),
                          Text('by ${plugin['author']}', style: const TextStyle(color: AppTheme.greyText, fontSize: 10)),
                          const Spacer(),
                          Wrap(
                            spacing: 4,
                            runSpacing: 4,
                            children: perms.map((p) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              decoration: BoxDecoration(
                                color: _permissionColor(p).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(3),
                              ),
                              child: Text(p, style: TextStyle(color: _permissionColor(p), fontSize: 9)),
                            )).toList(),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              if (installed)
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: () => _uninstallPlugin(plugin['id']),
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(color: Colors.redAccent),
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                    ),
                                    child: const Text('Uninstall', style: TextStyle(fontSize: 11)),
                                  ),
                                )
                              else
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: () => _installPlugin(plugin['id']),
                                    style: ElevatedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                    ),
                                    child: const Text('Install', style: TextStyle(fontSize: 11)),
                                  ),
                                ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () {},
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 4),
                                  ),
                                  child: const Text('Execute', style: TextStyle(fontSize: 11)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }

  void _showDetail(BuildContext context, Map<String, dynamic> plugin) {
    final perms = List<String>.from(plugin['permissions'] ?? []);
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.darkCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(plugin['name'], style: const TextStyle(color: AppTheme.whiteText, fontWeight: FontWeight.bold, fontSize: 20)),
            const SizedBox(height: 4),
            Text('v${plugin['version']} by ${plugin['author']}', style: const TextStyle(color: AppTheme.neonCyan)),
            const SizedBox(height: 12),
            Text(plugin['description'], style: const TextStyle(color: AppTheme.greyText)),
            const SizedBox(height: 12),
            Text('OPAL Permissions', style: const TextStyle(color: AppTheme.whiteText, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              children: perms.map((p) => Chip(
                label: Text(p, style: TextStyle(color: _permissionColor(p), fontSize: 12)),
                backgroundColor: _permissionColor(p).withOpacity(0.15),
                side: BorderSide(color: _permissionColor(p).withOpacity(0.3)),
              )).toList(),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                if (plugin['status'] != 'installed')
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () { _installPlugin(plugin['id']); Navigator.pop(context); },
                      child: const Text('Install'),
                    ),
                  )
                else
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () { _uninstallPlugin(plugin['id']); Navigator.pop(context); },
                      style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.redAccent)),
                      child: const Text('Uninstall'),
                    ),
                  ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
