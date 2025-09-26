from pydantic import BaseModel

class PreprocessingTask(BaseModel):
    task_id: str
    status: str
