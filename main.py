from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

import models, schemas, auth
from database import engine, get_db

# Spin up database tables instantly
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager API")

# Perfect catch-all configuration for your network IP (10.19.72.35)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AUTH API ----------------
@app.post("/api/auth/signup", response_model=schemas.UserResponse, status_code=201)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.hash_password(user_data.password)
    new_user = models.User(
        name=user_data.name, 
        email=user_data.email, 
        password=hashed_pwd, 
        role=user_data.role if user_data.role else "Member"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login")
def login(form_data: schemas.UserCreate, db: Session = Depends(get_db)):  # Simplifies schema re-use
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {
        "token": access_token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }

@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.User).all()

# ---------------- PROJECTS API ----------------
@app.post("/api/projects", response_model=schemas.ProjectResponse, status_code=201)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    new_project = models.Project(name=project.name, description=project.description, admin_id=admin.id)
    if project.member_ids:
        members = db.query(models.User).filter(models.User.id.in_(project.member_ids)).all()
        new_project.members = members
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.get("/api/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == "Admin":
        return db.query(models.Project).all()
    return db.query(models.Project).join(models.Project.members).filter(models.User.id == current_user.id).all()

# ---------------- TASKS API ----------------
@app.post("/api/tasks", response_model=schemas.TaskResponse, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    new_task = models.Task(**task.model_dump())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.get("/api/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == "Admin":
        return db.query(models.Task).all()
    return db.query(models.Task).filter(models.Task.assigned_to == current_user.id).all()

@app.patch("/api/tasks/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, status_update: schemas.TaskStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if current_user.role != "Admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to alter this task status")
    
    task.status = status_update.status
    db.commit()
    db.refresh(task)
    return task

# ---------------- DASHBOARD METRICS ----------------
@app.get("/api/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Task)
    if current_user.role != "Admin":
        query = query.filter(models.Task.assigned_to == current_user.id)
    
    tasks = query.all()
    
    # Modern, timezone-aware UTC standardization
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    
    todo_count = sum(1 for t in tasks if t.status == "To Do")
    progress_count = sum(1 for t in tasks if t.status == "In Progress")
    done_count = sum(1 for t in tasks if t.status == "Done")
    overdue_tasks = [t for t in tasks if t.status != "Done" and t.due_date < now]
    
    return {
        "totalTasks": len(tasks),
        "todo": todo_count,
        "inProgress": progress_count,
        "done": done_count,
        "overdue": len(overdue_tasks),
        "overdueTasks": [{"id": t.id, "title": t.title, "due_date": t.due_date} for t in overdue_tasks]
    }