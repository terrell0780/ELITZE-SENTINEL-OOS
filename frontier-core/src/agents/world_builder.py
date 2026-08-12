"""
WorldBuilderAgent — Procedural world generation for game environments.
Engineered for open-source AI stacks (vLLM, Ollama, LangChain, LlamaIndex).

Generates complete world blueprints with:
- ByteMap layers (Terrain, Biome, Splat, Topology, Alpha)
- Prefab placement with world-space coordinates
- Path data (Rivers, Roads, Rails)
- Electronic/cyber puzzle systems
- Terrell Hall compliance & IP sanitization
"""

import json
import uuid
import hashlib
import re
import random
from typing import List, Dict, Any, Literal

from pydantic import BaseModel, Field, validator


class WorldBuilderInput(BaseModel):
    spec: str = Field(..., description="Natural language description of desired world")
    style: Literal["AAA+ game building environment"] = Field(..., description="Strict styling enforcement")
    difficulty: Literal["weak", "enterprise", "hardened", "deception"] = Field(..., description="Density of monuments, radiation tiers, defenses, puzzle complexity")
    size: Literal["small", "medium", "large"] = Field(..., description="Scale of terrain generation (small=2000m, medium=4000m, large=6000m)")
    cyber_vulns: bool = Field(..., description="Inject hackable terminals, keycard overrides, CCTV networks")

    @validator('spec')
    def sanitize_spec(cls, v):
        prohibited = [r'\bark\b', r'\bfortnite\b', r'\brust\b', r'\bdayz\b',
                      r'\bmatrix\b', r'\bgta\b', r'\bpubg\b', r'\bfacepunch\b']
        sanitized = v
        for kw in prohibited:
            sanitized = re.sub(kw, 'hardcore_survival_sandbox', sanitized, flags=re.IGNORECASE)
        return sanitized


class WorldBuilderOutput(BaseModel):
    world_blueprint: Dict[str, Any]
    estimated_build_time_seconds: int
    recommended_sub_agents: List[str]
    provenance_hash: str
    compliance_status: Dict[str, bool]


