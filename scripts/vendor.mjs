import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
await mkdir('docs/vendor',{recursive:true});
for(const file of ['three.module.min.js','three.core.min.js']) await copyFile('node_modules/three/build/'+file,'docs/vendor/'+file);
const orbit=await readFile('node_modules/three/examples/jsm/controls/OrbitControls.js','utf8');
await writeFile('docs/vendor/OrbitControls.js',orbit.replace("from 'three'","from './three.module.min.js'"));
await copyFile('node_modules/three/LICENSE','docs/vendor/THREE-LICENSE.txt');
