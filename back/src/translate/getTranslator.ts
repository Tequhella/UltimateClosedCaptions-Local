import { User } from "../entity/User";
import { GCPTranslator } from "./GCPTranslator";
import { LocalTranslator } from "./LocalTranslator";
import { NullTranslator } from "./NullTranslator";

/** Get correct translator according to configuration */
export function getTranslator(u: User) {

	switch(u.config.translateService) {

		/*
		case 'azure':
			return new AzureTranslator(u);
		*/

		case 'gcp':
			return new GCPTranslator(u);

		case 'local':
			return new LocalTranslator(u);

		default:
			return new NullTranslator(u);
	}

}
