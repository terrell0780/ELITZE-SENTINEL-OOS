# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Knowledge domain — documents, chunks, semantic search, RAG pipelines.
"""

import math
import random
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    INDEXED = "indexed"
    FAILED = "failed"


class ChunkingStrategy(str, Enum):
    FIXED_SIZE = "fixed_size"
    PARAGRAPH = "paragraph"
    SEMANTIC = "semantic"
    RECURSIVE = "recursive"


@dataclass
class Document:
    doc_id: str
    title: str
    content: str
    source: str = ""
    status: DocumentStatus = DocumentStatus.PENDING
    chunk_count: int = 0
    tags: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: float = 0.0
    updated_at: float = 0.0


@dataclass
class Chunk:
    chunk_id: str
    doc_id: str
    content: str
    index: int = 0
    embedding: list[float] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


class KnowledgeEngine:
    def __init__(self):
        self._documents: dict[str, Document] = {}
        self._chunks: dict[str, Chunk] = {}
        self._index: dict[str, list[str]] = {}  # doc_id -> chunk_ids

    def _now(self) -> float:
        return time.time()

    def _stub_embedding(self, text: str) -> list[float]:
        rng = random.Random(hash(text))
        dims = 384
        vec = [rng.uniform(-1.0, 1.0) for _ in range(dims)]
        norm = math.sqrt(sum(v*v for v in vec))
        return [v/norm for v in vec]

    def ingest_document(self, title: str, content: str, source: str = "",
                         tags: list[str] | None = None,
                         strategy: str = "paragraph") -> dict:
        doc_id = "doc-" + uuid.uuid4().hex[:8]
        doc = Document(doc_id, title, content, source, DocumentStatus.PENDING,
                       0, tags or [], {}, self._now(), self._now())
        self._documents[doc_id] = doc

        chunks = self._chunk_content(content, ChunkingStrategy(strategy))
        chunk_ids = []
        for i, chunk_text in enumerate(chunks):
            chunk_id = "chnk-" + uuid.uuid4().hex[:8]
            emb = self._stub_embedding(chunk_text)
            chunk = Chunk(chunk_id, doc_id, chunk_text, i, emb)
            self._chunks[chunk_id] = chunk
            chunk_ids.append(chunk_id)

        doc.chunk_count = len(chunks)
        doc.status = DocumentStatus.INDEXED
        self._index[doc_id] = chunk_ids
        return {"doc_id": doc_id, "title": title, "chunk_count": len(chunks),
                "status": "indexed"}

    def _chunk_content(self, content: str, strategy: ChunkingStrategy) -> list[str]:
        if strategy == ChunkingStrategy.PARAGRAPH:
            return [p.strip() for p in content.split("\n\n") if p.strip()]
        elif strategy == ChunkingStrategy.FIXED_SIZE:
            size = 500
            return [content[i:i+size] for i in range(0, len(content), size)]
        elif strategy == ChunkingStrategy.RECURSIVE:
            if len(content) <= 1000:
                return [content]
            parts = []
            for p in content.split("\n\n"):
                if len(p) > 500:
                    parts.extend(self._chunk_content(p, ChunkingStrategy.FIXED_SIZE))
                else:
                    parts.append(p.strip())
            return [p for p in parts if p]
        else:
            return [content]

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        query_emb = self._stub_embedding(query)
        scores = []
        for chunk_id, chunk in self._chunks.items():
            if not chunk.embedding:
                continue
            dot = sum(a*b for a, b in zip(query_emb, chunk.embedding))
            scores.append((dot, chunk_id, chunk.doc_id, chunk.content))
        scores.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk_id, doc_id, content in scores[:top_k]:
            doc = self._documents.get(doc_id)
            results.append({
                "chunk_id": chunk_id, "doc_id": doc_id,
                "title": doc.title if doc else "Unknown",
                "score": round(score, 4),
                "content_preview": content[:200] + ("..." if len(content) > 200 else ""),
            })
        return results

    def get_document(self, doc_id: str) -> dict | None:
        doc = self._documents.get(doc_id)
        if not doc:
            return None
        return {"doc_id": doc.doc_id, "title": doc.title, "source": doc.source,
                "status": doc.status.value, "chunk_count": doc.chunk_count,
                "tags": doc.tags, "created_at": doc.created_at}

    def list_documents(self, status: str | None = None) -> list[dict]:
        result = []
        for d in self._documents.values():
            if status and d.status.value != status:
                continue
            result.append({"doc_id": d.doc_id, "title": d.title, "source": d.source,
                           "status": d.status.value, "chunk_count": d.chunk_count,
                           "tags": d.tags, "created_at": d.created_at})
        return result

    def get_document_chunks(self, doc_id: str) -> list[dict]:
        chunk_ids = self._index.get(doc_id, [])
        return [{"chunk_id": c.chunk_id, "index": c.index,
                 "content_preview": c.content[:150] + ("..." if len(c.content) > 150 else "")}
                for c in (self._chunks[cid] for cid in chunk_ids if cid in self._chunks)]

    def delete_document(self, doc_id: str) -> bool:
        if doc_id not in self._documents:
            return False
        for cid in self._index.get(doc_id, []):
            self._chunks.pop(cid, None)
        self._index.pop(doc_id, None)
        self._documents.pop(doc_id, None)
        return True

    def rag_query(self, query: str, top_k: int = 3) -> dict:
        results = self.search(query, top_k)
        context = "\n\n".join(r["content_preview"] for r in results)
        return {
            "query": query,
            "context": context,
            "sources": [{"doc_id": r["doc_id"], "title": r["title"], "score": r["score"]}
                        for r in results],
            "answer": f"[Stubbed RAG] Based on {len(results)} sources, generated response for: {query}",
        }
