import { useEffect, useRef, useState } from "react";

export function useLocalAudioCapture({
    listening,
    audioStart,
    audioData,
    audioEnd,
}: {
    listening: boolean;
    audioStart: () => void;
    audioData: (data: Blob) => void;
    audioEnd: () => void;
}) {
    const [error, setError] = useState<string>();
    const [text, setText] = useState<string>("");
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function start() {
            try {
                setError(undefined);
                setText("Micro local actif");

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

                if (cancelled) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = stream;

                const recorder = new MediaRecorder(stream, {
                    mimeType: "audio/webm",
                });

                recorderRef.current = recorder;

                recorder.ondataavailable = event => {
                    if (event.data && event.data.size > 0) {
                        audioData(event.data);
                    }
                };

                recorder.onerror = event => {
                    console.error("MediaRecorder error", event);
                    setError("Erreur MediaRecorder");
                };

                audioStart();

                // Envoie un morceau audio toutes les 500 ms
                recorder.start(500);
            } catch (e) {
                console.error("Local audio capture error", e);
                setError("Impossible d'accéder au micro local");
            }
        }

        function stop() {
            recorderRef.current?.stop();
            recorderRef.current = null;

            streamRef.current?.getTracks().forEach(track => track.stop());
            streamRef.current = null;

            audioEnd();
            setText("");
        }

        if (listening) {
            start();
        } else {
            stop();
        }

        return () => {
            cancelled = true;
            stop();
        };
    }, [listening, audioStart, audioData, audioEnd]);

    return { error, text };
}
