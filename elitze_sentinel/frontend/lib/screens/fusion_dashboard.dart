import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../services/api_service.dart';

class FusionDashboard extends StatefulWidget {
  const FusionDashboard({super.key});

  @override
  State<FusionDashboard> createState() => _FusionDashboardState();
}

class _FusionDashboardState extends State<FusionDashboard> {
  final _inputController = TextEditingController();
  final _api = ApiService();
  String _method = 'semantic';
  String _tier = 'stubbed';
  Map<String, dynamic>? _result;
  bool _loading = false;

  final List<String> _methods = ['semantic', 'token', 'structured'];
  final List<String> _tiers = ['stubbed', 'local', 'remote'];

  Future<void> _process() async {
    if (_inputController.text.trim().isEmpty) return;
    setState(() => _loading = true);
    final res = await _api.fusionProcess(
      _inputController.text.trim(),
      method: _method,
      tier: _tier,
    );
    setState(() {
      _result = res;
      _loading = false;
    });
  }

  Future<void> _quintuple() async {
    if (_inputController.text.trim().isEmpty) return;
    setState(() => _loading = true);
    final res = await _api.fusionQuintuple(
      _inputController.text.trim(),
      method: _method,
      tier: _tier,
    );
    setState(() {
      _result = res;
      _loading = false;
    });
  }

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fusion Core')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _inputController,
              decoration: const InputDecoration(
                hintText: 'Enter input for fusion...',
                labelText: 'Input',
              ),
              style: const TextStyle(color: AppTheme.whiteText),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _method,
                    dropdownColor: AppTheme.darkCard,
                    decoration: const InputDecoration(labelText: 'Method'),
                    items: _methods.map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
                    onChanged: (v) => setState(() => _method = v!),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _tier,
                    dropdownColor: AppTheme.darkCard,
                    decoration: const InputDecoration(labelText: 'Tier'),
                    items: _tiers.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                    onChanged: (v) => setState(() => _tier = v!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _loading ? null : _process,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.neonCyan,
                    ),
                    child: const Text('Process'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _loading ? null : _quintuple,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.neonPurple,
                    ),
                    child: const Text('Quintuple Fusion'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (_loading)
              const Center(
                child: CircularProgressIndicator(color: AppTheme.neonCyan),
              ),
            if (_result != null && !_loading) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.darkCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.neonCyan.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Result', style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 12),
                    _resultRow('Fusion ID', _result!['fusion_id']),
                    _resultRow('Timestamp', _result!['timestamp']),
                    _resultRow('Output', _result!['final_output']),
                    _resultRow('Provenance', _result!['provenance_hash']),
                    if (_result!['quintuple'] == true) ...[
                      const SizedBox(height: 8),
                      Text('FABLE Perspectives', style: Theme.of(context).textTheme.labelLarge),
                      const SizedBox(height: 4),
                      ...(_result!['perspectives'] as Map<String, dynamic>).entries.map(
                        (e) => _resultRow(e.key, e.value),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _resultRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(color: AppTheme.neonCyan, fontSize: 13)),
          ),
          Expanded(
            child: Text('$value', style: const TextStyle(color: AppTheme.whiteText, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}
