#! /usr/bin/env bash
# Copy openapi schema from backend and paste inside frontend dir, then generate client using openapi-ts

set -e
set -x

cd ..
cd backend
source .venv/bin/activate

PYTHONPATH=. python3 -c "import src, json; print(json.dumps(src.app.openapi()))" > openapi.json

cd ..
mv backend/openapi.json frontend/
cd frontend
npm run generate-client
#npx biome format --write ./src/client

