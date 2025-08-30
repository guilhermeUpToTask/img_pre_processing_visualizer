from fastapi import FastAPI
from app.api.endpoints import images, preprocessing

app = FastAPI()

app.include_router(images.router, prefix="/api/v1", tags=["images"])
app.include_router(preprocessing.router, prefix="/api/v1/preprocess", tags=["preprocessing"])
