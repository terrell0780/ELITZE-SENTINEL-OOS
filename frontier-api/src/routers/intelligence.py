# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from src.core import IntelligenceEngine
from src.router import Router

router = Router(prefix="/v1/intelligence")
eng = IntelligenceEngine()


@router.add_route("POST", "/embeddings")
def create_embedding(query, body):
    result = eng.embed(body["text"], body.get("provider", "stub"))
    return 201, result


@router.add_route("POST", "/search")
def search_embeddings(query, body):
    return eng.search(body["vector"], body.get("top_k", 5))


@router.add_route("GET", "/models")
def list_models(query, body):
    return eng.list_models(status=query.get("status"))


@router.add_route("GET", "/models/{model_id}")
def get_model(query, body, model_id):
    m = eng.get_model(model_id)
    if not m:
        return 404, {"error": "Model not found"}
    return m


@router.add_route("POST", "/models")
def register_model(query, body):
    result = eng.register_model(
        name=body["name"], provider=body["provider"],
        version=body["version"], capabilities=body.get("capabilities", []),
        context_window=body.get("context_window", 4096),
    )
    return 201, result


@router.add_route("POST", "/fine-tuning/jobs")
def create_job(query, body):
    result = eng.create_fine_tuning_job(
        model_name=body["model_name"],
        training_examples=body["training_examples"],
        epochs=body.get("epochs", 3),
    )
    return 201, result


@router.add_route("GET", "/fine-tuning/jobs")
def list_jobs(query, body):
    return eng.list_jobs()


@router.add_route("GET", "/fine-tuning/jobs/{job_id}")
def get_job(query, body, job_id):
    j = eng.get_job(job_id)
    if not j:
        return 404, {"error": "Job not found"}
    return j
