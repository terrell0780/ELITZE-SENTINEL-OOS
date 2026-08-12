FROM python:3.14-slim AS base
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install protobuf compiler for generating Python stubs
RUN apt-get update && apt-get install -y protobuf-compiler && rm -rf /var/lib/apt/lists/*

FROM base AS development
COPY . .
RUN python -m grpc_tools.protoc \
    --proto_path=proto \
    --python_out=src/generated \
    --grpc_python_out=src/generated \
    proto/gaming_compiler.proto
EXPOSE 8775 5678
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "src/compiler_service.py"]

FROM base AS production
COPY . .
RUN python -m grpc_tools.protoc \
    --proto_path=proto \
    --python_out=src/generated \
    --grpc_python_out=src/generated \
    proto/gaming_compiler.proto
EXPOSE 8771 8775
CMD ["python", "src/http_server.py"]