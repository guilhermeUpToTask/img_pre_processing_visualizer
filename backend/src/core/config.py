from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Image Pre-processing Visualizer"
    all_cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://frontend.docker.localhost"
    ]
settings = Settings()
