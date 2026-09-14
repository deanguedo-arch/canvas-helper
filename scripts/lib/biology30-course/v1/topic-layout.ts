import type {TopicContract} from './pilot2-contract.js';
import type {BiologyRuntimeIdentity} from './course-identity.js';

/** Component input, not an authoring/release contract. The owning Biology30
 * validator retains its exact profile, counts and frozen-evidence rules. */
export type TopicLayout=BiologyRuntimeIdentity&Pick<TopicContract,'topics'|'requiredRoutes'|'requiredMinutes'|'optionalMinutes'>;
