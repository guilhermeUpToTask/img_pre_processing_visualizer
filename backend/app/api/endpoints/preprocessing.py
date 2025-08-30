from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ResizeParams(BaseModel):
    width: int
    height: int

class BlurParams(BaseModel):
    radius: float

@router.post("/resize")
async def resize_image(params: ResizeParams, image: UploadFile = File(...)):
    return {"message": f"Image resized to {params.width}x{params.height}"}

@router.post("/grayscale")
async def grayscale_image(image: UploadFile = File(...)):
    return {"message": "Image converted to grayscale"}

@router.post("/blur")
async def blur_image(params: BlurParams, image: UploadFile = File(...)):
    return {"message": f"Image blurred with radius {params.radius}"}
