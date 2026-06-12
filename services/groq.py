from langchain_groq import ChatGroq
from core.config import settings

def get_llm():
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama-3.1-8b-instant",    # fast and free
        temperature=0.1             # low temp = consistent analysis
    )