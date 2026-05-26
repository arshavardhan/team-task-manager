from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base
import datetime

# Link table for Many-to-Many relationship between Users and Projects
project_members = Table(
    "project_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="Member") # 'Admin' or 'Member'
    
    tasks = relationship("Task", back_populates="assignee")
    projects = relationship("Project", secondary=project_members, back_populates="members")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    admin_id = Column(Integer, ForeignKey("users.id"))
    
    members = relationship("User", secondary=project_members, back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default="To Do") # 'To Do', 'In Progress', 'Done'
    due_date = Column(DateTime, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks")