import deployment from '../schemas/deployment-config.json';
import product from '../schemas/product-config.json';
import { canonical, decodeState, encodeState, sha256 } from './codec.js';
import { APP_VERSION, validatePersisted, validateWorkspace } from './model.js';

const textBytes = value => new TextEncoder().encode(value);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const safeWindow = (windowObject, field) => { try { return windowObject[field]; } catch { return null; } };

function findApi(start) {
  const seen = new Set(); let current = start;
  for (let count = 0; current && count < product.discoveryMaxWindows && !seen.has(current); count++) {
    seen.add(current);
    const api = safeWindow(current, 'API_1484_11');
    if (api && typeof api.Initialize === 'function') return api;
    const parent = safeWindow(current, 'parent');
    current = parent && parent !== current ? parent : null;
  }
  current = safeWindow(start, 'opener');
  for (let count = 0; current && count < product.discoveryMaxWindows && !seen.has(current); count++) {
    seen.add(current);
    const api = safeWindow(current, 'API_1484_11');
    if (api && typeof api.Initialize === 'function') return api;
    const parent = safeWindow(current, 'parent');
    current = parent && parent !== current ? parent : safeWindow(current, 'opener');
  }
  return null;
}

export class ScormAdapter {
  constructor(api) { this.api = api; this.started = false; this.closed = false; }
  call(method, ...args) {
    if (this.closed) return { ok: false, errorCode: 'SESSION_CLOSED' };
    try {
      const value = this.api[method](...args);
      const errorCode = String(this.api.GetLastError());
      const ok = method === 'GetValue' ? errorCode === '0' : value === 'true' && errorCode === '0';
      return { ok, value, errorCode, diagnostic: ok ? '' : String(this.api.GetErrorString?.(errorCode) || method) };
    } catch (error) {
      return { ok: false, errorCode: 'EXCEPTION', diagnostic: String(error) };
    }
  }
  initialize() { if (this.started) return { ok: false, errorCode: 'ALREADY_INITIALIZED' }; const result = this.call('Initialize', ''); if (result.ok) this.started = true; return result; }
  get(field) { return this.call('GetValue', field); }
  set(field, value) { return this.call('SetValue', field, value); }
  commit() { return this.call('Commit', ''); }
  terminate() { if (this.closed) return { ok: false, errorCode: 'SESSION_CLOSED' }; const result = this.call('Terminate', ''); this.closed = true; return result; }
}

function getStorage() { try { return window.sessionStorage; } catch { return null; } }
function localKey(binding) { return `nextstep-writing-studio:${binding.deploymentScope}:${binding.learnerKey}`; }
function readLocal(binding) {
  const raw = getStorage()?.getItem(localKey(binding));
  if (!raw) return null;
  try {
    const item = JSON.parse(raw);
    if (item.binding?.deploymentScope !== binding.deploymentScope || item.binding?.learnerKey !== binding.learnerKey) return null;
    validateWorkspace(item.workspace);
    return item;
  } catch { return { invalid: true, raw }; }
}
function writeLocal(binding, workspace, baseRemoteHash, status) {
  const value = { binding, workspaceId: workspace.workspaceId, workspace, headId: workspace.headId,
    baseRemoteHash, status, capturedAt: new Date().toISOString() };
  getStorage()?.setItem(localKey(binding), JSON.stringify(value));
  return !!getStorage();
}

function openLockDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nextstep-writing-studio', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('locks')) db.createObjectStore('locks');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function lockTransaction(db, key, operation) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('locks', 'readwrite');
    const store = transaction.objectStore('locks');
    const request = store.get(key);
    let result;
    request.onsuccess = () => { result = operation(store, request.result); };
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || Error('Lock transaction aborted'));
  });
}

