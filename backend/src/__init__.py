from fastapi import FastAPI
from src.api.endpoints import preprocessing
from starlette.middleware.cors import CORSMiddleware
from src.core.config import settings

app = FastAPI()

app.include_router(preprocessing.router, prefix="/api/v1/preprocess", tags=["preprocessing"])
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
