from flask import Flask, request, jsonify
import whisper
import tempfile
import os

app = Flask(__name__)

print("[local-stt] loading whisper model...")
model = whisper.load_model("base")
print("[local-stt] model loaded")

@app.post("/transcribe")
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "missing audio file"}), 400

    audio = request.files["audio"]

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        path = f.name
        audio.save(path)

    try:
        result = model.transcribe(path, language="fr")
        text = (result.get("text") or "").strip()
        return jsonify({
            "text": text,
            "lang": "fr"
        })
    finally:
        try:
            os.remove(path)
        except OSError:
            pass

@app.get("/health")
def health():
    return jsonify({"ok": True})


app.run(host="0.0.0.0", port=5005)