export class SaveCoordinator {
  constructor(onStatus = () => {}) {
    this.onStatus = onStatus; this.status = { label: 'restoring', message: 'Opening your workspace…', currentRevision: 0,
      acceptedRevision: null, currentHeadId: null, acceptedHeadId: null, localDestination: 'none', localHeadId: null,
      pending: false, lastAcceptedAt: null };
    this.api = null; this.binding = null; this.workspace = null; this.remoteHash = null;
    this.completionStatus = null;
    this.readOnly = false; this.temp = false; this.inFlight = null; this.dirtySince = 0;
    this.lockRelease = null; this.lockHeld = false;
    this.lockDb = null; this.lockNonce = null; this.lockHeartbeat = null;
    this.localTimer = null; this.lmsTimer = null; this.maxTimer = null; this.retryTimer = null; this.retryIndex = 0;
  }
  update(patch) { this.status = { ...this.status, ...patch }; this.onStatus(this.status); }
  async load() {
    const startedAt = Date.now(); let found = findApi(window);
    while (!found && Date.now() - startedAt < product.discoveryMaxMs) { await wait(250); found = findApi(window); }
    if (!found) {
      this.temp = true;
      this.binding = { deploymentScope: 'temporary-tab', learnerKey: await sha256(textBytes(`${location.origin}\0temporary-tab`)) };
      const record = readLocal(this.binding);
      if (record?.invalid) return { kind: 'recovery', cause: 'Temporary workspace cache is unreadable.', raw: record.raw };
      if (record) {
        this.workspace = record.workspace;
        this.update({ label: 'tab-only', message: 'Stored in this browser tab only', localDestination: 'tab', localHeadId: record.headId,
          currentRevision: record.workspace.revision, currentHeadId: record.workspace.headId });
        return { kind: 'loaded', workspace: this.workspace, temporary: true };
      }
      this.update({ label: 'tab-only', message: 'No LMS connection. Work will stay in this tab until exported.', localDestination: 'tab' });
      return { kind: 'temporary-choice' };
    }
    if (deployment.status !== 'APPROVED' || !deployment.tenantKey || !deployment.deploymentScope || /^(synthetic|example|placeholder)/i.test(deployment.tenantKey)) {
      this.readOnly = true;
      this.update({ label: 'recovery-required', message: 'This package has no approved Brightspace deployment settings.' });
      return { kind: 'recovery', cause: 'Unapproved deployment configuration. No LMS data was changed.' };
    }
    this.api = new ScormAdapter(found);
    const initialized = this.api.initialize();
    if (!initialized.ok) return this.failLoad('SCORM initialization failed.', initialized);
    const required = ['cmi.learner_id', 'cmi.mode', 'cmi.entry', 'cmi.suspend_data', 'cmi.location', 'cmi.completion_status'];
    const read = {};
    for (const field of required) {
      const result = this.api.get(field);
      if (!result.ok) return this.failLoad(`${field} could not be read.`, result);
      read[field] = result.value;
    }
    this.completionStatus = read['cmi.completion_status'];
    if (!read['cmi.learner_id'] || !['normal', 'review', 'browse'].includes(read['cmi.mode'])) return this.failLoad('Learner identity or mode is unavailable.');
    this.readOnly = read['cmi.mode'] !== 'normal';
    this.binding = { deploymentScope: deployment.deploymentScope,
      learnerKey: await sha256(textBytes(`${deployment.tenantKey}\0${deployment.deploymentScope}\0${read['cmi.learner_id']}`)) };
    const raw = read['cmi.suspend_data'];
    const local = readLocal(this.binding);
    if (local?.invalid) return { kind: 'recovery', cause: 'The same-session recovery copy is unreadable.', rawLocal: local.raw, rawRemote: raw };
    if (raw) {
      try {
        const decoded = validatePersisted(await decodeState(raw), this.binding);
        this.remoteHash = raw.split('.')[1];
        if (local && local.headId !== decoded.workspace.headId) {
          this.update({ label: 'recovery-required', message: 'A different local copy needs review before editing.' });
          return { kind: 'recovery', cause: 'Local and LMS copies differ.', remote: decoded.workspace, local: local.workspace,
            rawRemote: raw, baseRemoteHash: local.baseRemoteHash };
        }
        this.workspace = decoded.workspace;
      } catch (error) {
        this.update({ label: 'recovery-required', message: 'LMS data needs recovery; no changes were made.' });
        return { kind: 'recovery', cause: String(error), rawRemote: raw, local: local?.workspace };
      }
    } else if (local) {
      this.update({ label: 'recovery-required', message: 'An LMS-empty launch has a local copy to review.' });
      return { kind: 'recovery', cause: 'LMS data is empty but this tab holds work.', local: local.workspace };
    }
    if (!this.readOnly) {
      const lock = await this.acquireLock();
      if (lock === false) {
        this.readOnly = true;
        this.update({ label: 'read-only', message: 'Another tab is editing this workspace.' });
      } else if (lock === null) {
        this.readOnly = true;
        this.update({ label: 'read-only', message: 'This browser cannot protect against a second tab. Export a backup or use a browser with Web Locks.' });
      }
    }
    if (this.readOnly) {
      if (read['cmi.mode'] !== 'normal') this.update({ label: 'read-only', message: `Brightspace ${read['cmi.mode']} mode: view and export only.` });
    } else this.update({ label: this.workspace ? 'player-accepted' : 'dirty',
      message: this.workspace ? 'Workspace loaded from the LMS player' : 'Fresh workspace; no work saved yet',
      currentHeadId: this.workspace?.headId || null, currentRevision: this.workspace?.revision ?? 0,
      acceptedHeadId: this.workspace?.headId || null, acceptedRevision: this.workspace?.revision ?? null });
    if (this.workspace) return { kind: this.readOnly ? 'read-only' : 'loaded', workspace: this.workspace };
    return { kind: this.readOnly ? 'read-only' : 'empty', workspace: null };
  }
  failLoad(cause, result) {
    this.readOnly = true;
    this.update({ label: 'recovery-required', message: cause, errorCode: result?.errorCode });
    return { kind: 'recovery', cause };
  }
  async acquireLock() {
    if (this.lockHeld) return true;
    const name = `nextstep-writing-studio:${this.binding.deploymentScope}:${this.binding.learnerKey}`;
    if (!navigator.locks?.request) return this.acquireIndexedDbLock(name);
    let report;
    const acquired = new Promise(resolve => { report = resolve; });
    void navigator.locks.request(name, { ifAvailable: true }, async lock => {
      if (!lock) { report(false); return; }
      this.lockHeld = true; report(true);
      await new Promise(resolve => { this.lockRelease = resolve; });
      this.lockHeld = false;
    });
    return acquired;
  }
  async acquireIndexedDbLock(name) {
    if (!globalThis.indexedDB) return null;
    try {
      const db = await openLockDb();
      const nonce = crypto.randomUUID();
      const claimed = await lockTransaction(db, name, (store, current) => {
        if (current && current.expiresAt > Date.now()) return false;
        store.put({ nonce, expiresAt: Date.now() + product.sameBrowserLeaseExpiryMs }, name);
        return true;
      });
      if (!claimed) { db.close(); return false; }
      this.lockDb = db; this.lockNonce = nonce; this.lockName = name; this.lockHeld = true;
      this.lockHeartbeat = setInterval(async () => {
        try {
          const kept = await lockTransaction(db, name, (store, current) => {
            if (current?.nonce !== nonce) return false;
            store.put({ nonce, expiresAt: Date.now() + product.sameBrowserLeaseExpiryMs }, name);
            return true;
          });
          if (!kept) { this.readOnly = true; this.lockHeld = false; clearInterval(this.lockHeartbeat);
            this.update({ label: 'read-only', message: 'Another tab took the editing lease. Export your work and reopen.' }); }
        } catch {
          this.readOnly = true; this.lockHeld = false; clearInterval(this.lockHeartbeat);
          this.update({ label: 'read-only', message: 'Editing lease could not be refreshed. Export your work.' });
        }
      }, product.sameBrowserLeaseHeartbeatMs);
      return true;
    } catch { return null; }
  }
  acceptTemporary(workspace) { if (!this.temp) throw Error('Not temporary mode'); this.workspace = workspace; this.notifyMutation(workspace); }
  notifyMutation(workspace) {
    if (this.readOnly || !this.binding) throw Error('Workspace is not writable');
    validateWorkspace(workspace);
    this.workspace = workspace;
    const firstDirty = !this.dirtySince;
    if (firstDirty) this.dirtySince = Date.now();
    this.update({ label: 'dirty', message: this.temp ? 'Not yet stored in this tab' : 'Changes pending LMS player save',
      currentRevision: workspace.revision, currentHeadId: workspace.headId, pending: true });
    clearTimeout(this.localTimer);
    this.localTimer = setTimeout(() => this.saveLocal(), product.localDebounceMs);
    if (firstDirty) setTimeout(() => { if (this.status.localHeadId !== this.workspace?.headId) this.saveLocal(); }, product.localMaxWaitMs);
    if (!this.temp) {
      clearTimeout(this.lmsTimer);
      this.lmsTimer = setTimeout(() => this.flush('idle'), product.lmsIdleSaveMs);
      if (firstDirty) this.maxTimer = setTimeout(() => this.flush('max-wait'), product.lmsMaxWaitMs);
    }
  }
  saveLocal() {
    if (!this.workspace || !this.binding) return;
    try {
      const saved = writeLocal(this.binding, this.workspace, this.remoteHash, 'pending');
      if (saved) this.update({ localDestination: 'tab', localHeadId: this.workspace.headId,
        ...(this.temp ? { label: 'tab-only', message: 'Stored in this browser tab only', pending: false } : {}) });
      else this.update({ localDestination: 'none', message: 'Device recovery unavailable. Export a backup.' });
    } catch {
      this.update({ localDestination: 'none', message: 'Browser storage refused the recovery copy. Export a backup.' });
    }
  }
  async flush(reason = 'manual') {
    if (!this.workspace || this.readOnly) return;
    clearTimeout(this.localTimer); clearTimeout(this.lmsTimer); clearTimeout(this.maxTimer);
    this.saveLocal();
    if (this.temp) return;
    if (this.inFlight) { await this.inFlight; if (this.workspace?.headId !== this.status.acceptedHeadId) return this.flush(reason); return; }
    const snapshot = structuredClone(this.workspace);
    const run = async () => {
      try {
        validateWorkspace(snapshot);
        const persisted = { format: 'nextstep.writing-studio.state', schemaVersion: 1, appVersion: APP_VERSION,
          binding: this.binding, workspace: snapshot };
        const wire = await encodeState(persisted, Infinity);
        if (wire.length > product.wireHardCapChars) throw Error(`Wire capacity: ${wire.length} characters exceeds ${product.wireHardCapChars}`);
        if (snapshot.headId !== this.workspace?.headId && reason === 'idle') return;
        this.update({ label: 'saving', message: 'Saving to LMS player…' });
        if (!this.remoteHash && !['incomplete', 'completed', 'passed', 'failed'].includes(this.completionStatus)) {
          const statusResult = this.api.set('cmi.completion_status', 'incomplete');
          if (!statusResult.ok) throw Error(`cmi.completion_status: ${statusResult.errorCode || statusResult.diagnostic}`);
          this.completionStatus = 'incomplete';
        }
        const calls = [['cmi.exit', 'suspend'], ['cmi.suspend_data', wire], ['cmi.location', location.hash.slice(0, 790)]];
        for (const [field, value] of calls) {
          const result = this.api.set(field, value);
          if (!result.ok) throw Error(`${field}: ${result.errorCode || result.diagnostic}`);
        }
        const result = this.api.commit();
        if (!result.ok) throw Error(`Commit: ${result.errorCode || result.diagnostic}`);
        this.remoteHash = wire.split('.')[1]; this.retryIndex = 0; clearTimeout(this.retryTimer);
        const current = snapshot.headId === this.workspace?.headId;
        const offline = navigator.onLine === false;
        const pressure = wire.length >= product.wireUrgentChars ? ' · storage almost full' : wire.length >= product.wireWarningChars ? ' · storage getting full' : '';
        this.update({ label: current ? (offline ? 'unconfirmed' : (deployment.tenantSaveLabelVerified ? 'brightspace-saved' : 'player-accepted')) : 'dirty',
          message: current ? (offline ? 'Player accepted data while offline; online save is unconfirmed' : (deployment.tenantSaveLabelVerified ? 'Saved to Brightspace' : 'LMS player accepted save') + pressure) : 'Newer changes remain pending',
          wireChars: wire.length, acceptedHeadId: snapshot.headId, acceptedRevision: snapshot.revision, lastAcceptedAt: new Date().toISOString(), pending: !current });
        if (current) this.dirtySince = 0;
        if (current) try { writeLocal(this.binding, snapshot, this.remoteHash, 'accepted'); } catch { /* status already reports local destination */ }
      } catch (error) {
        const capacity = /capacity|bound/i.test(String(error));
        this.update({ label: capacity ? 'capacity-blocked' : 'failed', message: capacity ? 'LMS storage limit reached. Edit or export your work; the last accepted copy remains.' : `Save not confirmed: ${String(error)}`,
          pending: true });
        if (!capacity && this.retryIndex < product.retryBackoffMs.length) {
          const delay = product.retryBackoffMs[this.retryIndex++];
          this.retryTimer = setTimeout(() => this.flush('retry'), delay);
        }
      }
    };
    this.inFlight = run();
    try { await this.inFlight; } finally { this.inFlight = null; }
  }
  async retry() { this.retryIndex = 0; clearTimeout(this.retryTimer); return this.flush('manual'); }
  async preflightCandidate(workspace) {
    validateWorkspace(workspace);
    if (!this.temp && this.binding) {
      await encodeState({ format: 'nextstep.writing-studio.state', schemaVersion: 1,
        appVersion: APP_VERSION, binding: this.binding, workspace });
    }
  }
  close() {
    clearTimeout(this.localTimer); clearTimeout(this.lmsTimer); clearTimeout(this.maxTimer); clearTimeout(this.retryTimer);
    const writableSession = !this.readOnly && (this.temp || this.lockHeld);
    if (writableSession) this.saveLocal();
    if (this.api?.started && !this.api.closed) {
      if (writableSession) this.api.set('cmi.exit', 'suspend');
      this.api.terminate();
    }
    this.lockRelease?.();
    this.lockHeld = false;
    clearInterval(this.lockHeartbeat);
    if (this.lockDb && this.lockName && this.lockNonce) {
      void lockTransaction(this.lockDb, this.lockName, (store, current) => {
        if (current?.nonce === this.lockNonce) store.delete(this.lockName);
      }).finally(() => this.lockDb?.close());
    }
    this.update({ label: 'session-closed', message: 'Session closed' });
  }
}

export async function makeBackup(workspace, kind = 'studio', project = null) {
  const payload = kind === 'studio' ? workspace : project;
  const envelope = { format: 'nextstep.writing-studio.backup', formatVersion: 1, schemaVersion: 1,
    kind, appVersion: APP_VERSION, exportedAt: new Date().toISOString(), payload };
  const hash = await sha256(textBytes(canonical(envelope)));
  return { ...envelope, checksum: { algorithm: 'sha256', value: hash } };
}
export async function inspectBackup(text) {
  if (textBytes(text).length > product.backupInputCapBytes) throw Error('Backup file exceeds 10 MiB');
  const { strictJSON } = await import('./codec.js');
  const envelope = strictJSON(text, product.backupInputCapBytes);
  const { checksum, ...body } = envelope;
  if (checksum?.algorithm !== 'sha256' || checksum.value !== await sha256(textBytes(canonical(body)))) throw Error('Backup checksum mismatch');
  const { validateBackup } = await import('./model.js');
  validateBackup(envelope);
  return envelope;
}
