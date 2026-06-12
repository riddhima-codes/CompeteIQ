from tavily import TavilyClient
from core.config import settings

client = TavilyClient(api_key=settings.TAVILY_API_KEY)

def search_competitor(url: str, track: list) -> str:
    try:
        # Search for content about this URL
        result = client.search(
            query=f"site:{url} {' '.join(track)}",
            search_depth="advanced",
            max_results=5
        )
        # Extract and combine all content
        content = ""
        for r in result.get("results", []):
            content += r.get("content", "") + "\n\n"
        return content
    except Exception as e:
        return f"Error: {str(e)}"

def fetch_page(url: str) -> str:
    try:
        result = client.extract(urls=[url])
        return result.get("results", [{}])[0].get("text", "")
    except Exception as e:
        return f"Error: {str(e)}"