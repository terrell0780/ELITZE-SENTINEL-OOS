# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Root pytest configuration for Elitze Sentinel Frontier microservices."""

import sys
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def pytest_collect_file(file_path, parent):
    """Ensure active sub-project directory is at the front of sys.path during test collection."""
    path_str = str(file_path)
    for project in [
        "frontier-code",
        "frontier-core",
        "frontier-enterprise",
        "frontier-gaming-studio",
        "frontier-gaming-engine",
        "frontier-gaming-compiler",
        "frontier-api",
        "frontier-auth",
        "frontier-cli",
        "frontier-config",
        "frontier-gateway",
        "frontier-runtime",
        "elitze-engine",
        "elitze_sentinel",
        "elitze_sentinel/backend",
    ]:
        proj_path = os.path.join(ROOT_DIR, project)
        if proj_path in path_str:
            if proj_path in sys.path:
                sys.path.remove(proj_path)
            sys.path.insert(0, proj_path)
            for k in list(sys.modules.keys()):
                if k == 'src' or k.startswith('src.'):
                    del sys.modules[k]
            break

pytest_plugins = ['pytest_asyncio']

def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "asyncio: mark test as async")

