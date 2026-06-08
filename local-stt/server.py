from flask import Flask, request, jsonify
import whisper
import tempfile
import os

app = Flask(__name__)

print("[local-stt] loading whisper model...", flush=True)
model = whisper.load_model("small")
print("[local-stt] model loaded", flush=True)

@app.get("/health")
def health():
    return {"ready": True}

@app.post("/transcribe")
def transcribe():
    audio = request.files.get("audio")
    if audio is None:
        return jsonify({"error": "missing audio"}), 400

    fd, path = tempfile.mkstemp(suffix=".webm")
    os.close(fd)

    try:
        audio.save(path)
        print("[local-stt] transcribing ...", flush=True)

        result = model.transcribe(
            path,
            language="fr",
            task="transcribe",
            fp16=False,
            temperature=0,
            condition_on_previous_text=False,
            no_speech_threshold=0.6,
        )

        return jsonify({"text": result.get("text", "").strip()})
    finally:
        try:
            os.remove(path)
        except OSError:
            pass

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)