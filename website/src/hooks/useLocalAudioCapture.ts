import { useEffect, useRef, useState } from "react";

const SEGMENT_MS = 7000;

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

    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stoppedRef = useRef<boolean>(true);

    useEffect(() => {
        async function startCapture() {
            try {
                setError(undefined);
                setText("Micro local actif");
                stoppedRef.current = false;

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        channelCount: 1,
                    },
                });

                streamRef.current = stream;
                audioStart();

                startSegment(stream);
            } catch (e) {
                console.error("Local audio capture error", e);
                setError("Impossible d'accéder au micro local");
            }
        }

        function startSegment(stream: MediaStream) {
            if (stoppedRef.current) return;

            const chunks: Blob[] = [];

            const recorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });

            recorderRef.current = recorder;

            recorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onerror = event => {
                console.error("MediaRecorder error", event);
                setError("Erreur MediaRecorder");
            };

            recorder.onstop = () => {
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: "audio/webm" });
                    audioData(blob);
                }

                if (!stoppedRef.current && streamRef.current) {
                    startSegment(streamRef.current);
                }
            };

            recorder.start();

            timerRef.current = setTimeout(() => {
                if (recorder.state === "recording") {
                    recorder.stop();
                }
            }, SEGMENT_MS);
        }

        function stopCapture() {
            stoppedRef.current = true;

            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            if (recorderRef.current?.state === "recording") {
                recorderRef.current.stop();
            }

            recorderRef.current = null;

            streamRef.current?.getTracks().forEach(track => track.stop());
            streamRef.current = null;

            audioEnd();
            setText("");
        }

        if (listening) {
            startCapture();
        } else {
            stopCapture();
        }

        return () => {
            stopCapture();
        };
    }, [listening, audioStart, audioData, audioEnd]);

    return { error, text };
}