# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Cache service — Redis stub for Elitze Sentinel.
All operations are in-memory for offline operation.
"""

from typing import Any, Dict, Optional


class RedisCache:
    """Stub for Redis cache. Replace with aioredis in production."""

    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._ttl: Dict[str, float] = {}

    async def get(self, key: str) -> Optional[Any]:
        return self._cache.get(key)

    async def set(self, key: str, value: Any, ttl_seconds: int = 300):
        self._cache[key] = value
        if ttl_seconds > 0:
            import time
            self._ttl[key] = time.time() + ttl_seconds

    async def delete(self, key: str):
        self._cache.pop(key, None)
        self._ttl.pop(key, None)

    async def exists(self, key: str) -> bool:
        return key in self._cache

    async def clear(self):
        self._cache.clear()
        self._ttl.clear()


cache = RedisCache()
