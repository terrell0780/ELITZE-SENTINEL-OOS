FROM python:3.14-slim AS base
WORKDIR /app

COPY pyproject.toml README.md ARCHITECTURE.md ./
COPY src/ src/
RUN pip install --no-cache-dir -e . 2>/dev/null || pip install --no-cache-dir pydantic fastapi uvicorn

EXPOSE 8048
CMD ["python", "-m", "uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8048"]
