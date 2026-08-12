FROM python:3.14-slim AS base
WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir -e . 2>/dev/null || pip install --no-cache-dir fastapi uvicorn httpx pydantic

FROM base AS development
COPY . .
ENV PYTHONDEVMODE=1
EXPOSE 8765
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8765", "--reload"]

FROM base AS production
COPY . .
EXPOSE 8765
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8765"]