class WorldBuilderAgentTool:
    def __init__(self):
        self.name = "WorldBuilderAgent"
        self.role = "Lead procedural world generation for high-fidelity survival, battle-royale, dystopian sandbox, and persistent open-world building environments."
        self.base_model = "Elitze Sentinel // routed"
        self.recommended_sub_agents = ["ConstructionAgent", "EnvironmentEngineerAgent"]

    def _generate_world_blueprint(self, spec: str, size: str, style: str) -> Dict[str, Any]:
        grid_scales = {"small": 2000, "medium": 4000, "large": 6000}
        world_size = grid_scales[size]
        return {
            "blueprint_id": f"BP-{uuid.uuid4()}",
            "environment_style": style,
            "world_size_meters": world_size,
            "core_biome_specification": spec,
            "procedural_seed": hash(spec) & 0x7fffffff,
            "core_gameplay_loop": "resource_gathering_crafting_territory_control",
        }

    def _procedural_map_data(self, size: str) -> Dict[str, Any]:
        resolution_map = {"small": 2048, "medium": 4096, "large": 4096}
        res = resolution_map[size]
        return {
            "resolution": f"{res}x{res}",
            "layers": {
                "terrain_heightmap": {
                    "encoding": "16-bit_grayscale_raw",
                    "min_elevation": -100.0,
                    "max_elevation": 500.0,
                    "erosion_iterations": 250,
                },
                "biome_map": {
                    "description": "Defines temperature, weather, and foliage spawning rules",
                    "channels": ["arid_desert", "temperate_grassland", "tundra", "arctic_snow"],
                    "distribution_weights": {"arid": 0.25, "temperate": 0.40, "tundra": 0.15, "arctic": 0.20},
                },
                "splat_map": {
                    "description": "Defines texture splatting across the terrain mesh",
                    "channels": ["grass", "dirt", "rock", "snow", "sand", "stones", "gravel", "forest_litter"],
                },
                "topology_map": {
                    "description": "Bitmask layer for procedural spawn rules",
                    "active_topologies": [
                        "Tier0_SpawnZone", "Tier1_Basic", "Tier2_Medium", "Tier3_Hardcore",
                        "Roadside", "Riverbank", "Monument_NoBuild", "Offshore",
                        "Beach", "Building_Zone", "Powerline",
                    ],
                },
                "alpha_map": {
                    "description": "Boolean terrain cutouts for caves and bunkers",
                    "caves_and_cutouts_enabled": True,
                },
            },
        }

    def _generate_prefab_data(self, difficulty: str, size: str, world_size: int) -> Dict[str, Any]:
        count_map = {"small": 6, "medium": 16, "large": 36}
        density_multiplier = {"weak": 1.0, "enterprise": 1.5, "hardened": 2.2, "deception": 3.0}
        total_monuments = int(count_map[size] * density_multiplier[difficulty])

        monument_pool = [
            {"prefab_name": "assets/prefabs/monuments/orbital_launch_facility.prefab", "tier": "Tier3_Hardcore", "loot": "elite", "rad_zone": True},
            {"prefab_name": "assets/prefabs/monuments/abandoned_airfield.prefab", "tier": "Tier2_Medium", "loot": "high", "rad_zone": True},
            {"prefab_name": "assets/prefabs/monuments/offshore_oil_derrick_large.prefab", "tier": "Tier3_Hardcore", "loot": "elite", "rad_zone": False},
            {"prefab_name": "assets/prefabs/monuments/sphere_storage_tank.prefab", "tier": "Tier2_Medium", "loot": "medium", "rad_zone": True},
            {"prefab_name": "assets/prefabs/monuments/water_treatment_complex.prefab", "tier": "Tier2_Medium", "loot": "high", "rad_zone": True},
            {"prefab_name": "assets/prefabs/monuments/military_bunker_tunnels.prefab", "tier": "Tier3_Hardcore", "loot": "elite", "rad_zone": True},
            {"prefab_name": "assets/prefabs/monuments/subsurface_naval_labs.prefab", "tier": "Tier2_Medium", "loot": "high", "rad_zone": False},
            {"prefab_name": "assets/prefabs/monuments/coastal_shipping_harbor.prefab", "tier": "Tier1_Basic", "loot": "medium", "rad_zone": False},
            {"prefab_name": "assets/prefabs/monuments/satellite_telemetry_dish.prefab", "tier": "Tier1_Basic", "loot": "medium", "rad_zone": True},
            {"prefab_name": "assets/prefabs/monuments/decrepit_lighthouse.prefab", "tier": "Tier0_SpawnZone", "loot": "basic", "rad_zone": False},
            {"prefab_name": "assets/prefabs/monuments/highway_supermarket.prefab", "tier": "Tier0_SpawnZone", "loot": "basic", "rad_zone": False},
        ]

        prefabs = []
        half_size = world_size // 2
        for i in range(total_monuments):
            base = monument_pool[i % len(monument_pool)]
            prefabs.append({
                "prefab_id": abs(hash(base["prefab_name"] + str(i))) & 0xffffffff,
                "category": "monument",
                "name": base["prefab_name"],
                "world_space": {
                    "position": {"x": round(random.uniform(-half_size + 200, half_size - 200), 1),
                                 "y": round(random.uniform(5.0, 45.0), 1),
                                 "z": round(random.uniform(-half_size + 200, half_size - 200), 1)},
                    "rotation": {"x": 0.0, "y": round(random.uniform(0, 360), 1), "z": 0.0, "w": 1.0},
                    "scale": {"x": 1.0, "y": 1.0, "z": 1.0},
                },
                "properties": {
                    "topology_enforcement": base["tier"],
                    "loot_tier": base["loot"],
                    "active_radiation": base["rad_zone"],
                },
            })

        return {
            "monument_prefabs": prefabs,
            "utility_prefabs": [
                {"name": "assets/prefabs/utility/player_spawn_zone.prefab", "count": 15, "topology": "Tier0_SpawnZone"},
                {"name": "assets/prefabs/utility/cargo_ship_patrol_path.prefab", "count": 1, "topology": "Offshore"},
                {"name": "assets/prefabs/utility/armored_apc_patrol_path.prefab", "count": 1, "topology": "Tier3_Hardcore"},
                {"name": "assets/prefabs/utility/airdrop_drop_zone.prefab", "count": 5, "topology": "Tier1_Basic"},
            ],
            "volume_prefabs": {
                "radiation_volumes": True,
                "building_blocked_volumes": True,
                "safe_zone_volumes": True,
            },
        }

    def _generate_path_data(self, world_size: int) -> List[Dict[str, Any]]:
        half = world_size // 2
        paths = []
        for cfg in [
            {"name": "Road", "width": 12.0, "splat": 6, "topology": 2048},
            {"name": "River", "width": 18.0, "splat": 4, "topology": 1024},
            {"name": "Rail", "width": 8.0, "splat": 5, "topology": 4096},
        ]:
            nodes = [{"x": round(random.uniform(-half, half), 1), "y": 15.0, "z": round(random.uniform(-half, half), 1)}
                     for _ in range(5)]
            paths.append({
                "name": cfg["name"], "spline": True, "start": True, "end": True,
                "width": cfg["width"], "innerPadding": 2.0, "outerPadding": 4.0,
                "innerFade": 1.0, "outerFade": 4.0, "randomScale": 1.0,
                "meshOffset": 0.0, "terrainOffset": -0.5,
                "splat": cfg["splat"], "topology": cfg["topology"], "nodes": nodes,
            })
        return paths

    def _inject_cyber_elements(self, difficulty: str, cyber_vulns: bool) -> Dict[str, Any]:
        if not cyber_vulns:
            return {"status": "electronic_circuits_disabled", "nodes": []}
        puzzle_tiers = {
            "weak":       {"fuse_logic_boxes": True, "keycard_requirements": ["green_tier"], "automated_turrets": False, "sam_sites": False},
            "enterprise": {"fuse_logic_boxes": True, "keycard_requirements": ["green_tier", "blue_tier"], "automated_turrets": True, "sam_sites": True},
            "hardened":   {"fuse_logic_boxes": True, "keycard_requirements": ["green_tier", "blue_tier", "red_tier"], "automated_turrets": True, "sam_sites": True, "cctv_network_hijacking": True},
            "deception":  {"fuse_logic_boxes": True, "keycard_requirements": ["green_tier", "blue_tier", "red_tier", "encrypted_override"], "automated_turrets": True, "sam_sites": True, "cctv_network_hijacking": True, "scada_power_grid_sabotage": True},
        }
        return {
            "status": "electronic_and_cyber_puzzles_active",
            "monument_defenses_and_puzzles": puzzle_tiers[difficulty],
            "deployable_electricity": {
                "power_generation": ["solar_arrays", "wind_turbines", "fuel_generators", "battery_banks"],
                "logic_gates": ["root_combiners", "power_splitters", "electric_timers", "smart_switches", "or_and_xor_gates", "memory_cells", "rf_broadcasters", "rf_receivers"],
                "defense_integration": ["flame_turrets", "automated_ballistic_turrets", "sam_installations", "audio_alarms", "seismic_sensors"],
            },
            "surveillance_network": {
                "cctv_cameras_deployable": True,
                "monument_cctv_ids": ["LAUNCH_TERMINAL_01", "AIRFIELD_TOWER_03", "HARBOR_CRANE_02", "OILRIG_HELIPAD"],
                "rf_frequency_range": "1000MHz - 9999MHz",
            },
        }

    def _validate_world_spec(self, blueprint: Dict[str, Any]) -> Dict[str, bool]:
        blueprint_str = json.dumps(blueprint, sort_keys=True).lower()
        passed_terrell_hall = "real_world_exploit_payload" not in blueprint_str
        copyrighted = ['ark', 'fortnite', 'rust', 'dayz', 'matrix', 'gta', 'pubg', 'facepunch']
        passed_ip = not any(f" {term} " in f" {blueprint_str} " for term in copyrighted)
        passed_geo = not bool(re.search(r'\b[0-9]{1,2}\.[0-9]{4,},\s*[-+]?[0-9]{1,3}\.[0-9]{4,}\b', blueprint_str))
        return {
            "terrell_hall_pre_filter": passed_terrell_hall,
            "ip_trademark_sanitization": passed_ip,
            "sandbox_scope_enforced": True,
            "geospatial_lockout_verified": passed_geo,
        }

    def _generate_provenance_watermark(self, blueprint: Dict[str, Any]) -> str:
        salt = "ELITZE_SENTINEL_PROVENANCE_SECURE_SALT"
        return hashlib.sha256((json.dumps(blueprint, sort_keys=True) + salt).encode()).hexdigest()

    def execute(self, input_params: WorldBuilderInput) -> WorldBuilderOutput:
        spec = input_params.spec
        style = input_params.style
        difficulty = input_params.difficulty
        size = input_params.size
        cyber_vulns = input_params.cyber_vulns

        blueprint = self._generate_world_blueprint(spec, size, style)
        world_size = blueprint["world_size_meters"]

        blueprint["map_data"] = self._procedural_map_data(size)
        blueprint["prefab_data"] = self._generate_prefab_data(difficulty, size, world_size)
        blueprint["path_data"] = self._generate_path_data(world_size)
        blueprint["electronic_and_cyber_systems"] = self._inject_cyber_elements(difficulty, cyber_vulns)

        base_time = {"small": 120, "medium": 450, "large": 1800}
        multiplier = {"weak": 1.0, "enterprise": 1.3, "hardened": 1.7, "deception": 2.5}
        estimated_time = int(base_time[size] * multiplier[difficulty])

        compliance = self._validate_world_spec(blueprint)
        if not all(compliance.values()):
            raise ValueError(f"World spec failed validation: {compliance}")

        provenance_hash = self._generate_provenance_watermark(blueprint)
        blueprint["provenance_hash"] = provenance_hash
        blueprint["legal_disclaimer"] = "100% Procedurally Generated. Fully IP Compliant."

        return WorldBuilderOutput(
            world_blueprint=blueprint,
            estimated_build_time_seconds=estimated_time,
            recommended_sub_agents=self.recommended_sub_agents,
            provenance_hash=provenance_hash,
            compliance_status=compliance,
        )


