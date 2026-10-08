/* Developer-only: export the actual runtime pool for coverage auditing. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const context={window:{},console};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'workspace/assets/revision-practice.js'),'utf8'),context);
const config=JSON.parse(fs.readFileSync(path.join(root,'authoring/course-config.json'),'utf8'));
const pool=context.window.BiologyRevisionPractice.pool(config,'mixed');
fs.writeFileSync(path.join(root,'authoring/generated-practice-items.json'),JSON.stringify(pool,null,2));
console.log(`${pool.length} finite practice representations exported.`);
