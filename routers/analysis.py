from fastapi import APIRouter, Depends, HTTPException
from core.database import get_db
from core.middleware import get_current_user, get_optional_user
from agents.graph import analysis_graph
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/{competitor_id}/run")
async def run_analysis(
    competitor_id: str,
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"

    # Get competitor
    competitor = await db.competitors.find_one({
        "_id": ObjectId(competitor_id),
        "user_id": user_id
    })
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")

    previous_analysis = await db.analyses.find_one(
        {
            "competitor_id": competitor_id,
            "user_id": user_id
        },
        sort=[("created_at", -1)]
    )
    previous_embeddings = previous_analysis.get("embeddings") if previous_analysis else None

    # Build initial state
    initial_state = {
        "competitor_id": competitor_id,
        "competitor_name": competitor["name"],
        "website_url": competitor["website_url"],
        "pages_to_monitor": competitor.get("pages_to_monitor", []),
        "track": competitor.get("track", ["all"]),
        "scraped_content": {},
        "scrape_error": None,
        "analysis_summary": "",
        "key_insights": [],
        "pricing_info": None,
        "features_info": None,
        "embeddings": [],
        "previous_embeddings": previous_embeddings,
        "change_detected": False,
        "change_summary": None,
        "report": {},
    }

    # Run LangGraph
    final_state = analysis_graph.invoke(initial_state)

    # Save report to MongoDB
    report = final_state["report"]
    report["user_id"] = user_id
    result = await db.analyses.insert_one(report)

    # Update competitor last_monitored
    await db.competitors.update_one(
        {"_id": ObjectId(competitor_id)},
        {"$set": {"last_monitored": datetime.utcnow()}}
    )

    return {
        "id": str(result.inserted_id),
        "analysis_summary": report["analysis_summary"],
        "key_insights": report["key_insights"],
        "change_detected": report["change_detected"]
    }

@router.get("/{competitor_id}/history")
async def analysis_history(
    competitor_id: str,
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    analyses = await db.analyses.find(
        {
            "competitor_id": competitor_id,
            "user_id": user_id
        },
        {"embeddings": 0}
    ).sort("created_at", -1).to_list(20)

    for a in analyses:
        a["id"] = str(a["_id"])
        del a["_id"]
    return analyses

@router.get("/latest/{competitor_id}")
async def latest_analysis(
    competitor_id: str,
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    analysis = await db.analyses.find_one(
        {
            "competitor_id": competitor_id,
            "user_id": user_id
        },
        sort=[("created_at", -1)]
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")
    analysis["id"] = str(analysis["_id"])
    del analysis["_id"]
    return analysis