/* One isolated browser persistence owner. No SCORM claims or competing storage writes.
 * A readwrite IndexedDB transaction checks the revision and commits atomically.
 * Failure never deletes the previous record. No history truncation or auto-reset. */
(function (root) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  class SaveConflict extends Error {
    constructor(remote) { super('Another tab has saved a newer version. Both versions are retained for your choice.'); this.name = 'SaveConflict'; this.remote = remote; }
  }
  class SaveValidationError extends Error {
    constructor(message, raw) { super(message); this.name = 'SaveValidationError'; this.raw = raw; }
  }
  function empty() { return {drafts:{},calcs:{},frayers:{},notes:{},book:{},runs:{},history:[],recoveryCopies:[]}; }
  function validate(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new SaveValidationError('Saved work has an invalid structure.',payload);
    for (const k of ['drafts','calcs','frayers','notes','book','runs']) {
      if (!payload[k] || typeof payload[k] !== 'object' || Array.isArray(payload[k])) throw new SaveValidationError('Saved work is missing its '+k+' record. Nothing was replaced.',payload);
    }
    if (!Array.isArray(payload.history) || !Array.isArray(payload.recoveryCopies)) throw new SaveValidationError('Saved history has an invalid structure. Nothing was replaced.',payload);
    for (const [id,record] of Object.entries(payload.frayers)) {
      if (!record || typeof record !== 'object') throw new SaveValidationError('A vocabulary entry is invalid. Nothing was replaced.',payload);
      for (const [key,value] of Object.entries(record.fields || {})) {
        if (typeof value !== 'string') throw new SaveValidationError('A vocabulary response must be text.',payload);
      }
    }
    const ids = new Set();
    for (const record of payload.history) {
      if (!record || typeof record.id !== 'string' || ids.has(record.id)) throw new SaveValidationError('Completed history contains an invalid or duplicate identity. Nothing was replaced.',payload);
      ids.add(record.id);
    }
    JSON.stringify(payload); // Reject unserializable data; never shorten it.
    return true;
  }
  class BrowserStore {
    constructor(courseId) { this.courseId=courseId; this.db=null; }
    async open() {
      if (!root.indexedDB) throw new Error('This browser cannot open local course storage. Your work remains on screen; keep a printed copy.');
      this.db = await new Promise((resolve,reject)=> {
        const req=root.indexedDB.open('nextstep-science24-connected-v3',1);
        req.onupgradeneeded=()=> { if(!req.result.objectStoreNames.contains('courses')) req.result.createObjectStore('courses',{keyPath:'courseId'}); };
        req.onsuccess=()=>resolve(req.result);
        req.onerror=()=>reject(req.error || new Error('Browser storage could not be opened.'));
        req.onblocked=()=>reject(new Error('Another tab is preventing storage from opening. Close the other course tab and try again.'));
      });
      this.db.onversionchange=()=>this.db.close();
      return this;
    }
    checkEnvelope(value) {
      if (!value) return {courseId:this.courseId,schemaVersion:1,revision:0,updatedAt:null,payload:empty()};
      if (value.courseId!==this.courseId || value.schemaVersion!==1 || !Number.isSafeInteger(value.revision) || value.revision<1) throw new SaveValidationError('The saved course record cannot be safely read. It has not been reset or overwritten.',value);
      validate(value.payload); return value;
    }
    async load() {
      if (!this.db) throw new Error('Browser storage is not open.');
      const value=await new Promise((resolve,reject)=> {
        const tx=this.db.transaction('courses','readonly'),req=tx.objectStore('courses').get(this.courseId);
        req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
      });
      return copy(this.checkEnvelope(value));
    }
    async save(payload,expectedRevision) {
      validate(payload);
      if (!this.db) throw new Error('Browser storage is not open. Your visible draft has not been saved.');
      const immutable=copy(payload);
      return new Promise((resolve,reject)=> {
        let result, failure;
        let tx;
        try { tx=this.db.transaction('courses','readwrite'); }
        catch(e) { reject(e); return; }
        const store=tx.objectStore('courses'),get=store.get(this.courseId);
        get.onsuccess=()=> {
          try {
            const old=this.checkEnvelope(get.result);
            if (old.revision!==expectedRevision) { failure=new SaveConflict(copy(old));tx.abort();return; }
            result={courseId:this.courseId,schemaVersion:1,revision:old.revision+1,updatedAt:new Date().toISOString(),payload:immutable};
            store.put(result);
          } catch(e) { failure=e;try{tx.abort();}catch(_){} }
        };
        get.onerror=()=> {failure=get.error;};
        tx.oncomplete=()=>resolve(copy(result)); // Success is reported only after commit.
        tx.onabort=()=>reject(failure || tx.error || new Error('Saving was interrupted. The last confirmed save remains intact.'));
        tx.onerror=()=> {if(!failure)failure=tx.error;};
      });
    }
  }
  root.S24Storage={BrowserStore,SaveConflict,SaveValidationError,empty,validate,copy};
})(window);
