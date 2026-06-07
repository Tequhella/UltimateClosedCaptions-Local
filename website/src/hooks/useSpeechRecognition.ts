import { useEffect, useState } from "react";
import { TranscriptData } from "../context/SocketContext";

/** Temporary local test: inject fake captions without Web Speech API */
export function useSpeechRecognition( { handleText, lang, listening, splitDelay, delay }: {
		handleText: (transcript: TranscriptData) => void,
		lang?: string,
		listening: boolean,
		splitDelay: number,
		delay: number
	}
) {
	const [error, setError] = useState<string>();
	const [text, setText] = useState<string>('');

	useEffect(()=>{
		if(!listening) {
			setText('');
			return;
		}

		if(!lang) {
			setError('No language selected');
			return;
		}

		setError(undefined);

		let counter = 0;

		const interval = window.setInterval(() => {
			counter += 1;

			const fakeText = `Test local numéro ${counter}, sans Web Speech API`;

			setText(fakeText);

			handleText({
				text: fakeText,
				lang,
				duration: 1000,
				delay: 0,
				final: true,
				lineEnd: true
			});
		}, 3000);

		return () => {
			window.clearInterval(interval);
		};

	}, [ listening, lang, splitDelay, delay, handleText ]);

	return { error, text };
}