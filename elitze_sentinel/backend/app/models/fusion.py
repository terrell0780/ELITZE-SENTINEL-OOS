# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional


class FusionRequest(BaseModel):
    input_text: str = Field(..., description="Input text to process through Fusion Core")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional context for fusion")
    compression: str = Field(default="semantic", description="Compression method: semantic, token, structured")
    tier: str = Field(default="stubbed", description="Intelligence tier: stubbed, local, remote")


class FusionResponse(BaseModel):
    fusion_id: str
    timestamp: str
    input_summary: Dict[str, Any]
    compressed: Dict[str, Any]
    intelligence: Dict[str, Any]
    fused_layers: list
    final_output: str
    provenance_hash: str
