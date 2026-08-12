# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException
from ..core.fusion_core import FusionCore, CompressionMethod, IntelligenceTier
from ..core.quintuple_fusion import QuintupleFusionLayer
from ..models.fusion import FusionRequest
from typing import Any, Dict, Optional

router = APIRouter(prefix="/api/v1/fusion", tags=["Fusion"])

fusion_core = FusionCore()
quintuple = QuintupleFusionLayer()


@router.post("/process")
async def process_fusion(request: FusionRequest):
    try:
        compression = CompressionMethod(request.compression)
        tier = IntelligenceTier(request.tier)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid compression or tier value")
    result = await fusion_core.process(
        input_text=request.input_text,
        context=request.context,
        compression=compression,
        tier=tier,
    )
    return fusion_core.to_dict(result)


@router.post("/quintuple")
async def quintuple_fusion(input_text: str, context: Optional[Dict[str, Any]] = None):
    result = await quintuple.fuse(query=input_text, context=context)
    return {
        "fusion_id": result.fusion_id,
        "timestamp": result.timestamp,
        "web_reasoning": result.web_reasoning,
        "memory_reasoning": result.memory_reasoning,
        "multimodal_reasoning": result.multimodal_reasoning,
        "core_fusion_ref": result.core_fusion_ref,
        "governance_ref": result.governance_ref,
        "final_output": result.final_output,
    }
