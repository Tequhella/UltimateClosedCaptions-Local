import { get, writable } from "svelte/store";
import { twitchContext } from "./twitch";
import languages from "../assets/languages.json";

export type LangCode = keyof typeof languages;

export interface Caption {
	lang: LangCode
	text: string
}

export type CaptionsData = {
	delay: number
	duration: number
} & CaptionLine

interface CaptionLine {
	speaker?: string
	lineEnd: boolean
	final: boolean
	captions: Caption[]
}

/** Complete transcript, each array is a line (may be separated in multiple part) */
export const transcript = writable<CaptionLine[][]>([]);

/** Last received captions (used for language list) */
export const lastReceivedCaptions = writable<Caption[]>([]);

// Handle received captions
export async function handleCaptions(data: CaptionsData) {
	console.log('[UCC EXT] handleCaptions input', data);

	lastReceivedCaptions.set(data.captions);
	
	const { delay, duration, ...newText } = data;

	const waitTime = Math.max(
		0,
		(( get(twitchContext)?.hlsLatencyBroadcaster || 4 ) * 1000) - delay
	);

	console.log('[UCC EXT] waitTime before display', waitTime);

	await new Promise(res => setTimeout(res, waitTime));

	transcript.update((transcript) => {
		console.log('[UCC EXT] transcript before update', structuredClone(transcript));

		const lastLine = transcript.findLast(l => l[0].speaker===data.speaker);

		if(lastLine && !lastLine[lastLine.length-1].lineEnd) {
			if(lastLine[lastLine.length-1].final) {
				lastLine.push(newText);
			}else{
				lastLine[lastLine.length-1] = newText;
			}
		}else{
			transcript.push([newText]);
		}

		if(transcript.length > 50) transcript.shift();

		console.log('[UCC EXT] transcript after update', structuredClone(transcript));

		return transcript;
	});
}
