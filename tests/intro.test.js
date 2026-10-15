const assert=require('node:assert/strict'),UI=require('../dist/js/ui'),{Game}=require('../dist/js/engine');
assert.equal(UI.progress(0),0);assert.equal(UI.progress(2.75),1);assert.equal(UI.progress(20),1);
let previous=0;for(let t=0;t<=5;t+=.01){const p=UI.progress(t);assert(p>=previous&&p<=1);previous=p;}
for(const level of [0,1,9]){const game=new Game(level),before=JSON.stringify(game);for(let t=0;t<UI.DURATION;t+=.08)UI.progress(t);assert.equal(JSON.stringify(game),before,'presentation must never advance combat');}
const fs=require('node:fs'),path=require('node:path');for(const file of UI.FILES)assert(fs.statSync(path.join(__dirname,'../dist/assets/ui',file)).size>0,file);
console.log('PASS lawn unroll bounds, forward direction, tutorial rows, zero combat progression and all UI bitmaps');
