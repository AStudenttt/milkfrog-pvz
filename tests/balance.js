// Heuristic player with normal starting sun and income; no money/HP cheats.
const {Game}=require('../dist/js/engine');
for(let level=0;level<10;level++){let results=[];for(let seed=1;seed<=3;seed++){const g=new Game(level,{seed});for(let t=0;t<420&&g.state==='playing';t+=.05){g.tick(.05);for(const s of [...g.suns])g.collect(s.id);const available=g.available();function plant(type,r,c){return g.place(type,r,c).ok;}
let need=g.enemies.filter(e=>!g.plants.some(p=>p.row===e.row&&['pea','ice','repeater'].includes(p.type))).sort((a,b)=>a.x-b.x)[0];
if(need)plant('pea',need.row,2);
const suns=g.plants.filter(p=>p.type==='sun').length;
if(available.includes('sun')&&suns<Math.min(8,g.rows.length*2)&&(!need||need.x>8.7)){let pos=[];for(let c=0;c<2;c++)for(const r of g.rows)if(!g.at(r,c))pos.push({r,c});if(pos.length)plant('sun',pos[0].r,pos[0].c);}
if(g.wave===0&&level===0&&!g.at(2,1))plant('pea',2,1);
for(const r of g.rows){const shots=g.plants.filter(p=>p.row===r&&['pea','ice','repeater'].includes(p.type));if(!shots.length&&g.wave>0)plant('pea',r,2);else if(suns>=Math.min(5,g.rows.length*2)){for(let c=2;c<6;c++)if(!g.at(r,c)){plant(available.includes('repeater')?'repeater':available.includes('ice')&&c===3?'ice':'pea',r,c);break;}}}
const danger=g.enemies.filter(e=>e.x<6.6).sort((a,b)=>a.x-b.x);for(const e of danger){if(available.includes('wall')&&!g.at(e.row,6))plant('wall',e.row,6);if(e.x<3&&available.includes('jalapeno')){let c=[4,5,7,8].find(c=>!g.at(e.row,c));if(c!==undefined)plant('jalapeno',e.row,c);}if(available.includes('cherry')&&(e.x<3.5||danger.filter(z=>Math.abs(z.x-e.x)<1.5&&Math.abs(z.row-e.row)<=1).length>=3)){let c=Math.max(0,Math.min(8,Math.floor(e.x)));if(!g.at(e.row,c))plant('cherry',e.row,c);}}
}results.push(g.state+' '+g.kills);}console.log(level+1,results.join(' / '));}
