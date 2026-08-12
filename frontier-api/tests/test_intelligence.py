# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core import IntelligenceEngine


@pytest.fixture
def eng():
    return IntelligenceEngine()


class TestEmbeddings:
    def test_embed(self, eng):
        result = eng.embed("Hello world", "stub")
        assert "embedding_id" in result
        assert result["dimensions"] == 384
        assert len(result["vector_preview"]) == 5

    def test_search(self, eng):
        eng.embed("cat")
        eng.embed("dog")
        results = eng.search([0.1] * 384, top_k=2)
        assert len(results) == 2
        assert all("score" in r for r in results)


class TestModelRegistry:
    def test_list_models(self, eng):
        models = eng.list_models()
        assert len(models) >= 3

    def test_list_models_by_status(self, eng):
        active = eng.list_models(status="active")
        assert all(m["status"] == "active" for m in active)

    def test_get_model(self, eng):
        m = eng.get_model("model-sentinel-v1")
        assert m is not None
        assert m["name"] == "Elitze Sentinel v1"

    def test_get_model_not_found(self, eng):
        assert eng.get_model("nonexistent") is None

    def test_register_model(self, eng):
        result = eng.register_model("Test", "test", "1.0", ["text"])
        assert "model_id" in result
        assert result["status"] == "available"


class TestFineTuning:
    def test_create_job(self, eng):
        result = eng.create_fine_tuning_job("test-model", 100, 3)
        assert "job_id" in result
        assert result["status"] == "pending"

    def test_list_jobs(self, eng):
        eng.create_fine_tuning_job("m1", 10)
        eng.create_fine_tuning_job("m2", 20)
        jobs = eng.list_jobs()
        assert len(jobs) == 2

    def test_get_job(self, eng):
        j = eng.create_fine_tuning_job("m1", 10)
        got = eng.get_job(j["job_id"])
        assert got is not None
        assert got["model_name"] == "m1"

    def test_get_job_not_found(self, eng):
        assert eng.get_job("nonexistent") is None
