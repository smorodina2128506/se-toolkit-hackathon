from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class ProductCreate(BaseModel):
    name: str
    expiry_date: date
    category: Optional[str] = None


class ProductOut(BaseModel):
    id: int
    name: str
    expiry_date: date
    category: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
