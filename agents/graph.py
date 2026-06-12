from langgraph.graph import StateGraph, END
from agents.state import CompetitorState
from agents.nodes.scraper import scraper_node
from agents.nodes.analyzer import analyzer_node
from agents.nodes.embedder import embedder_node
from agents.nodes.reporter import reporter_node
from agents.nodes.comparator import comparator_node


def build_graph():
    graph = StateGraph(CompetitorState)
    
    # Add nodes
    graph.add_node("scraper", scraper_node)
    graph.add_node("analyzer", analyzer_node)
    graph.add_node("embedder", embedder_node)
    graph.add_node("comparator", comparator_node)
    graph.add_node("reporter", reporter_node)
    
    # Define edges (flow)
    graph.set_entry_point("scraper")
    graph.add_edge("scraper", "analyzer")
    graph.add_edge("analyzer", "embedder")
    graph.add_edge("embedder", "comparator")
    graph.add_edge("comparator", "reporter")
    graph.add_edge("reporter", END)
    
    return graph.compile()

# Build once at startup
analysis_graph = build_graph()