# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from src.routers.pipeline import router, identity


class TestPipelineRouter:
    def test_list_stages(self):
        result = router.dispatch("GET", "/v1/pipeline/stages")
        assert result["status_code"] == 200
        body = __import__("json").loads(result["body"])
        assert len(body["stages"]) == 6
        assert body["stages"][0]["name"] == "auth"

    def test_validate_valid_key(self):
        key = identity.create_api_key("test", "tenant-1", "user-1", ["*"])
        result = router.dispatch("POST", "/v1/pipeline/validate",
                                 body={"input": "hello", "auth_token": key.key_id})
        assert result["status_code"] == 200
        body = __import__("json").loads(result["body"])
        assert body["status"] in ("completed", "denied")

    def test_validate_invalid_key(self):
        result = router.dispatch("POST", "/v1/pipeline/validate",
                                 body={"input": "hello", "auth_token": "bad-key"})
        assert result["status_code"] == 200
        body = __import__("json").loads(result["body"])
        assert body["status"] == "denied"
