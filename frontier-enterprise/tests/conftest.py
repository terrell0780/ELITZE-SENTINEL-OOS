# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Test conftest for frontier-enterprise — adds project root to sys.path and purges cached src modules."""
import sys
import os

pkg_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if pkg_dir not in sys.path:
    sys.path.insert(0, pkg_dir)

for k in list(sys.modules.keys()):
    if k == 'src' or k.startswith('src.'):
        del sys.modules[k]
