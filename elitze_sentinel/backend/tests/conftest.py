# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""pytest configuration: enable auto mode for asyncio so class-based async tests work."""

# pytest_plugins moved to root conftest.py


def pytest_configure(config):
    """Register the asyncio marker and enable auto mode."""
    config.addinivalue_line("markers", "asyncio: mark test as async")
