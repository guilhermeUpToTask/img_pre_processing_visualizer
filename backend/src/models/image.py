from pydantic import BaseModel

class Image(BaseModel):
    id: int
    name: str
