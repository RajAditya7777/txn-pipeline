FROM python:3.11-slim

WORKDIR /app

# We use psycopg2-binary, but install gcc/libpq just in case there's any compiling needed
# for other dependencies like pandas or strictly for psycopg2 if binary fails.
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies securely
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Ensure the shared uploads directory exists
RUN mkdir -p /app/uploads

# Ensure Python can resolve the app module correctly
ENV PYTHONPATH=/app

# Expose port for FastAPI
EXPOSE 8000

# The default command will be overridden by docker-compose for api/worker respectively
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
