FROM python:3.11-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir openai-whisper flask

COPY server.py /app/server.py

EXPOSE 5005

CMD ["python", "/app/server.py"]
