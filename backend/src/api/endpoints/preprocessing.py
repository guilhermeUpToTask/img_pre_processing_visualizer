from enum import StrEnum, auto
from io import BytesIO

import cv2
import numpy as np
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()


class NoiseReductionTechniques(StrEnum):
    """Techniques for noise reduction."""

    GAUSSIAN_BLUR = auto()
    MEDIAN_BLUR = auto()
    BILATERAL_FILTER = auto()


class NormalizationTechniques(StrEnum):
    """Techniques for image normalization."""

    RESCALING = auto()
    HISTOGRAM_EQUALIZATION = auto()


class BinarizationTechniques(StrEnum):
    """Techniques for image binarization."""

    BINARY = auto()
    BINARY_INV = auto()
    TRUNC = auto()
    TOZERO = auto()
    TOZERO_INV = auto()


class ContrastTechniques(StrEnum):
    """Techniques for contrast enhancement."""

    CLAHE = auto()


async def open_img(img: UploadFile) -> np.ndarray:
    """Open an image from an UploadFile object.

    Args:
        img: The image to open.

    Returns:
        The image as a numpy array.
    """
    img_bytes = await img.read()
    img_array = np.frombuffer(img_bytes, np.uint8)
    decoded_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if decoded_img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    return decoded_img


def encode_img(img: np.ndarray) -> BytesIO:
    """Encode an image to a BytesIO object.

    Args:
        img: The image to encode.

    Returns:
        The encoded image as a BytesIO object.
    """
    _, encoded_img = cv2.imencode(".png", img)
    buf = BytesIO(encoded_img)
    buf.seek(0)
    return buf


@router.post("/resize")
async def resize_image(
    width: int = Query(..., description="Target width in pixels"),
    height: int = Query(..., description="Target height in pixels"),
    img_in: UploadFile = File(...),
) -> StreamingResponse:
    """Resize an image.

    Args:
        params: The resize parameters.
        img_in: The image to resize.

    Returns:
        The resized image.

    Sources:
        https://docs.opencv.org/4.x/da/d54/group__imgproc__transform.html#ga47a974309e9102f5f08231edc7e7529d
    """
    img = await open_img(img_in)
    resized_img = cv2.resize(img, (width, height))
    buf = encode_img(resized_img)
    return StreamingResponse(buf, media_type="image/png")


@router.post("/crop")
async def crop_image(img_in: UploadFile = File(...)) -> StreamingResponse:
    """Crop an image to a square in the center.

    Args:
        img_in: The image to crop.

    Returns:
        The cropped image.
    """
    img = await open_img(img_in)
    height, width, _ = img.shape
    size = min(width, height)
    left = (width - size) // 2
    top = (height - size) // 2
    right = (width + size) // 2
    bottom = (height + size) // 2
    cropped_img = img[top:bottom, left:right]
    buf = encode_img(cropped_img)
    return StreamingResponse(buf, media_type="image/png")


@router.post("/grayscale")
async def grayscale_image(img_in: UploadFile = File(...)) -> StreamingResponse:
    """Convert an image to grayscale.

    Args:
        img_in: The image to convert.

    Returns:
        The grayscaled image.

    Sources:
        https://docs.opencv.org/4.x/d8/d01/group__imgproc__color__conversions.html#ga397ae87e1288a81d2363b61574eb8cab
    """
    img = await open_img(img_in)
    grayscale_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    buf = encode_img(grayscale_img)
    return StreamingResponse(buf, media_type="image/png")


@router.post("/noise_reduction")
async def noise_reduct_image(
    technique: NoiseReductionTechniques = Query(
        ..., description="Noise reduction technique"
    ),
    kernel_size: int = Query(5, description="Kernel size (odd for median)"),
    sigma_color: float = Query(75.0, description="SigmaColor for bilateral filter"),
    sigma_space: float = Query(75.0, description="SigmaSpace for bilateral filter"),
    image: UploadFile = File(...),
) -> StreamingResponse:
    """Apply noise reduction to an image.

    Args:
        params: The noise reduction parameters.
        image: The image to process.

    Returns:
        The processed image.

    Sources:
        - Gaussian Blur: https://docs.opencv.org/4.x/d4/d86/group__imgproc__filter.html#gaabe8c836e97159a9193fb0b11ac52cf1
        - Median Blur: https://docs.opencv.org/4.x/d4/d86/group__imgproc__filter.html#ga564869aa33e58769b4469101aac458f9
        - Bilateral Filter: https://docs.opencv.org/4.x/d4/d86/group__imgproc__filter.html#ga9d7064d478c95d60003cf859260703f
    """
    img = await open_img(image)
    kernel = (kernel_size, kernel_size)
    processed_img = None

    if technique == NoiseReductionTechniques.GAUSSIAN_BLUR:
        processed_img = cv2.GaussianBlur(img, kernel, 0)
    elif technique == NoiseReductionTechniques.MEDIAN_BLUR:
        if kernel_size % 2 == 0:
            raise HTTPException(
                status_code=400,
                detail="Kernel size for median blur must be an odd number",
            )
        processed_img = cv2.medianBlur(img, kernel_size)
    elif technique == NoiseReductionTechniques.BILATERAL_FILTER:
        processed_img = cv2.bilateralFilter(img, kernel_size, sigma_color, sigma_space)

    if processed_img is None:
        raise HTTPException(status_code=400, detail="Invalid noise reduction technique")

    buf = encode_img(processed_img)
    return StreamingResponse(buf, media_type="image/png")


