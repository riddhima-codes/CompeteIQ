from agents.state import CompetitorState
from services.embeddings import get_embedding

def embedder_node(state: CompetitorState) -> CompetitorState:
    print("Generating embeddings...")
    
    # Combine all content into one string for embedding
    combined = state["analysis_summary"] + " ".join([
        content for content in state["scraped_content"].values()
    ])
    
    # Truncate to avoid memory issues
    combined = combined[:8000]
    
    embedding = get_embedding(combined)
    state["embeddings"] = embedding
    return state