from typing import TypedDict, List, Optional

class CompetitorState(TypedDict):
    # Input
    competitor_id: str
    competitor_name: str
    website_url: str
    pages_to_monitor: List[str]
    track: List[str]

    # Scraper output
    scraped_content: dict      # {url: content}
    scrape_error: Optional[str]

    # Analyzer output
    analysis_summary: str
    key_insights: List[str]
    pricing_info: Optional[str]
    features_info: Optional[str]

    # Embedder output
    embeddings: List[float]    # vector of the content

    # Comparator output (Phase 6)
    previous_embeddings: Optional[List[float]]
    change_detected: bool
    change_summary: Optional[str]

    # Reporter output
    report: dict