@router.post("/normalization")
async def normalize_image(
    technique: NormalizationTechniques = Query(
        ..., description="Normalization technique"
    ),
    img_in: UploadFile = File(...),
) -> StreamingResponse:
    """Normalize an image.

    Args:
        params: The normalization parameters.
        img_in: The image to normalize.

    Returns:
        The normalized image.

    Sources:
        - Rescaling: https://docs.opencv.org/4.x/d2/de8/group__core__array.html#ga87eef7ee3970f86906d1e9d701839f6e
        - Histogram Equalization: https://docs.opencv.org/4.x/d6/dc7/group__imgproc__hist.html#ga7e54091f0c937d49bf84152a16f76d6e
    """
    img = await open_img(img_in)
    processed_img = None

    if technique == NormalizationTechniques.RESCALING:
        if len(img.shape) == 3:
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            dst = np.empty_like(l)
            cv2.normalize(l, dst=dst, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
            merged = cv2.merge([dst, a, b])
            processed_img = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
        else:
            dst = np.empty_like(img)
            processed_img = cv2.normalize(
                img, dst=dst, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX
            )
    elif technique == NormalizationTechniques.HISTOGRAM_EQUALIZATION:
        if len(img.shape) == 3:
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            equalized_l = cv2.equalizeHist(l)
            merged = cv2.merge([equalized_l, a, b])
            processed_img = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
        else:
            processed_img = cv2.equalizeHist(img)

    if processed_img is None:
        raise HTTPException(status_code=400, detail="Invalid normalization technique")

    buf = encode_img(processed_img)
    return StreamingResponse(buf, media_type="image/png")


@router.post("/binarization")
async def binarize_image(
    technique: BinarizationTechniques = Query(
        ..., description="Binarization technique"
    ),
    threshold: int = Query(127, description="Threshold value"),
    image: UploadFile = File(...),
) -> StreamingResponse:
    """Binarize an image.

    Args:
        params: The binarization parameters.
        image: The image to binarize.

    Returns:
        The binarized image.

    Sources:
        https://docs.opencv.org/4.x/d7/d4d/group__imgproc__threshold.html#ga72b913f352e4a1b1b397736707afcde3
    """
    img = await open_img(image)
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    technique_map = {
        BinarizationTechniques.BINARY: cv2.THRESH_BINARY,
        BinarizationTechniques.BINARY_INV: cv2.THRESH_BINARY_INV,
        BinarizationTechniques.TRUNC: cv2.THRESH_TRUNC,
        BinarizationTechniques.TOZERO: cv2.THRESH_TOZERO,
        BinarizationTechniques.TOZERO_INV: cv2.THRESH_TOZERO_INV,
    }

    _, processed_img = cv2.threshold(gray_img, threshold, 255, technique_map[technique])

    buf = encode_img(processed_img)
    return StreamingResponse(buf, media_type="image/png")


@router.post("/contrast")
async def enhance_contrast_image(
    technique: ContrastTechniques = Query(..., description="Contrast technique"),
    clip_limit: float = Query(2.0, description="CLAHE clip limit"),
    tile_grid_size: int = Query(8, description="CLAHE tile grid size"),
    image: UploadFile = File(...),
) -> StreamingResponse:
    """Enhance the contrast of an image.

    Args:
        params: The contrast enhancement parameters.
        image: The image to process.

    Returns:
        The processed image.

    Sources:
        https://docs.opencv.org/4.x/d6/dc7/group__imgproc__hist.html#a5d2d804e716140362f3b9b191447b393
    """
    img = await open_img(image)
    processed_img = None

    if technique == ContrastTechniques.CLAHE:
        if len(img.shape) == 3:
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(
                clipLimit=clip_limit,
                tileGridSize=(tile_grid_size, tile_grid_size),
            )
            clahe_l = clahe.apply(l)
            merged = cv2.merge([clahe_l, a, b])
            processed_img = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
        else:
            clahe = cv2.createCLAHE(
                clipLimit=clip_limit,
                tileGridSize=(tile_grid_size, tile_grid_size),
            )
            processed_img = clahe.apply(img)

    if processed_img is None:
        raise HTTPException(
            status_code=400, detail="Invalid contrast enhancement technique"
        )

    buf = encode_img(processed_img)
    return StreamingResponse(buf, media_type="image/png")
