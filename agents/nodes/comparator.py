from agents.state import CompetitorState
from services.embeddings import cosine_similarity
from services.groq import get_llm
from langchain_core.messages import HumanMessage

CHANGE_THRESHOLD = 0.85  # below this = meaningful change

def comparator_node(state: CompetitorState) -> CompetitorState:
    previous = state.get("previous_embeddings")
    
    # No previous embeddings = first time analysis, no comparison
    if not previous:
        print("First analysis — no comparison needed")
        state["change_detected"] = False
        state["change_summary"] = None
        return state
    
    # Calculate similarity
    similarity = cosine_similarity(state["embeddings"], previous)
    print(f"Similarity score: {similarity:.3f}")
    
    if similarity < CHANGE_THRESHOLD:
        print("Change detected!")
        state["change_detected"] = True
        
        # Ask LLM to explain what changed
        llm = get_llm()
        prompt = f"""
        A competitor's website has changed significantly.
        
        Latest analysis:
        {state['analysis_summary'][:2000]}
        
        Based on this analysis, briefly explain in 2-3 sentences 
        what likely changed on their website. Focus on business-relevant changes
        like pricing, features, or positioning.
        """
        response = llm.invoke([HumanMessage(content=prompt)])
        state["change_summary"] = response.content
    else:
        print("No significant change detected")
        state["change_detected"] = False
        state["change_summary"] = None
    
    return state