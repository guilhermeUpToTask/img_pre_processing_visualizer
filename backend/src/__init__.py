from fastapi import FastAPI
from src.api.endpoints import preprocessing

app = FastAPI()

app.include_router(preprocessing.router, prefix="/api/v1/preprocess", tags=["preprocessing"])
