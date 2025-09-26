from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Image Pre-processing Visualizer"

settings = Settings()
