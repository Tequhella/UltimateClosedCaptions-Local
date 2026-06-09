import { sendExtensionPubSubBroadcastMessage, setExtensionBroadcasterConfiguration } from "@twurple/ebs-helper";
import { api, clientId, secret, ownerId, ensureUserReady } from "./twitch";
import { logger } from "../utils/logger";

// Check if user has installed extension
export async function isExtensionInstalled(user: string) {
	try{
		await ensureUserReady(user);
		const exts = await api.asUser(user, (client) => client.users.getActiveExtensions(user, true));

		return exts.getAllExtensions().some(ext => ext.id === clientId);
	}catch(e) {
		logger.error('Error checking if extension is installed', e);
		// In case of error return true to not disturb user
		return true;
	}
}

export async function sendPubsub(userId: string, message: string) {
	logger.info(
		`Sending extension pubsub: clientId=${clientId}, ownerId=${ownerId}, userId=${userId}, messageLength=${message.length}`
	);

	try {
		await sendExtensionPubSubBroadcastMessage(
			{ clientId, secret, ownerId },
			userId,
			message
		);
	}catch(e) {
		logger.error('Extension pubsub failed', e);
		throw e;
	}
}

export async function saveTwitchConfig(userId: string, config: string) {
	await setExtensionBroadcasterConfiguration({ clientId, secret, ownerId }, userId, config);
}
