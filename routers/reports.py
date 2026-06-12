from fastapi import APIRouter, Depends, HTTPException, Query
from core.database import get_db
from core.middleware import get_current_user, get_optional_user
from bson import ObjectId
from typing import Optional
from datetime import datetime

router = APIRouter()

@router.get("/")
async def get_all_reports(
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    reports = await db.analyses.find(
        {"user_id": user_id},
        {"embeddings": 0}
    ).sort("created_at", -1).to_list(100)

    for r in reports:
        r["id"] = str(r["_id"])
        del r["_id"]
    return reports

@router.get("/competitor/{competitor_id}")
async def get_reports_by_competitor(
    competitor_id: str,
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    reports = await db.analyses.find(
        {
            "competitor_id": competitor_id,
            "user_id": user_id
        },
        {"embeddings": 0}
    ).sort("created_at", -1).to_list(50)

    for r in reports:
        r["id"] = str(r["_id"])
        del r["_id"]
    return reports

@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    report = await db.analyses.find_one(
        {
            "_id": ObjectId(report_id),
            "user_id": user_id
        },
        {"embeddings": 0}
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report["id"] = str(report["_id"])
    del report["_id"]
    return report

@router.get("/changes/all")
async def get_change_reports(
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    reports = await db.analyses.find(
        {
            "user_id": user_id,
            "change_detected": True
        },
        {"embeddings": 0}
    ).sort("created_at", -1).to_list(50)

    for r in reports:
        r["id"] = str(r["_id"])
        del r["_id"]
    return reports

@router.get("/filter/date")
async def get_reports_by_date(
    start_date: str = Query(..., description="Format: YYYY-MM-DD"),
    end_date: str = Query(..., description="Format: YYYY-MM-DD"),
    current_user=Depends(get_optional_user),
    db=Depends(get_db)
):
    user_id = current_user["user_id"] if current_user else "guest"
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    reports = await db.analyses.find(
        {
            "user_id": user_id,
            "created_at": {"$gte": start, "$lte": end}
        },
        {"embeddings": 0}
    ).sort("created_at", -1).to_list(100)

    for r in reports:
        r["id"] = str(r["_id"])
        del r["_id"]
    return reports