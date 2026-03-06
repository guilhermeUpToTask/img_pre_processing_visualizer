import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from src.core.middlewares import ErrorHandlingMiddleware

app = FastAPI()
app.add_middleware(ErrorHandlingMiddleware)

@app.get("/test-error")
def test_error_endpoint():
    raise ValueError("This is a deliberate test error")

client = TestClient(app)

def test_error_handling_middleware():
    response = client.get("/test-error")
    
    assert response.status_code == 500
    assert response.json() == {"detail": "An unexpected error occurred. Please try again later."}

