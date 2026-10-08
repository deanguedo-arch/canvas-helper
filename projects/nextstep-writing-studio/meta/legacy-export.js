/* READ-ONLY recovery helper. Run only in the owner's authorized ORIGINAL legacy
 * Writing Studio browser context/origin. Read the function before using it.
 * Call exportWritingStudioLegacy() from that page's developer console.
 * It reads exactly two existing keys, then downloads a local JSON snapshot.
 * No network, no key enumeration, no setItem/removeItem/clear, no migration.
 * If district policy prohibits console use, an authorized developer can add the
 * same function to a reviewed recovery-only copy deployed on that same origin.
 */
function exportWritingStudioLegacy() {
  'use strict';
  const responsesKey='ela-student-tool-kit:writing-studio:responses:v1';
  const notesKey='ela-student-tool-kit:writing-studio:notes:v1';
  let responsesRaw, notesRaw;
  try {
    responsesRaw=localStorage.getItem(responsesKey);
    notesRaw=localStorage.getItem(notesKey);
  } catch (error) {
    throw new Error('Browser storage could not be read. No file was exported and no keys were changed.', {cause:error});
  }
  if(responsesRaw===null&&notesRaw===null) throw new Error('Neither legacy key exists on this origin. Do not infer that work was deleted; check the original browser context.');
  const data={format:'nextstep.writing-studio.legacy',formatVersion:1,exportedAt:new Date().toISOString(),raw:{responsesKey,notesKey,responsesRaw,notesRaw}};
  const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url;link.download='writing-studio-legacy-'+new Date().toISOString().slice(0,10)+'.wstudio-legacy.json';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  return {exportInitiated:true,sourceKeysModified:false,bytes:blob.size,note:'A download request is not proof that a file was saved. Open/reselect the file to verify it.'};
}
