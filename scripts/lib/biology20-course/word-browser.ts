import {renderTopicWordPage,type BiologyWordPageData} from '../biology30-vocabulary/word-page.js';
import type {loadBiology20UnitA} from './unit-a-inputs.js';

/** Explicit word targets for the existing ten response records. No new storage. */
export const UNIT_A_WORD_FRAYERS:Record<string,string>={
 'a-term-system':'a-family-systems',
 'a-term-energy':'a-family-energy',
 'a-term-food-web':'a-family-food-webs',
 'a-term-transfer-efficiency':'a-family-efficiency',
 'a-term-water':'a-family-water',
 'a-term-nitrogen-cycle':'a-family-matter-cycles',
 'a-term-albedo':'a-family-albedo',
 'a-term-autotroph':'a-family-producers',
 'a-term-ecological-pyramid':'a-family-pyramids',
 'a-term-oxygen':'a-family-gas-balance',
};
export function addUnitAWordBrowser(a:Awaited<ReturnType<typeof loadBiology20UnitA>>,html:string,details:Omit<BiologyWordPageData,'wordFrayers'>){
 const expected=a.input.vocabulary.introducedTerms;
 if(details.words.length!==expected.length||expected.some(t=>!details.words.some(w=>w.id===t.id&&w.term===t.term&&w.definition===t.definition)))throw Error('Word content does not reconcile with current Unit A vocabulary');
 return renderTopicWordPage(html,{...details,wordFrayers:{},choicePolicy:'any-eight',wordRoutes:Object.fromEntries(expected.map(t=>[t.id,t.firstTeachingTopicId]))});
}
