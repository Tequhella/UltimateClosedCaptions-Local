from flask import Flask, request, jsonify
import argostranslate.package
import argostranslate.translate

app = Flask(__name__)

INSTALLED = False

def ensure_model_installed():
    global INSTALLED

    if INSTALLED:
        return

    print("[local-translate] updating package index...", flush=True)
    argostranslate.package.update_package_index()

    available_packages = argostranslate.package.get_available_packages()

    package = next(
        (
            p for p in available_packages
            if p.from_code == "fr" and p.to_code == "en"
        ),
        None
    )

    if package is None:
        raise RuntimeError("No Argos package found for fr -> en")

    installed_languages = argostranslate.translate.get_installed_languages()

    already_installed = any(
        lang.code == "fr"
        and any(
            getattr(getattr(t, "to_lang", None), "code", None) == "en"
            for t in lang.translations_from
        )
        for lang in installed_languages
    )

    if not already_installed:
        print("[local-translate] downloading fr -> en model...", flush=True)
        path = package.download()
        print("[local-translate] installing fr -> en model...", flush=True)
        argostranslate.package.install_from_path(path)

    INSTALLED = True
    print("[local-translate] ready", flush=True)

@app.get("/health")
def health():
    try:
        ensure_model_installed()
        return {"ready": True}
    except Exception as e:
        return {"ready": False, "error": str(e)}, 500

@app.post("/translate")
def translate():
    try:
        ensure_model_installed()

        data = request.get_json(force=True)
        text = data.get("text", "")
        source = data.get("source", "fr")
        target = data.get("target", "en")

        if not text.strip():
            return jsonify({"text": ""})

        if source != "fr" or target != "en":
            return jsonify({
                "error": f"Unsupported translation: {source} -> {target}"
            }), 400

        translated = argostranslate.translate.translate(text, source, target)

        return jsonify({
            "text": translated,
            "source": source,
            "target": target,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    ensure_model_installed()
    app.run(host="0.0.0.0", port=5006)
