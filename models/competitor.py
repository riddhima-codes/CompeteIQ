from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from enum import Enum

class TrackType(str, Enum):
    pricing = "pricing"
    features = "features"
    blog = "blog"
    all = "all"

class MonitorFrequency(int, Enum):
    six_hours = 6
    twelve_hours = 12
    twenty_four_hours = 24

class CompetitorCreate(BaseModel):
    name: str
    website_url: str
    pages_to_monitor: List[str] = []
    monitor_frequency_hours: MonitorFrequency = MonitorFrequency.twenty_four_hours
    track: List[TrackType] = [TrackType.all]

class CompetitorUpdate(BaseModel):
    name: Optional[str] = None
    pages_to_monitor: Optional[List[str]] = None
    monitor_frequency_hours: Optional[int] = None
    track: Optional[List[TrackType]] = None

class CompetitorResponse(BaseModel):
    id: str
    name: str
    website_url: str
    pages_to_monitor: List[str]
    monitor_frequency_hours: int
    track: List[str]
    user_id: str