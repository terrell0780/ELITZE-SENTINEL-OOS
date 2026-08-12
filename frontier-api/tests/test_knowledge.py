# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core import KnowledgeEngine


@pytest.fixture
def eng():
    return KnowledgeEngine()


class TestDocumentIngestion:
    def test_ingest_paragraph(self, eng):
        result = eng.ingest_document("Test", "Para 1\n\nPara 2\n\nPara 3")
        assert result["chunk_count"] == 3
        assert result["status"] == "indexed"

    def test_ingest_fixed_size(self, eng):
        text = "A" * 1200
        result = eng.ingest_document("Big", text, strategy="fixed_size")
        assert result["chunk_count"] == 3

    def test_list_documents(self, eng):
        eng.ingest_document("A", "Content A")
        eng.ingest_document("B", "Content B")
        docs = eng.list_documents()
        assert len(docs) == 2

    def test_get_document(self, eng):
        d = eng.ingest_document("Doc", "Hello world")
        got = eng.get_document(d["doc_id"])
        assert got is not None
        assert got["title"] == "Doc"

    def test_get_document_not_found(self, eng):
        assert eng.get_document("ghost") is None

    def test_get_chunks(self, eng):
        d = eng.ingest_document("C", "P1\n\nP2")
        chunks = eng.get_document_chunks(d["doc_id"])
        assert len(chunks) == 2

    def test_delete_document(self, eng):
        d = eng.ingest_document("D", "Delete me")
        assert eng.delete_document(d["doc_id"]) is True
        assert eng.get_document(d["doc_id"]) is None
        assert eng.delete_document("ghost") is False


class TestSearch:
    def test_search(self, eng):
        eng.ingest_document("Doc1", "The cat sat on the mat")
        eng.ingest_document("Doc2", "The dog ran in the park")
        results = eng.search("cat", top_k=2)
        assert len(results) <= 2

    def test_rag_query(self, eng):
        eng.ingest_document("Doc1", "Python is a programming language.")
        result = eng.rag_query("Tell me about Python")
        assert "context" in result
        assert len(result["sources"]) > 0
        assert "Stubbed RAG" in result["answer"]
