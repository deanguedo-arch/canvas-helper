import { build } from 'esbuild';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, relative, extname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { Script, createContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';

// Review-only, single-file delivery. Does not activate the course or deploy it.
const project = resolve('projects/nextstep-writing-studio');
const workspace = join(project, 'workspace');
const destination = join(project, 'exports/google-sites-review');
const included = new Map();
const types = { '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ttf': 'font/ttf' };
const sources = new Map();
async function readSource(path) {
  const bytes = await readFile(path);
  sources.set(relative(project, path), createHash('sha256').update(bytes).digest('hex'));
  return bytes;
}
async function dataUrl(path) {
  const key = relative(workspace, path).replaceAll('\\', '/');
  if (!included.has(key)) {
    if (!key.startsWith('assets/') || key.includes('../')) throw Error(`Outside asset boundary: ${key}`);
    const mime = types[extname(path)];
    if (!mime) throw Error(`Unsupported embedded asset: ${key}`);
    included.set(key, `data:${mime};base64,${(await readSource(path)).toString('base64')}`);
  }
  return included.get(key);
}
async function flattenCss(path, ancestors = []) {
  if (ancestors.includes(path)) throw Error(`CSS import cycle: ${path}`);
  let css = (await readSource(path)).toString('utf8');
  const imports = /@import\s+url\(['"]([^'"]+)['"]\)\s*;/g;
  for (const match of [...css.matchAll(imports)]) {
    const child = resolve(dirname(path), match[1]);
    css = css.replace(match[0], await flattenCss(child, [...ancestors, path]));
  }
  // Resolve this stylesheet's own URLs before flattening its parents.
  for (const match of [...css.matchAll(/url\(['"]([^'"]+)['"]\)/g)]) {
    if (match[1].startsWith('data:')) continue;
    css = css.replace(match[0], `url('${await dataUrl(resolve(dirname(path), match[1]))}')`);
  }
  return css;
}

const icons = {};
for (const name of await readdir(join(workspace, 'assets/icons'))) {
  if (name.endsWith('.svg')) icons[name.slice(0, -4)] = await dataUrl(join(workspace, 'assets/icons', name));
}
// Compile the unchanged save schemas at build time. Browser CSP can prohibit
// Ajv's runtime Function constructor, preventing the entire app from starting.
const compiler = new Ajv2020({ allErrors: true, strict: false, code: { source: true, esm: true } });
addFormats(compiler);
const schemaNames = ['workspace', 'persisted-workspace', 'backup', 'legacy-export'];
const schemaExports = {};
for (const [index, name] of schemaNames.entries()) {
  const schema = JSON.parse(await readSource(join(workspace, 'schemas', `${name}.schema.json`)));
  compiler.addSchema(schema);
  schemaExports[`validate${index}`] = schema.$id;
}
const compiledValidators = standaloneCode(compiler, schemaExports) + `
const schemaMap = {${Object.entries(schemaExports).map(([name,id]) => `${JSON.stringify(id)}:${name}`).join(',')}};
export default {
  getSchema: id => schemaMap[id],
  errorsText(errors, {separator = ', ', dataVar = 'data'} = {}) {
    if (!errors || !errors.length) return 'No errors';
    return errors.map(e => dataVar + e.instancePath + ' ' + e.message).join(separator);
  }
};`;
const embedPlugin = { name: 'single-file-assets', setup(builder) {
    builder.onResolve({ filter: /^critical-embed-validation$/ }, () => ({ path: 'validators', namespace: 'critical-embed-validation' }));
    builder.onLoad({ filter: /.*/, namespace: 'critical-embed-validation' }, () => ({ contents: compiledValidators, loader: 'js', resolveDir: process.cwd() }));
    builder.onResolve({ filter: /^critical-embed-icons$/ }, () => ({ path: 'icons', namespace: 'critical-embed' }));
    builder.onLoad({ filter: /.*/, namespace: 'critical-embed' }, () => ({ contents: `export default ${JSON.stringify(icons)}`, loader: 'js' }));
    builder.onLoad({ filter: /\/workspace\/app\/.*\.js$/ }, async ({ path }) => {
      let code = (await readSource(path)).toString('utf8');
      if (path === join(workspace, 'app/main.js')) {
        const navigation = "const go = path => { if (route() === path) render(); else location.hash = path; };";
        if (!code.includes(navigation)) throw Error('Navigation helper changed; review the embed adapter.');
        // Google Sites suppresses default fragment-link navigation in its
        // custom embed. Explicit hash assignment works (as its buttons prove).
        code = code.replace(navigation, navigation + `
document.addEventListener('click', event => {
  const link = event.target.closest?.('a[href]');
  const href = link?.getAttribute('href');
  if (!href?.startsWith('#/') || event.button !== 0) return;
  event.preventDefault();
  go(decodeURI(href.slice(1)));
}, true);`);
      }
      if (path === join(workspace, 'app/model.js')) {
        const runtimeCompiler = /const ajv = new Ajv2020\(\{ allErrors: true, strict: false \}\);\s*addFormats\(ajv\);\s*ajv.addSchema\(workspaceSchema\);\s*ajv.addSchema\(persistedSchema\);\s*ajv.addSchema\(backupSchema\);\s*ajv.addSchema\(legacySchema\);/;
        if (!runtimeCompiler.test(code)) throw Error('Save validator initialization changed; review the embed adapter.');
        code = code.replace("import Ajv2020 from 'ajv/dist/2020.js';", "import compiledValidation from 'critical-embed-validation';")
          .replace("import addFormats from 'ajv-formats';", '')
          .replace(runtimeCompiler, 'const ajv = compiledValidation;');
      }
      const dynamicIcon = 'src="assets/icons/${name}.svg"';
      if (code.includes(dynamicIcon)) {
        code = `import embeddedIcons from 'critical-embed-icons';\n` + code.replaceAll(dynamicIcon, 'src="${embeddedIcons[name]}"');
      }
      for (const match of [...code.matchAll(/src="(assets\/[A-Za-z0-9_./-]+)"/g)]) {
        code = code.replaceAll(match[0], `src="${await dataUrl(join(workspace, match[1]))}"`);
      }
      return { contents: code, loader: 'js', resolveDir: dirname(path) };
    });
    builder.onLoad({ filter: /\/workspace\/(content|schemas)\/.*\.json$/ }, async ({ path }) => ({ contents: (await readSource(path)).toString('utf8'), loader: 'json' }));
  } };
const built = await build({
  entryPoints: [join(workspace, 'app/main.js')], bundle: true, write: false,
  format: 'iife', platform: 'browser', target: ['es2022'], minify: true,
  legalComments: 'none', sourcemap: false, logLevel: 'warning', plugins: [embedPlugin]
});

// Focused saved-state compatibility check, with runtime string compilation
// disabled. It exercises the same model transformation used by the HTML.
const modelCheck = await build({ entryPoints: [join(workspace, 'app/model.js')],
  bundle: true, write: false, format: 'cjs', platform: 'node', plugins: [embedPlugin] });
const checkModule = { exports: {} };
const checkContext = createContext({ module: checkModule, exports: checkModule.exports, crypto: webcrypto, TextEncoder, TextDecoder },
  { codeGeneration: { strings: false, wasm: false } });
new Script(modelCheck.outputFiles[0].text).runInContext(checkContext);
const model = checkModule.exports;
const fixture = model.newWorkspace();
fixture.projects.push(model.newProject({ title: 'Synthetic embed validator check', type: 'critical-analysis', track: 'english-30-1' }));
model.validateWorkspace(fixture);
for (const change of [item => item.revision = -1, item => item.createdAt = 'invalid-date',
  item => item.projects[0].type = 'unsupported', item => item.projects.push(item.projects[0]),
  item => item.projects[0].draft.doc = { type: 'invalid' }]) {
  const invalid = structuredClone(fixture); change(invalid);
  assert.throws(() => model.validateWorkspace(invalid));
}
assert.throws(() => model.validatePersisted({}));
assert.throws(() => model.validateBackup({}));
assert.throws(() => model.validateLegacy({}));

let html = (await readSource(join(workspace, 'index.html'))).toString('utf8');
const css = await flattenCss(join(workspace, 'styles.css'));
html = html.replace('<link rel="stylesheet" href="./styles.css">', () => `<style>\n${css}\n</style>`);
for (const match of [...html.matchAll(/src="(assets\/[A-Za-z0-9_./-]+)"/g)]) {
  html = html.replaceAll(match[0], `src="${await dataUrl(join(workspace, match[1]))}"`);
}
// srcdoc normally inherits the enclosing page's base URL. Keep native hash
// navigation within this document instead of navigating back to that page.
const embedBase = `if(location.href.startsWith('about:srcdoc')){const base=document.createElement('base');base.href='about:srcdoc';document.head.prepend(base);}`;
html = html.replace('<script type="module" src="./course.js"></script>', () => `<script>\n${embedBase}\n${built.outputFiles[0].text.replaceAll('</script', '<\\/script')}\n</script>`);
const licenses = await Promise.all(['OFL-Hanken-Grotesk.txt', 'OFL-Work-Sans.txt'].map(name => readSource(join(workspace, 'assets/fonts', name))));
html = html.replace('</head>', () => `<!-- Critical Essay Studio: single-file Google Sites REVIEW build. No cloud saving or publication acceptance. -->\n<script type="text/plain" id="bundled-font-licenses">\n${licenses.map(bytes => bytes.toString('utf8').replaceAll('</script', '<\\/script')).join('\n\n')}\n</script>\n</head>`);
const unresolved = html.match(/src="(?:\.\/)?assets\/|@import\s|<script[^>]+src=|<link[^>]+rel="stylesheet"/);
if (unresolved) throw Error(`External runtime dependency remains near: ${html.slice(Math.max(0, unresolved.index - 60), unresolved.index + 120)}`);
// Check the actual HTML script, after escaping and substitution, without running it.
const executableScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (executableScripts.length !== 1) throw Error('Expected one complete inline application script.');
new Script(executableScripts[0][1], { filename: 'Critical-Essay-Studio-Google-Sites.html' });
await mkdir(destination, { recursive: true });
const file = join(destination, 'Critical-Essay-Studio-Google-Sites.html');
await writeFile(file, html);
await writeFile(join(destination, 'PASTE-INTO-GOOGLE-SITES.txt'), html);
await writeFile(join(destination, 'README.md'), await readSource(join(project, 'meta/google-sites-review.md')));
await writeFile(join(destination, 'build-receipt.json'), JSON.stringify({
  product: 'Critical Essay Studio', status: 'review-only', generatedAt: new Date().toISOString(),
  regenerate: 'node scripts/build-writing-studio-embed.mjs',
  htmlBytes: Buffer.byteLength(html), htmlSha256: createHash('sha256').update(html).digest('hex'),
  sources: Object.fromEntries([...sources].sort()), embeddedAssets: [...included.keys()].sort(),
  persistence: 'Existing temporary-tab save coordinator and portable backups; no Google account or cloud save adapter.',
  googleSitesValidation: 'Compare htmlSha256 with meta/review/google-sites-preview-check.json for scoped live Preview evidence. Published-site and save validation remain pending.', authoringStatus: 'blocked',
  validatorCompilation: 'Build-time standalone Ajv; unchanged schemas, no browser Function constructor.',
  embedNavigation: 'Internal fragment links explicitly call the existing router; external links remain native.',
  validatorChecks: 'Valid critical workspace and malformed save shapes checked with string compilation disabled.'
}, null, 2) + '\n');
console.log(`Created ${relative(process.cwd(), file)} (${Buffer.byteLength(html)} bytes; ${included.size} embedded assets).`);
