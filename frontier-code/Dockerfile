FROM python:3.14-slim AS base
WORKDIR /app

COPY pyproject.toml README.md ./
COPY src/ src/
RUN pip install --no-cache-dir -e . 2>/dev/null || pip install --no-cache-dir httpx rich pygments click

EXPOSE 8046
CMD ["python", "-m", "uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8046"]
