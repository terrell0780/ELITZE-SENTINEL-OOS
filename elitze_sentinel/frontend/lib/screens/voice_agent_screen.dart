import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../services/api_service.dart';

class VoiceAgentScreen extends StatefulWidget {
  const VoiceAgentScreen({super.key});

  @override
  State<VoiceAgentScreen> createState() => _VoiceAgentScreenState();
}

class _VoiceAgentScreenState extends State<VoiceAgentScreen> {
  final _api = ApiService();
  final _textController = TextEditingController();
  bool _wakeWord = false;
  String _voxMorph = 'None';
  String? _selectedPersonaId;
  List<Map<String, dynamic>> _personas = [];
  Map<String, dynamic>? _lastResponse;
  final List<Map<String, dynamic>> _history = [];
  bool _loading = false;

  final List<String> _voxOptions = ['None', 'Deep', 'Sharpen', 'Glow', 'Distort'];

  @override
  void initState() {
    super.initState();
    _loadPersonas();
  }

  Future<void> _loadPersonas() async {
    final p = await _api.getPersonas();
    setState(() => _personas = p);
    if (p.isNotEmpty) _selectedPersonaId = p[0]['id'];
  }

  Future<void> _speak() async {
    if (_textController.text.trim().isEmpty) return;
    setState(() => _loading = true);
    final res = await _api.processVoice(_textController.text.trim());
    final persona = _personas.firstWhere(
      (p) => p['id'] == _selectedPersonaId,
      orElse: () => {'name': 'Unknown', 'effect': 'None'},
    );
    final entry = {
      'input': _textController.text.trim(),
      'persona': persona['name'],
      'effect': persona['effect'],
      'vox': _voxMorph,
      'output': res['processed'],
      'timestamp': res['timestamp'],
    };
    setState(() {
      _history.insert(0, entry);
      _lastResponse = entry;
      _loading = false;
    });
    _textController.clear();
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Voice Agent')),
      body: Column(
        children: [
          Container(
            height: 130,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _personas.length,
              itemBuilder: (context, index) {
                final p = _personas[index];
                final selected = p['id'] == _selectedPersonaId;
                return GestureDetector(
                  onTap: () => setState(() => _selectedPersonaId = p['id']),
                  child: Container(
                    width: 120,
                    margin: const EdgeInsets.only(right: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.darkCard,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: selected ? AppTheme.neonCyan : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p['name'], style: const TextStyle(color: AppTheme.whiteText, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(p['description'], style: const TextStyle(color: AppTheme.greyText, fontSize: 10), maxLines: 2),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.neonPurple.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(p['effect'], style: const TextStyle(color: AppTheme.neonPurple, fontSize: 9)),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text('Wake Word', style: const TextStyle(color: AppTheme.whiteText)),
                const SizedBox(width: 8),
                Switch(
                  value: _wakeWord,
                  onChanged: (v) => setState(() => _wakeWord = v),
                  activeColor: AppTheme.neonCyan,
                ),
                const Spacer(),
                Text('VoxMorph: ', style: const TextStyle(color: AppTheme.greyText, fontSize: 13)),
                const SizedBox(width: 4),
                DropdownButton<String>(
                  value: _voxMorph,
                  dropdownColor: AppTheme.darkCard,
                  style: const TextStyle(color: AppTheme.whiteText, fontSize: 13),
                  underline: const SizedBox(),
                  items: _voxOptions.map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
                  onChanged: (v) => setState(() => _voxMorph = v!),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: const InputDecoration(hintText: 'Type to simulate speech...'),
                    style: const TextStyle(color: AppTheme.whiteText),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _loading ? null : _speak,
                  child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Speak'),
                ),
              ],
            ),
          ),
          if (_lastResponse != null) ...[
            const SizedBox(height: 12),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.neonPurple.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Icon(Icons.person, color: AppTheme.neonPurple, size: 18),
                    const SizedBox(width: 6),
                    Text(_lastResponse!['persona'], style: const TextStyle(color: AppTheme.neonPurple, fontWeight: FontWeight.bold)),
                    const Spacer(),
                    Text('Vox: ${_lastResponse!['vox']}', style: const TextStyle(color: AppTheme.neonCyan, fontSize: 12)),
                  ]),
                  const SizedBox(height: 8),
                  Text(_lastResponse!['output'], style: const TextStyle(color: AppTheme.whiteText)),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text('History (${_history.length})', style: Theme.of(context).textTheme.labelLarge),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _history.length,
              itemBuilder: (context, index) {
                final entry = _history[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.darkCard,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('You: ${entry['input']}', style: const TextStyle(color: AppTheme.greyText, fontSize: 12)),
                      const SizedBox(height: 4),
                      Text('${entry['persona']}: ${entry['output']}', style: const TextStyle(color: AppTheme.whiteText, fontSize: 12)),
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
