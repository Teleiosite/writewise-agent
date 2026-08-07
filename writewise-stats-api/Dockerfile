FROM python:3.11-slim

WORKDIR /app

# Install system deps required by scientific Python libraries
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install Python scientific stack (pinned for reproducibility)
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8000

# Run with 2 workers (matches 2 OCPUs on Oracle A1)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--timeout-keep-alive", "120"]
