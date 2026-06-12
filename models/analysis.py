from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AnalysisResponse(BaseModel):
    id: str
    competitor_id: str
    competitor_name: str
    analysis_summary: str
    key_insights: List[str]
    change_detected: bool
    change_summary: Optional[str]
    created_at: str