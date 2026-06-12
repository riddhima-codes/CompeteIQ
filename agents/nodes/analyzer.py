from agents.state import CompetitorState
from services.groq import get_llm
from langchain_core.messages import HumanMessage

def analyzer_node(state: CompetitorState) -> CompetitorState:
    print(f"Analyzing {state['competitor_name']}...")
    
    llm = get_llm()
    
    # Combine all scraped content
    all_content = "\n\n".join([
        f"URL: {url}\nContent: {content}"
        for url, content in state["scraped_content"].items()
    ])
    
    # Build prompt based on what to track
    track_instructions = ""
    if "pricing" in state["track"] or "all" in state["track"]:
        track_instructions += "- Extract all pricing information\n"
    if "features" in state["track"] or "all" in state["track"]:
        track_instructions += "- List key product features\n"
    
    prompt = f"""
    Analyze this competitor: {state['competitor_name']}
    
    Content scraped from their website:
    {all_content[:4000]}  
    
    Please provide:
    {track_instructions}
    - A 3-4 sentence summary of what this company does
    - 5 key insights about their positioning
    - Any pricing information found
    - Key features they offer
    
    Be factual and concise.
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    analysis_text = response.content
    
    # Parse response into structured fields
    state["analysis_summary"] = analysis_text
    state["key_insights"] = [
        line.strip() for line in analysis_text.split("\n")
        if line.strip().startswith("-")
    ][:5]
    
    return state