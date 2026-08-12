import 'dart:convert';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final String baseUrl = "http://10.0.2.2:8000/api/v1";

  // Stub data helpers
  Map _stubFusion(String input, {String method = 'semantic', String tier = 'stubbed'}) {
    return {
      'fusion_id': 'fus_${DateTime.now().millisecondsSinceEpoch}',
      'timestamp': DateTime.now().toIso8601String(),
      'input': input,
      'method': method,
      'tier': tier,
      'final_output': 'Fused: $input [method=$method, tier=$tier]',
      'provenance_hash': '0x${input.hashCode.toRadixString(16).padLeft(64, '0')}',
      'status': 'completed',
    };
  }

  List<Map<String, dynamic>> _stubPlugins() {
    return [
      {
        'id': 'plg_001', 'name': 'Sentinel Analyzer', 'version': '2.1.0',
        'description': 'Real-time threat analysis and anomaly detection engine',
        'author': 'Elitze Core', 'status': 'installed',
        'permissions': ['read', 'write', 'execute'],
      },
      {
        'id': 'plg_002', 'name': 'Quantum Bridge', 'version': '0.9.3',
        'description': 'Quantum-resistant encryption tunnel for secure comms',
        'author': 'Cipher Labs', 'status': 'available',
        'permissions': ['read', 'execute'],
      },
      {
        'id': 'plg_003', 'name': 'Chronos Stream', 'version': '1.4.7',
        'description': 'Time-series data streaming and compression pipeline',
        'author': 'Temporal Dynamics', 'status': 'available',
        'permissions': ['read', 'write'],
      },
      {
        'id': 'plg_004', 'name': 'NeuroSync', 'version': '3.0.1',
        'description': 'Neural interface synchronization adapter',
        'author': 'NeuroCorp', 'status': 'installed',
        'permissions': ['read', 'write', 'execute', 'admin'],
      },
      {
        'id': 'plg_005', 'name': 'Aegis Shield', 'version': '1.2.0',
        'description': 'Adaptive firewall with ML-based intrusion prevention',
        'author': 'ShieldSec', 'status': 'available',
        'permissions': ['read', 'execute'],
      },
      {
        'id': 'plg_006', 'name': 'FABLE Ledger', 'version': '2.0.4',
        'description': 'Immutable audit trail for FABLE governance actions',
        'author': 'Governance Node', 'status': 'installed',
        'permissions': ['read', 'write', 'admin'],
      },
    ];
  }

  List<Map<String, dynamic>> _stubAgents() {
    return [
      {'id': 'agt_001', 'name': 'Data Sentry', 'blocks': ['fusion', 'plugin', 'logic', 'output'], 'status': 'idle'},
      {'id': 'agt_002', 'name': 'Threat Scrubber', 'blocks': ['plugin', 'logic', 'output'], 'status': 'idle'},
      {'id': 'agt_003', 'name': 'Compliance Hawk', 'blocks': ['fusion', 'logic', 'output'], 'status': 'running'},
    ];
  }

  List<Map<String, dynamic>> _stubWorkspaces() {
    return [
      {'id': 'ws_001', 'name': 'Security Ops', 'description': 'Primary security operations center', 'members': 5, 'plugins': 3, 'agents': 2, 'active': true},
      {'id': 'ws_002', 'name': 'R&D Nexus', 'description': 'Research and development sandbox', 'members': 3, 'plugins': 4, 'agents': 1, 'active': false},
      {'id': 'ws_003', 'name': 'Governance Core', 'description': 'FABLE governance management hub', 'members': 7, 'plugins': 2, 'agents': 3, 'active': false},
    ];
  }

  List<Map<String, dynamic>> _stubPersonas() {
    return [
      {'id': 'per_001', 'name': 'Oracle', 'description': 'Prophetic insight and foresight analysis', 'effect': 'Deep Insight'},
      {'id': 'per_002', 'name': 'Lyra', 'description': 'Melodic communication with harmonic resonance', 'effect': 'Clarity Boost'},
      {'id': 'per_003', 'name': 'Noir', 'description': 'Shadow operative for covert intelligence', 'effect': 'Stealth Mode'},
      {'id': 'per_004', 'name': 'Echo', 'description': 'Reflective listening and pattern mirroring', 'effect': 'Amplify'},
      {'id': 'per_005', 'name': 'Titan', 'description': 'Heavy-duty processing with brute-force logic', 'effect': 'Power Surge'},
    ];
  }

  // Fusion endpoints
  Future<Map<String, dynamic>> fusionProcess(String input, {String method = 'semantic', String tier = 'stubbed'}) async {
    try {
      // In production: final res = await http.post(Uri.parse('$baseUrl/fusion/process'), body: {...});
      return _stubFusion(input, method: method, tier: tier);
    } catch (e) {
      return _stubFusion(input, method: method, tier: 'local');
    }
  }

  Future<Map<String, dynamic>> fusionQuintuple(String input, {String method = 'semantic', String tier = 'stubbed'}) async {
    try {
      return {
        ..._stubFusion(input, method: method, tier: tier),
        'quintuple': true,
        'perspectives': {
          'benevolence': 'Alignment score: 0.94',
          'informed consent': 'Consent verified',
          'adversarial robustness': 'Resilience: HIGH',
          'distributed empowerment': 'Decentralization: ACTIVE',
          'recursive reflection': 'Feedback loop: ENABLED',
        },
      };
    } catch (e) {
      return _stubFusion(input, method: method, tier: 'local');
    }
  }

  // Plugin endpoints
  Future<List<Map<String, dynamic>>> getPlugins() async {
    try {
      return _stubPlugins();
    } catch (e) {
      return _stubPlugins();
    }
  }

  Future<Map<String, dynamic>> installPlugin(String id) async {
    try {
      return {'id': id, 'status': 'installed', 'message': 'Plugin $id installed successfully'};
    } catch (e) {
      return {'id': id, 'status': 'error', 'message': e.toString()};
    }
  }

  // Agent endpoints
  Future<List<Map<String, dynamic>>> getAgents() async {
    try {
      return _stubAgents();
    } catch (e) {
      return _stubAgents();
    }
  }

  Future<Map<String, dynamic>> createAgent(Map<String, dynamic> data) async {
    try {
      return {
        'id': 'agt_${DateTime.now().millisecondsSinceEpoch}',
        ...data,
        'status': 'created',
        'blocks': [],
      };
    } catch (e) {
      return {'id': 'agt_error', 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> runAgent(String id) async {
    try {
      return {'id': id, 'status': 'running', 'output': 'Agent $id executed successfully'};
    } catch (e) {
      return {'id': id, 'status': 'error', 'message': e.toString()};
    }
  }

  // Workspace endpoints
  Future<List<Map<String, dynamic>>> getWorkspaces() async {
    try {
      return _stubWorkspaces();
    } catch (e) {
      return _stubWorkspaces();
    }
  }

  // Voice endpoints
  Future<List<Map<String, dynamic>>> getPersonas() async {
    try {
      return _stubPersonas();
    } catch (e) {
      return _stubPersonas();
    }
  }

  Future<Map<String, dynamic>> processVoice(String transcript) async {
    try {
      return {
        'transcript': transcript,
        'processed': '${transcript.toUpperCase()} [voice processed]',
        'confidence': 0.95,
        'timestamp': DateTime.now().toIso8601String(),
      };
    } catch (e) {
      return {'transcript': transcript, 'error': e.toString()};
    }
  }
}
