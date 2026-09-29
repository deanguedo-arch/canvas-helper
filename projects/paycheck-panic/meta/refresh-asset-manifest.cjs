/* Operational inventory. Runtime atlas definitions remain canonical in workspace. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),workspace=path.join(root,'workspace');
const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(workspace,'asset-manifest.js'),'utf8'),scope);
const atlas=scope.window.PPAssets;
const browser=JSON.parse(fs.readFileSync(path.join(__dirname,'generation-prompts-browser.json'),'utf8'));
const native=JSON.parse(fs.readFileSync(path.join(__dirname,'generation-prompts-native.json'),'utf8'));
const promptIndex={'groceries-atlas.png':0,'characters-b.png':1,'characters-b-transparent.png':1,'rooms-a.png':2,'rooms-b.png':3,'maya-directions.png':4,'furniture-atlas.png':5,'props.png':6,'ground.png':7,'style-reference.png':8,'checkout.png':9,'groceries-extra.png':10,'lucky-symbols.png':11};
const chat='https://chatgpt.com/c/6abbd6bb-6b5c-83e8-9915-e9d251479641';
const records=fs.readdirSync(path.join(workspace,'assets/generated')).filter(f=>f.endsWith('.png')).map(file=>{
  const rel='assets/generated/'+file,b=fs.readFileSync(path.join(workspace,rel)),width=b.readUInt32BE(16),height=b.readUInt32BE(20);
  const sheets=Object.entries(atlas.sheets).filter(([,d])=>d.src===rel).map(([name,d])=>{
    const frames=d.frames||Array.from({length:d.columns*d.rows},(_,i)=>[(i%d.columns)*width/d.columns,Math.floor(i/d.columns)*height/d.rows,width/d.columns,height/d.rows]);
    return {name,...d,frames,anchor:[.5,1]};
  });
  const key=file==='alex-directions.png'?'alex':file==='town-atlas.png'?'town':null;
  return {file:'workspace/'+rel,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length,width,height,role:sheets.length?'production source atlas':file==='style-reference.png'?'visual reference sheet':'reference only',provider:key?'Codex image generation':'ChatGPT via Chrome extension',generation:key?{prompt:native[key],reference:'workspace/assets/town-map.png'}:promptIndex[file]!==undefined?{prompt:browser[promptIndex[file]],conversation:chat}:null,edit:file==='characters-b-transparent.png'?{source:'workspace/assets/generated/characters-b.png',prompt:'Remove the background from this image. Keep all foreground subjects unchanged and fully intact, with clean, smooth edges. Make the background transparent.',tool:'ChatGPT Remove BG'}:null,sheets};
});
const manifest={schemaVersion:1,updatedAt:new Date().toISOString(),runtimeOwner:'workspace/asset-manifest.js',renderer:'workspace/art.js',styleReference:'workspace/assets/generated/style-reference.png',style:atlas.style,directions:atlas.directions,animations:atlas.animations,rig:atlas.rig,display:{worldCharacterHeight:88,interiorCharacterHeight:140,feetColliderRadius:12,localBitmapEdits:false,notes:['Original PNG atlases are retained intact. Canvas source rectangles produce sprites at runtime.','All character directions share a fractional cutout rig. Limb rotations are essential movement; decorative breathing is suppressed in reduced motion.','Maya northwest uses a mirrored northeast frame because the generated northwest view duplicated northeast.','Room backdrops include wall decor; furniture on the walkable floor is a separately sorted layer.','Dynamic prices, scores, directions, instructions, and feedback are drawn by the game.']},assets:records};
fs.writeFileSync(path.join(__dirname,'asset-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`${records.length} source images inventoried; ${Object.keys(atlas.sheets).length} runtime sheets.`);
