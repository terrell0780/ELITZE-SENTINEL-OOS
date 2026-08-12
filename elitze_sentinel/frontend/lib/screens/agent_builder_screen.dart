import 'package:flutter/material.dart';
import 'dart:convert';
import '../core/theme.dart';
import '../services/api_service.dart';

class AgentBuilderScreen extends StatefulWidget {
  const AgentBuilderScreen({super.key});

  @override
  State<AgentBuilderScreen> createState() => _AgentBuilderScreenState();
}

class _AgentBuilderScreenState extends State<AgentBuilderScreen> {
  final _api = ApiService();
  final _nameController = TextEditingController();
  List<Map<String, dynamic>> _agents = [];
  String? _selectedAgentId;
  String? _expandedAgentId;
  String _newBlockType = 'fusion';
  bool _loading = false;

  final Map<String, Color> _blockColors = {
    'fusion': AppTheme.neonCyan,
    'plugin': AppTheme.neonPurple,
    'logic': Colors.amber,
    'output': Colors.green,
  };

  final List<Map<String, dynamic>> _availableBlockTypes = [
    {'type': 'fusion', 'label': 'Fusion Block'},
    {'type': 'plugin', 'label': 'Plugin Block'},
    {'type': 'logic', 'label': 'Logic Block'},
    {'type': 'output', 'label': 'Output Block'},
  ];

  @override
  void initState() {
    super.initState();
    _loadAgents();
  }

  Future<void> _loadAgents() async {
    final agents = await _api.getAgents();
    setState(() => _agents = agents);
  }

  Future<void> _createAgent() async {
    if (_nameController.text.trim().isEmpty) return;
    setState(() => _loading = true);
    final res = await _api.createAgent({'name': _nameController.text.trim()});
    setState(() {
      _agents.add(res);
      _loading = false;
    });
    _nameController.clear();
  }

  void _addBlock(String agentId) {
    setState(() {
      final idx = _agents.indexWhere((a) => a['id'] == agentId);
      if (idx >= 0) {
        final blocks = List<String>.from(_agents[idx]['blocks'] ?? []);
        blocks.add(_newBlockType);
        _agents[idx]['blocks'] = blocks;
      }
    });
  }

  Future<void> _runAgent(String id) async {
    setState(() => _loading = true);
    await _api.runAgent(id);
    setState(() => _loading = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Agent $id executed'), backgroundColor: AppTheme.neonGreen),
    );
  }

  String _exportJson(String id) {
    final agent = _agents.firstWhere((a) => a['id'] == id, orElse: () => {});
    const encoder = JsonEncoder.withIndent('  ');
    return encoder.convert(agent);
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Agent Builder Studio')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(hintText: 'Agent name...'),
                    style: const TextStyle(color: AppTheme.whiteText),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _loading ? null : _createAgent,
                  child: const Text('Create'),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _agents.length,
              itemBuilder: (context, index) {
                final agent = _agents[index];
                final expanded = agent['id'] == _expandedAgentId;
                final selected = agent['id'] == _selectedAgentId;
                final blocks = List<String>.from(agent['blocks'] ?? []);
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: AppTheme.darkCard,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: selected ? AppTheme.neonCyan : Colors.white12,
                      width: selected ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        title: Text(agent['name'], style: const TextStyle(color: AppTheme.whiteText, fontWeight: FontWeight.bold)),
                        subtitle: Text('${blocks.length} blocks | ${agent['status'] ?? 'idle'}', style: const TextStyle(color: AppTheme.greyText)),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (selected) ...[
                              IconButton(
                                icon: const Icon(Icons.play_arrow, color: AppTheme.neonGreen),
                                onPressed: () => _runAgent(agent['id']),
                              ),
                              IconButton(
                                icon: const Icon(Icons.download, color: AppTheme.neonCyan),
                                onPressed: () => _exportJson(agent['id']),
                              ),
                            ],
                            Icon(
                              expanded ? Icons.expand_less : Icons.expand_more,
                              color: AppTheme.greyText,
                            ),
                          ],
                        ),
                        onTap: () => setState(() {
                          _selectedAgentId = agent['id'];
                          _expandedAgentId = expanded ? null : agent['id'];
                        }),
                      ),
                      if (expanded) ...[
                        const Divider(height: 1),
                        Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (blocks.isEmpty)
                                const Text('No blocks added', style: TextStyle(color: AppTheme.greyText)),
                              ...blocks.asMap().entries.map((entry) {
                                final type = entry.value;
                                final color = _blockColors[type] ?? Colors.white;
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 6),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: color.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: color.withOpacity(0.4)),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(Icons.drag_indicator, color: color, size: 18),
                                      const SizedBox(width: 8),
                                      Text('Block ${entry.key + 1}', style: TextStyle(color: color, fontWeight: FontWeight.w600)),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: color.withOpacity(0.3),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(type.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 10)),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  DropdownButton<String>(
                                    value: _newBlockType,
                                    dropdownColor: AppTheme.darkCard,
                                    style: const TextStyle(color: AppTheme.whiteText, fontSize: 13),
                                    underline: const SizedBox(),
                                    items: _availableBlockTypes.map((b) => DropdownMenuItem(
                                      value: b['type'],
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 10, height: 10,
                                            decoration: BoxDecoration(
                                              color: _blockColors[b['type']] ?? Colors.white,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          Text(b['label']),
                                        ],
                                      ),
                                    )).toList(),
                                    onChanged: (v) => setState(() => _newBlockType = v!),
                                  ),
                                  const SizedBox(width: 10),
                                  ElevatedButton.icon(
                                    onPressed: () => _addBlock(agent['id']),
                                    icon: const Icon(Icons.add, size: 16),
                                    label: const Text('Add Block'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.neonPurple,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        if (_selectedAgentId == agent['id']) ...[
                          const Divider(height: 1),
                          Container(
                            padding: const EdgeInsets.all(12),
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: AppTheme.midnightBlue,
                              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(10)),
                            ),
                            child: SelectableText(
                              _exportJson(agent['id']),
                              style: const TextStyle(color: AppTheme.neonCyan, fontSize: 11, fontFamily: 'monospace'),
                            ),
                          ),
                        ],
                      ],
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
}
