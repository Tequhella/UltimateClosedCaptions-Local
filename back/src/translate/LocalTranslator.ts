import { User } from "../entity/User";
import { LangList, Result, TranscriptAlt } from "../types";
import { Translator } from "./Translator";
import { logger } from "../utils/logger";

export class LocalTranslator extends Translator {

	private isReady = false;

	constructor(user: User) {
		super(user);
	}

	async init(): Promise<{ isError: boolean; message?: string }> {
		try {
			const res = await fetch('http://local-translate:5006/health');

			if(!res.ok) {
				const body = await res.text();
				return {
					isError: true,
					message: `Local translator not ready: ${body}`,
				};
			}

			this.isReady = true;

			return {
				isError: false,
			};
		}catch(e) {
			logger.warn('Local translator health check failed', e);

			return {
				isError: true,
				message: 'Local translator is not reachable',
			};
		}
	}

	ready(): boolean {
		return this.isReady;
	}

	async getLangs(): Promise<LangList> {
		return [
			{
				code: "en",
				name: "English",
			},
		];
	}

	protected async translateOne(transcript: TranscriptAlt, target: string): Promise<Result<TranscriptAlt>> {
		try {
			if(target !== 'en') {
				return {
					isError: true,
					message: `Local translator only supports English for now`,
				};
			}

			const res = await fetch('http://local-translate:5006/translate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					text: transcript.text,
					source: transcript.lang,
					target,
				}),
			});

			if(!res.ok) {
				const body = await res.text();
				return {
					isError: true,
					message: `Local translator error: ${body}`,
				};
			}

			const json = await res.json();
			const text = typeof json.text === 'string' ? json.text.trim() : '';

			return {
				isError: false,
				data: {
					lang: target,
					text,
				},
			};
		}catch(e) {
			logger.error('Local translation failed', e);

			return {
				isError: true,
				message: 'Local translation failed',
			};
		}
	}
}
