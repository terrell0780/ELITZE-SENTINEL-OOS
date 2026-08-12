FROM python:3.12-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS production
COPY main.py .
EXPOSE 8025
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8025"]
