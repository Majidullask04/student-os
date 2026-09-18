from pydantic import BaseModel
from typing import List, Optional

class SubTask(BaseModel):
    id: str
    title: str
    completed: bool = False

class RoadmapTask(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    type: str = "Theory"
    level: str = "Core"
    estimatedHours: int = 3
    completed: bool = False
    inProgress: Optional[bool] = False
    subTasks: Optional[List[SubTask]] = None
    dependencies: Optional[List[str]] = None
    resourcesCount: Optional[int] = 2

class RoadmapModule(BaseModel):
    id: str
    number: int
    title: str
    description: str
    status: str
    totalTasks: int
    completedTasks: int
    percentage: int
    tasks: List[RoadmapTask]
    whyThisStep: Optional[str] = None

class ProgressUpdate(BaseModel):
    taskId: str
    completed: bool
    subTaskId: Optional[str] = None
