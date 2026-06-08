FROM python:3.11-slim

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir flask argostranslate

COPY server.py /app/server.py

EXPOSE 5006

CMD ["python", "/app/server.py"]
