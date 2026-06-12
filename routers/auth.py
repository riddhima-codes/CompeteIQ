from fastapi import APIRouter, HTTPException, Depends
from core.database import get_db
from core.security import hash_password, verify_password, create_token
from models.user import UserCreate, UserLogin

router = APIRouter()

@router.post("/register")
async def register(data: UserCreate, db=Depends(get_db)):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password)
    }
    result = await db.users.insert_one(user_doc)
    return {
        "message": "Registered successfully",
        "user_id": str(result.inserted_id)
    }

@router.post("/login")
async def login(data: UserLogin, db=Depends(get_db)):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"user_id": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}