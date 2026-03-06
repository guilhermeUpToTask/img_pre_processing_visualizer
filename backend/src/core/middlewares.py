import json
import logging
import traceback

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# Configure basic logging to stdout (simulating structured JSON for now)
logger = logging.getLogger("img_api")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(handler)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            error_data = {
                "error": "Internal Server Error",
                "message": str(e),
                "path": request.url.path,
                "method": request.method,
                "traceback": traceback.format_exc(),
            }
            logger.error(json.dumps(error_data))
            
            # Return a cleaned up version to the client
            return JSONResponse(
                status_code=500,
                content={"detail": "An unexpected error occurred. Please try again later."},
            )
