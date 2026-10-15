/* Deterministic, renderer-independent day-lawn tower defense simulation. */
(function(root){'use strict';
const PLANTS={
 pea:{name:'豌豆射手',cost:100,hp:300,cool:7.5,period:1.425,damage:20,asset:'Peashooter',role:'发射豌豆，攻击本行僵尸'},
 sun:{name:'向日葵',cost:50,hp:300,cool:7.5,period:24,asset:'SunFlower',role:'定期生产 25 点阳光'},
 cherry:{name:'樱桃炸弹',cost:150,hp:300,cool:50,asset:'CherryBomb',role:'一次性爆炸，覆盖周围九格'},
 wall:{name:'坚果',cost:50,hp:4000,cool:30,asset:'WallNut',role:'高耐久，阻挡僵尸前进'},
 potato:{name:'土豆地雷',cost:25,hp:300,cool:30,asset:'PotatoMine',role:'埋下 14 秒后就绪，接触时爆炸'},
 ice:{name:'寒冰射手',cost:175,hp:300,cool:7.5,period:1.425,damage:20,asset:'SnowPea',role:'冰豌豆使目标移动与啃食减慢'},
 repeater:{name:'双发射手',cost:200,hp:300,cool:7.5,period:1.425,damage:20,asset:'Repeater',role:'连续发射两颗豌豆'},
 jalapeno:{name:'火爆辣椒',cost:125,hp:300,cool:50,asset:'Jalapeno',role:'一次性火焰，清除整行僵尸'},
 tall:{name:'高坚果',cost:125,hp:8000,cool:30,asset:'TallNut',role:'更高耐久的防线'}
};
const ENEMIES={normal:{name:'普通僵尸',hp:200,speed:.145,damage:100,asset:'Zombie'},cone:{name:'路障僵尸',hp:560,speed:.14,damage:100,asset:'ConeheadZombie'},bucket:{name:'铁桶僵尸',hp:1300,speed:.135,damage:100,asset:'BucketheadZombie'}};
const LEVELS=[
 {title:'1-1 · 草坪保卫战',waves:2,rows:[2],unlock:['pea'],types:['normal'],first:25,desc:'点阳光收集。选豌豆射手，再点中间草地种植。'},
 {title:'1-2 · 阳光的力量',waves:3,rows:[1,2,3],unlock:['sun'],types:['normal'],first:30,desc:'先种向日葵发展经济，再守住三条路线。'},
 {title:'1-3 · 一声巨响',waves:3,unlock:['cherry'],types:['normal','cone'],first:32,desc:'路障更耐打。樱桃炸弹能清除周围的僵尸。'},
 {title:'1-4 · 坚果防线',waves:3,unlock:['wall'],types:['normal','cone'],first:32,desc:'用坚果挡住僵尸，给后排射手争取时间。'},
 {title:'1-5 · 地下的惊喜',waves:3,unlock:['potato'],types:['normal','cone'],first:35,desc:'土豆地雷需要 14 秒准备，提前埋伏在僵尸来路。'},
 {title:'1-6 · 冰凉夏日',waves:4,unlock:['ice'],types:['normal','cone'],first:35,desc:'寒冰射手使僵尸减速，帮助火力集中输出。'},
 {title:'1-7 · 火力翻倍',waves:4,unlock:['repeater'],types:['normal','cone','bucket'],first:38,desc:'铁桶僵尸来袭。双发射手每轮连续发射两颗豌豆。'},
 {title:'1-8 · 火线救场',waves:4,unlock:['jalapeno'],types:['normal','cone','bucket'],first:38,desc:'火爆辣椒清除整行敌人，留给最危险的一路。'},
 {title:'1-9 · 铜墙铁壁',waves:4,unlock:['tall'],types:['normal','cone','bucket'],first:40,desc:'搭配高坚果、双发和寒冰，建立稳定的防线。'},
 {title:'1-10 · 守住家园',waves:5,unlock:[],types:['normal','cone','bucket'],first:40,desc:'白天草坪最后一战。保持阳光生产，及时修补防线。'}
];
function seeded(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
class Game{
 constructor(level=0,opts={}){this.level=level;this.endless=!!opts.endless;this.cfg=this.endless?{title:'生存 · 无尽草坪',waves:Infinity,types:Object.keys(ENEMIES),first:35}:LEVELS[level];this.rows=this.cfg.rows||[0,1,2,3,4];this.rand=seeded(opts.seed??Date.now());this.state='playing';this.time=0;this.sun=50;this.wave=0;this.nextWave=this.cfg.first;this.sky=2;this.id=0;this.plants=[];this.enemies=[];this.shots=[];this.suns=[];this.corpses=[];this.effects=[];this.events=[];this.queue=[];this.cooldowns={};this.mowers=Array.from({length:5},(_,r)=>({ready:this.rows.includes(r),active:false,x:-.65}));this.kills=0;this.score=0;}
 available(){return this.endless?Object.keys(PLANTS):Object.keys(PLANTS).filter(k=>LEVELS.slice(0,this.level+1).some(l=>l.unlock.includes(k)));}
 at(row,col){return this.plants.find(p=>p.row===row&&p.col===col);}
 canPlace(type,row,col){const d=PLANTS[type];if(this.state!=='playing')return{ok:false,reason:'本局已结束'};if(!d||!this.available().includes(type))return{ok:false,reason:'尚未解锁'};if(!Number.isInteger(row)||!Number.isInteger(col)||!this.rows.includes(row)||col<0||col>=9)return{ok:false,reason:'请种在开放的草坪上'};if(this.at(row,col))return{ok:false,reason:'这里已有植物'};if((this.cooldowns[type]||0)>0)return{ok:false,reason:'种子卡正在冷却'};if(this.sun<d.cost)return{ok:false,reason:'阳光不足'};return{ok:true};}
 place(type,row,col){const check=this.canPlace(type,row,col);if(!check.ok)return check;const d=PLANTS[type];this.sun-=d.cost;this.cooldowns[type]=d.cool;const p={id:++this.id,type,row,col,hp:d.hp,max:d.hp,age:0,timer:type==='sun'?7:d.period??1,recoil:0,hit:0};this.plants.push(p);this.effects.push({kind:'plant',x:col+.5,row,life:.45,total:.45});this.events.push({type:'plant'});return{ok:true,id:p.id};}
 shovel(row,col){if(this.state!=='playing')return false;const p=this.at(row,col);if(!p)return false;this.removePlant(p);return true;}
 removePlant(p){this.plants=this.plants.filter(v=>v!==p);this.effects.push({kind:'soil',x:p.col+.5,row:p.row,life:.4,total:.4});}
 addSun(x,row,value=25,source='plant'){this.suns.push({id:++this.id,x,row,value,source,age:0,life:14});}
 collect(id){const s=this.suns.find(v=>v.id===id);if(!s||this.state!=='playing')return false;this.sun+=s.value;this.suns=this.suns.filter(v=>v!==s);this.effects.push({kind:'collect',x:s.x,row:s.row,value:s.value,life:.6,total:.6});this.events.push({type:'sun'});return true;}
 spawn(type,row,x=9.7){const d=ENEMIES[type];if(!d||!this.rows.includes(row))return;let scale=this.endless?1+Math.max(0,this.wave-8)*.035:1;this.enemies.push({id:++this.id,type,row,x,hp:d.hp*scale,max:d.hp*scale,speed:d.speed,damage:d.damage,age:0,slow:0,hit:0,chewing:false,bite:0});}
 beginWave(){this.wave++;let final=!this.endless&&this.wave===this.cfg.waves;this.events.push({type:'wave',wave:this.wave,final});this.effects.push({kind:'banner',text:final?'一大波僵尸正在接近！':`第 ${this.wave} 波`,life:2.8,total:2.8});let count=this.level===0&&!this.endless?this.wave+1:this.endless?4+this.wave*2:3+Math.floor(this.level*.45)+this.wave+(final?2:0);for(let i=0;i<count;i++){let pool=this.cfg.types.filter(k=>!(this.wave===1&&k==='bucket'));pool=pool.flatMap(k=>Array(k==='normal'?4:k==='cone'?2:1).fill(k));let type=pool[Math.floor(this.rand()*pool.length)];if(this.wave===1&&i===0)type='normal';let row=this.rows[Math.floor(this.rand()*this.rows.length)];this.queue.push({at:this.time+i*(this.level===0?8:this.endless?2.6:4),type,row});}this.nextWave=this.time+(this.endless?36:this.level===0?38:55);}
 damage(e,n,burn=false){if(e.dead)return;e.hp-=n;e.hit=.13;if(e.hp<=0){e.dead=true;this.kills++;this.score+=e.type==='bucket'?50:e.type==='cone'?25:10;this.corpses.push({id:e.id,type:e.type,row:e.row,x:e.x,age:0,burn});this.events.push({type:'kill'});}}
 blast(x,row,radius=1.5,wholeRow=false){this.effects.push({kind:wholeRow?'fire':'boom',x,row,life:wholeRow?.9:.8,total:wholeRow?.9:.8});for(const e of this.enemies)if(!e.dead&&(wholeRow?e.row===row:Math.abs(e.row-row)<=1&&Math.abs(e.x-x)<=radius))this.damage(e,1800,true);this.events.push({type:'boom'});}
 tick(dt){if(this.state!=='playing')return;dt=Math.max(0,Math.min(.1,dt));this.time+=dt;for(const k in this.cooldowns)this.cooldowns[k]=Math.max(0,this.cooldowns[k]-dt);this.effects.forEach(e=>e.life-=dt);this.effects=this.effects.filter(e=>e.life>0);this.corpses.forEach(e=>e.age+=dt);this.corpses=this.corpses.filter(e=>e.age<1.5);this.suns.forEach(s=>{s.life-=dt;s.age+=dt;});this.suns=this.suns.filter(s=>s.life>0);
 this.sky-=dt;if(this.sky<=0){this.addSun(.3+this.rand()*8.4,this.rows[Math.floor(this.rand()*this.rows.length)],25,'sky');this.sky=7+this.rand()*2;}
 if(this.time>=this.nextWave&&this.wave<this.cfg.waves&&!this.queue.length)this.beginWave();while(this.queue.length&&this.queue[0].at<=this.time){const q=this.queue.shift();this.spawn(q.type,q.row);}
 for(const p of [...this.plants]){p.age+=dt;p.timer-=dt;p.recoil=Math.max(0,p.recoil-dt);p.hit=Math.max(0,p.hit-dt);const d=PLANTS[p.type];if(p.type==='cherry'&&p.age>=1){this.blast(p.col+.5,p.row);this.removePlant(p);continue;}if(p.type==='jalapeno'&&p.age>=1){this.blast(p.col+.5,p.row,99,true);this.removePlant(p);continue;}if(p.type==='potato'&&p.age>=14){const close=this.enemies.filter(e=>!e.dead&&e.row===p.row&&Math.abs(e.x-(p.col+.5))<.65);if(close.length){this.effects.push({kind:'boom',x:p.col+.5,row:p.row,life:.7,total:.7});for(const e of this.enemies)if(!e.dead&&e.row===p.row&&Math.abs(e.x-(p.col+.5))<.9)this.damage(e,1800,true);this.removePlant(p);this.events.push({type:'boom'});}continue;}
 if(p.timer>0)continue;if(p.type==='sun'){this.addSun(p.col+.65,p.row);p.timer=d.period;p.recoil=.4;continue;}if(d.damage&&this.enemies.some(e=>!e.dead&&e.row===p.row&&e.x>p.col+.45&&e.x<10)){const shots=p.type==='repeater'?2:1;for(let i=0;i<shots;i++)this.shots.push({x:p.col+.86-i*.35,row:p.row,damage:d.damage,ice:p.type==='ice',dead:false});p.timer=d.period;p.recoil=.2;this.events.push({type:'shoot'});}}
 for(const b of this.shots){const old=b.x;b.x+=dt*4.1;const e=this.enemies.filter(e=>!e.dead&&e.row===b.row&&e.x>=old-.2&&e.x<=b.x+.18).sort((a,c)=>a.x-c.x)[0];if(e){this.damage(e,b.damage);if(b.ice)e.slow=5;b.dead=true;this.effects.push({kind:'hit',x:e.x,row:e.row,life:.2,total:.2,ice:b.ice});this.events.push({type:'hit'});}if(b.x>10.5)b.dead=true;}this.shots=this.shots.filter(b=>!b.dead);
 for(const e of this.enemies){if(e.dead)continue;e.age+=dt;e.hit=Math.max(0,e.hit-dt);e.slow=Math.max(0,e.slow-dt);e.bite-=dt;const target=this.plants.filter(p=>p.row===e.row&&e.x>=p.col+.15&&e.x<=p.col+1.03).sort((a,b)=>b.col-a.col)[0];e.chewing=!!target;if(target){const mul=e.slow>0?.5:1;target.hp-=e.damage*dt*mul;if(e.bite<=0){target.hit=.18;e.bite=.65/mul;this.events.push({type:'chomp'});}if(target.hp<=0)this.removePlant(target);}else e.x-=e.speed*dt*(e.slow>0?.5:1);if(e.x<-.25){const m=this.mowers[e.row];if(m.ready){m.ready=false;m.active=true;this.events.push({type:'mower'});}else if(!m.active){this.state='lost';this.events.push({type:'lost'});}}}
 for(let r=0;r<5;r++){const m=this.mowers[r];if(m.active){m.x+=dt*5;for(const e of this.enemies)if(!e.dead&&e.row===r&&e.x<m.x+.8)this.damage(e,99999);if(m.x>10.8)m.active=false;}}
 this.enemies=this.enemies.filter(e=>!e.dead);if(!this.endless&&this.wave===this.cfg.waves&&!this.queue.length&&!this.enemies.length&&this.state==='playing'){this.state='won';this.events.push({type:'won'});}
 }
}
const api={Game,PLANTS,ENEMIES,LEVELS,seeded};if(typeof module!=='undefined')module.exports=api;root.LawnGame=api;
})(typeof globalThis!=='undefined'?globalThis:this);
