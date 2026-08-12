# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from src.core import KnowledgeEngine
from src.router import Router

router = Router(prefix="/v1/knowledge")
eng = KnowledgeEngine()


@router.add_route("POST", "/documents")
def ingest_document(query, body):
    result = eng.ingest_document(
        title=body["title"], content=body["content"],
        source=body.get("source", ""),
        tags=body.get("tags"),
        strategy=body.get("strategy", "paragraph"),
    )
    return 201, result


@router.add_route("GET", "/documents")
def list_documents(query, body):
    return eng.list_documents(status=query.get("status"))


@router.add_route("GET", "/documents/{doc_id}")
def get_document(query, body, doc_id):
    doc = eng.get_document(doc_id)
    if not doc:
        return 404, {"error": "Document not found"}
    return doc


@router.add_route("GET", "/documents/{doc_id}/chunks")
def get_chunks(query, body, doc_id):
    if not eng.get_document(doc_id):
        return 404, {"error": "Document not found"}
    return {"doc_id": doc_id, "chunks": eng.get_document_chunks(doc_id)}


@router.add_route("DELETE", "/documents/{doc_id}")
def delete_document(query, body, doc_id):
    if eng.delete_document(doc_id):
        return {"status": "deleted", "doc_id": doc_id}
    return 404, {"error": "Document not found"}


@router.add_route("POST", "/search")
def search(query, body):
    return eng.search(body["query"], body.get("top_k", 5))


@router.add_route("POST", "/rag")
def rag_query(query, body):
    return eng.rag_query(body["query"], body.get("top_k", 3))
