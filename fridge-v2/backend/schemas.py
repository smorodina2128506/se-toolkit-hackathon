from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class ProductCreate(BaseModel):
    name: str
    expiry_date: date
    category: Optional[str] = None
    quantity: int = Field(default=1, ge=1)


class ProductOut(BaseModel):
    id: int
    name: str
    expiry_date: date
    category: Optional[str]
    quantity: int
    created_at: datetime

    model_config = {"from_attributes": True}
