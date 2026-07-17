from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="todo")       # todo | in_progress | done
    priority = Column(String, nullable=False, default="medium")   # low | medium | high
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assignee_id])
    creator = relationship("User", foreign_keys=[created_by])
    attachments = relationship("Attachment", back_populates="task", cascade="all, delete-orphan")  # add this

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    filename = Column(String, nullable=False)       # original filename, for display
    file_url = Column(String, nullable=False)        # where it's actually stored
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="attachments")
    uploader = relationship("User")