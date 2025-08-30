from enum import Enum, StrEnum, auto
from io import BytesIO
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import StreamingResponse
import numpy as np
from pydantic import BaseModel
from typing import Optional
from PIL import Image, ImageOps
import cv2

router = APIRouter()


# TODO: needs the openCV2 comparasion to better results
class ResizeParams(BaseModel):
    width: int
    height: int


class BlurParams(BaseModel):
    radius: float


class NoiseReductionParams(BaseModel):
    a: int


class NormalizationTechiniques(StrEnum):
    RESCALING = auto()
    HISTOGRAM_EQUALIZATION = auto()


class NormalizationParams(BaseModel):
    technique: NormalizationTechiniques


class BinarizationParams(BaseModel):
    a: int


async def open_img(img: UploadFile) -> Image.Image:
    img_bytes = BytesIO(await img.read())

    return Image.open(img_bytes)


@router.post("/resize")
async def resize_image(params: ResizeParams, img_in: UploadFile = File(...)):

    img = await open_img(img_in)
    resized_img = img.resize((params.width, params.height))

    buf = BytesIO()
    resized_img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")


@router.post("/crop")
async def crop_image(img_in: UploadFile = File(...)):
    img = await open_img(img_in)

    width, heigth = img.size
    size = min(width, heigth)
    left = (width - size) / 2
    top = (heigth - size) / 2
    right = (width + size) / 2
    bottom = (heigth + size) / 2

    cropped_img = img.crop((left, top, right, bottom))

    buf = BytesIO()
    cropped_img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")


@router.post("/grayscale")
async def grayscale_image(img_in: UploadFile = File(...)):
    img_bytes = BytesIO(await img_in.read())
    img = Image.open(img_bytes)
    img.convert("HSV")

    return {"message": "Image converted to grayscale"}


@router.post("/noise_reduction")
async def noise_reduct_image(params: BlurParams, image: UploadFile = File(...)):
    #TODO: gaussian Blur
    #TODO: Median Blur
    #TODO: Laplacian Filter
    #TODO: Unsharp Masking
    #TODO: Bilateral Filter
    #TODO: Thresholding
    #TODO: Edge Detection
    #TODO: Region Growing
    #TODO: Watershed
    #TODO: Color Manipulation
    
    
    
    return {"message": f"Image blurred with radius {params.radius}"}


@router.post("/normalization")
async def normalize_image(params: NormalizationParams, img_in: UploadFile = File(...)):
    img = await open_img(img_in)
    
    if params.technique == NormalizationTechiniques.RESCALING:
        pixels = np.array(img)
        normalized_pixels = pixels / 255.0
        img = Image.fromarray((normalized_pixels * 255).astype(np.uint8))

    if params.technique == NormalizationTechiniques.HISTOGRAM_EQUALIZATION:
        img = ImageOps.equalize(img, mask=None)
        


    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")

    


@router.post("/binarization")
async def binarize_image(params, image: UploadFile = File(...)):
    return {}


@router.post("/contrast")
async def enhance_contrast_image(params, image: UploadFile = File(...)):
    return {}
