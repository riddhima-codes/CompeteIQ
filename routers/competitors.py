from fastapi import APIRouter, Depends, HTTPException
from core.database import get_db
from core.middleware import get_current_user, get_optional_user
from models.competitor import CompetitorCreate, CompetitorUpdate
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def add_competitor(
    data: CompetitorCreate,
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"

    existing = await db.competitors.find_one({
        "website_url": data.website_url,
        "user_id": user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Competitor already added")

    doc = {
        **data.dict(),
        "user_id": user_id,
        "created_at": datetime.utcnow(),
        "last_monitored": None,
        "status": "active"
    }
    result = await db.competitors.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Competitor added"}

@router.get("/")
async def list_competitors(
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    competitors = await db.competitors.find(
        {"user_id": user_id}
    ).to_list(100)
    for c in competitors:
        c["id"] = str(c["_id"])
        del c["_id"]
    return competitors

@router.get("/{competitor_id}")
async def get_competitor(
    competitor_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    competitor = await db.competitors.find_one({
        "_id": ObjectId(competitor_id),
        "user_id": current_user["user_id"]
    })
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")
    competitor["id"] = str(competitor["_id"])
    del competitor["_id"]
    return competitor

@router.put("/{competitor_id}")
async def update_competitor(
    competitor_id: str,
    data: CompetitorUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    await db.competitors.update_one(
        {
            "_id": ObjectId(competitor_id),
            "user_id": current_user["user_id"]
        },
        {"$set": update_data}
    )
    return {"message": "Competitor updated"}

@router.delete("/{competitor_id}")
async def delete_competitor(
    competitor_id: str,
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    await db.competitors.delete_one({
        "_id": ObjectId(competitor_id),
        "user_id": user_id
    })
    return {"message": "Competitor deleted"}