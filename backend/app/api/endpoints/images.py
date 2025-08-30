from fastapi import APIRouter

router = APIRouter()

@router.get("/images")
def get_images():
    return {"message": "Get images"}

@router.post("/images")
def create_image():
    return {"message": "Create image"}
