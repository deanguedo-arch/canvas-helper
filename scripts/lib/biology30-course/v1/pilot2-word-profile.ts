import {createHash} from 'node:crypto';
import {validateBiologyWordRecords} from '../../biology30-vocabulary/word-record.js';
import type {BiologyWordPageData} from '../../biology30-vocabulary/word-page.js';
import type {RenderTopicVocabulary} from './pilot2-render-vocabulary.js';
import type {TopicStateSchema} from './pilot2-state.js';

/** The ordered identity map is part of the saved format, not a UI sort order. */
export function prepareTopicWordProfile(details:Pick<BiologyWordPageData,'words'|'categories'>,vocabulary:RenderTopicVocabulary,state:TopicStateSchema):BiologyWordPageData{
 validateBiologyWordRecords(details.words,details.categories);
 if(details.words.length!==vocabulary.introducedTerms.length||vocabulary.introducedTerms.some(t=>!details.words.some(w=>w.id===t.id&&w.term===t.term&&w.definition===t.definition)))throw Error('Individual word inventory differs from canonical vocabulary');
 const map={wordIds:details.words.map(w=>w.id),legacyIds:Object.keys(state.families.responseIds),limit:240};
 state.wordFrayers={...map,identity:createHash('sha256').update(JSON.stringify(map)).digest('hex')};
 return {...details,wordFrayers:{},choicePolicy:'any-eight',wordRoutes:Object.fromEntries(vocabulary.introducedTerms.map(t=>[t.id,t.firstTeachingTopicId])),wordTargets:Object.fromEntries(vocabulary.introducedTerms.map(t=>[t.id,t.firstTeachingPartId+'-terms']))};
}
