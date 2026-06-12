from agents.state import CompetitorState
from datetime import datetime

def reporter_node(state: CompetitorState) -> CompetitorState:
    print("Generating report...")
    
    state["report"] = {
        "competitor_id": state["competitor_id"],
        "competitor_name": state["competitor_name"],
        "website_url": state["website_url"],
        "analysis_summary": state["analysis_summary"],
        "key_insights": state["key_insights"],
        "scraped_pages": list(state["scraped_content"].keys()),
        "change_detected": state.get("change_detected", False),
        "change_summary": state.get("change_summary"),
        "embeddings": state["embeddings"],
        "created_at": datetime.utcnow().isoformat()
    }
    return state