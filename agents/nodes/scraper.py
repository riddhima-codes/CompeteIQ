from agents.state import CompetitorState
from services.tavily import search_competitor, fetch_page

def scraper_node(state: CompetitorState) -> CompetitorState:
    print(f"Scraping {state['competitor_name']}...")
    
    scraped = {}
    
    # Scrape main website
    main_content = search_competitor(
        state["website_url"],
        state["track"]
    )
    scraped[state["website_url"]] = main_content
    
    # Scrape specific pages if provided
    for page_url in state["pages_to_monitor"]:
        content = fetch_page(page_url)
        scraped[page_url] = content
        print(f"Scraped: {page_url}")
    
    state["scraped_content"] = scraped
    state["scrape_error"] = None
    return state