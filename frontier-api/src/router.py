# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import json
import re
from collections.abc import Callable
from urllib.parse import parse_qs


class Router:
    def __init__(self, prefix: str = ""):
        self.prefix = prefix.rstrip("/")
        self._routes: list[tuple[str, re.Pattern, list[str], Callable]] = []

    def _compile(self, path: str):
        param_names: list[str] = []
        segments: list[str] = []
        for seg in path.strip("/").split("/"):
            if seg.startswith("{") and seg.endswith("}"):
                param_names.append(seg[1:-1])
                segments.append("([^/]+)")
            else:
                segments.append(re.escape(seg))
        if segments:
            regex = "^/" + "/".join(segments) + "$"
        else:
            regex = "^$"
        return re.compile(regex), param_names

    def add_route(self, method: str, path: str, handler: Callable = None):
        if handler is not None:
            pattern, param_names = self._compile(self.prefix + path)
            self._routes.append((method, pattern, param_names, handler))
            return handler
        def wrapper(fn):
            pattern, param_names = self._compile(self.prefix + path)
            self._routes.append((method, pattern, param_names, fn))
            return fn
        return wrapper

    def dispatch(self, method: str, path: str, query_string: str = "", body: dict | None = None) -> dict:
        qs = parse_qs(query_string) if query_string else {}
        query = {k: v[0] if len(v) == 1 else v for k, v in qs.items()}
        for route_method, pattern, param_names, handler in self._routes:
            if route_method != method.upper():
                continue
            m = pattern.match(path)
            if m:
                kwargs = dict(zip(param_names, m.groups()))
                try:
                    result = handler(query=query, body=body, **kwargs)
                    if isinstance(result, tuple):
                        status, data = result
                    else:
                        status, data = 200, result
                    return {"status_code": status, "body": json.dumps(data, default=str, indent=2),
                            "headers": {"Content-Type": "application/json"}}
                except Exception as e:
                    return {"status_code": 500, "body": json.dumps({"error": str(e)}, indent=2),
                            "headers": {"Content-Type": "application/json"}}
        return {"status_code": 404, "body": json.dumps({"error": "Not found", "path": path, "method": method}, indent=2),
                "headers": {"Content-Type": "application/json"}}
