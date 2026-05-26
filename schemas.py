from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Member"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "To Do"
    due_date: datetime
    project_id: int
    assigned_to: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskStatusUpdate(BaseModel):
    status: str

class TaskResponse(TaskBase):
    id: int
    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    member_ids: List[int] = []

class ProjectResponse(ProjectBase):
    id: int
    admin_id: int
    members: List[UserResponse] = []
    class Config:
        from_attributes = True