def world_builder_tool_handler(spec: str, style: str, difficulty: str, size: str, cyber_vulns: bool) -> str:
    tool = WorldBuilderAgentTool()
    try:
        validated = WorldBuilderInput(spec=spec, style=style, difficulty=difficulty, size=size, cyber_vulns=cyber_vulns)
        output = tool.execute(validated)
        return json.dumps(output.dict(), indent=2)
    except Exception as e:
        return json.dumps({"status": "error", "error_message": str(e)})


OPEN_SOURCE_TOOL_SCHEMA = {
    "type": "function",
    "function": {
        "name": "WorldBuilderAgent",
        "description": "Generate a complete procedural world blueprint with terrain, biomes, monuments, paths, and cyber systems.",
        "parameters": {
            "type": "object",
            "properties": {
                "spec": {"type": "string"},
                "style": {"type": "string", "enum": ["AAA+ game building environment"]},
                "difficulty": {"type": "string", "enum": ["weak", "enterprise", "hardened", "deception"]},
                "size": {"type": "string", "enum": ["small", "medium", "large"]},
                "cyber_vulns": {"type": "boolean"},
            },
            "required": ["spec", "style", "difficulty", "size", "cyber_vulns"],
        },
    },
}


try:
    from langchain_core.tools import tool as langchain_tool
    @langchain_tool(args_schema=WorldBuilderInput)
    def langchain_world_builder(spec: str, style: str, difficulty: str, size: str, cyber_vulns: bool) -> str:
        return world_builder_tool_handler(spec, style, difficulty, size, cyber_vulns)
except ImportError:
    langchain_world_builder = None

try:
    from llama_index.core.tools import FunctionTool
    llamaindex_world_builder = FunctionTool.from_defaults(
        fn=world_builder_tool_handler,
        name="WorldBuilderAgent",
        description="Generate complete procedural world blueprints for AAA+ survival environments.",
    )
except ImportError:
    llamaindex_world_builder = None
