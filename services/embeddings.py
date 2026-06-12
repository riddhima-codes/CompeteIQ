from sentence_transformers import SentenceTransformer
from typing import List

# Load once at startup — don't reload on every request
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> List[float]:
    embedding = model.encode(text)
    return embedding.tolist()

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    import numpy as np
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))