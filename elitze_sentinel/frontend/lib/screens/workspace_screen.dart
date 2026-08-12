import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../services/api_service.dart';

class WorkspaceScreen extends StatefulWidget {
  const WorkspaceScreen({super.key});

  @override
  State<WorkspaceScreen> createState() => _WorkspaceScreenState();
}

class _WorkspaceScreenState extends State<WorkspaceScreen> {
  final _api = ApiService();
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  List<Map<String, dynamic>> _workspaces = [];
  String? _activeId;

  @override
  void initState() {
    super.initState();
    _loadWorkspaces();
  }

  Future<void> _loadWorkspaces() async {
    final ws = await _api.getWorkspaces();
    setState(() {
      _workspaces = ws;
      _activeId = ws.where((w) => w['active'] == true).firstOrNull?['id'];
    });
  }

  void _createWorkspace() {
    if (_nameController.text.trim().isEmpty) return;
    setState(() {
      _workspaces.add({
        'id': 'ws_${DateTime.now().millisecondsSinceEpoch}',
        'name': _nameController.text.trim(),
        'description': _descController.text.trim().isEmpty ? 'New workspace' : _descController.text.trim(),
        'members': 1,
        'plugins': 0,
        'agents': 0,
        'active': false,
      });
      _nameController.clear();
      _descController.clear();
    });
  }

  void _switchWorkspace(String id) {
    setState(() {
      for (final ws in _workspaces) {
        ws['active'] = ws['id'] == id;
      }
      _activeId = id;
    });
  }

  static const List<Map<String, String>> _memberRoles = [
    {'name': 'Aeliana Voss', 'role': 'Owner'},
    {'name': 'Kael Morwen', 'role': 'Admin'},
    {'name': 'Lyra Halcyon', 'role': 'Member'},
    {'name': 'Orin dusk', 'role': 'Viewer'},
    {'name': 'Sera Finch', 'role': 'Member'},
  ];

  Color _roleColor(String role) {
    switch (role) {
      case 'Owner': return Colors.amber;
      case 'Admin': return AppTheme.neonCyan;
      case 'Member': return AppTheme.neonGreen;
      case 'Viewer': return AppTheme.greyText;
      default: return AppTheme.greyText;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Workspaces')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(hintText: 'Workspace name...', labelText: 'Name'),
                        style: const TextStyle(color: AppTheme.whiteText),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: _createWorkspace,
                      child: const Text('Create'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _descController,
                  decoration: const InputDecoration(hintText: 'Description (optional)...', labelText: 'Description'),
                  style: const TextStyle(color: AppTheme.whiteText),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _workspaces.length,
              itemBuilder: (context, index) {
                final ws = _workspaces[index];
                final active = ws['id'] == _activeId;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: AppTheme.darkCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: active ? AppTheme.neonCyan : Colors.white12,
                      width: active ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ListTile(
                        title: Row(
                          children: [
                            Text(ws['name'], style: const TextStyle(color: AppTheme.whiteText, fontWeight: FontWeight.bold)),
                            if (active) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.neonCyan.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text('ACTIVE', style: TextStyle(color: AppTheme.neonCyan, fontSize: 9)),
                              ),
                            ],
                          ],
                        ),
                        subtitle: Text(ws['description'], style: const TextStyle(color: AppTheme.greyText)),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (!active)
                              ElevatedButton(
                                onPressed: () => _switchWorkspace(ws['id']),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                ),
                                child: const Text('Switch', style: TextStyle(fontSize: 12)),
                              ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          children: [
                            _statBadge(Icons.people, '${ws['members']} members'),
                            const SizedBox(width: 12),
                            _statBadge(Icons.extension, '${ws['plugins']} plugins'),
                            const SizedBox(width: 12),
                            _statBadge(Icons.smart_toy, '${ws['agents']} agents'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text('Members', style: const TextStyle(color: AppTheme.whiteText, fontWeight: FontWeight.w600, fontSize: 13)),
                      ),
                      const SizedBox(height: 4),
                      ...List.generate(_memberRoles.length, (i) {
                        final m = _memberRoles[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 2, left: 16, right: 16),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.03),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.person, color: AppTheme.greyText, size: 16),
                              const SizedBox(width: 6),
                              Text(m['name']!, style: const TextStyle(color: AppTheme.whiteText, fontSize: 13)),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _roleColor(m['role']!).withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(m['role']!, style: TextStyle(color: _roleColor(m['role']!), fontSize: 10)),
                              ),
                            ],
                          ),
                        );
                      }),
                      const SizedBox(height: 12),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _statBadge(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppTheme.neonCyan, size: 14),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: AppTheme.greyText, fontSize: 12)),
      ],
    );
  }
}
