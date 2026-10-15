/* Original bitmap UI and a deterministic, combat-free lawn-unrolling scene. */
(function(root){'use strict';
const FILES=['Surface.png','Logo.jpg','LogoWord.jpg','SelectorScreenStartAdventur.png','OptionsMenuback32.png','OptionsBackButton32.png','Button.png','LoadBar.png','SodRoll.png','SodRollCap.png','background1unsodded.jpg','SunBack.png','ShovelBack.png','FlagMeterEmpty.png','FlagMeterFull.png','FlagMeterParts1.png','FlagMeterParts2.png','Almanac_IndexBack.jpg','Almanac_PlantBack.jpg','Almanac_ZombieBack.jpg','Almanac_PlantCard.png','Almanac_ZombieCard.png','Almanac_CloseButton.png','SelectorScreen_Almanac.png','SelectorScreen_AlmanacHighlight.png','Challenge_Background.jpg','Challenge.png','PrepareGrowPlants.png'];
const DURATION=4.7;
function progress(time){const p=Math.max(0,Math.min(1,(time-.25)/2.5));return 1-(1-p)**1.35;}
function ground(renderer,ctx,game,reveal=1){const G=root.LawnRenderer?.G||{x:250,y:85,w:80,h:96,width:1100,height:600};const im=renderer.images;
 if(game.rows.length===5&&reveal===1){ctx.drawImage(im['lawn.jpg'],0,0,1400,600);return;}
 ctx.drawImage(im['ui/background1unsodded.jpg'],0,0,1400,600);
 ctx.save();ctx.beginPath();for(const row of game.rows)ctx.rect(G.x,G.y+row*G.h,G.w*9*reveal,G.h);ctx.clip();ctx.drawImage(im['lawn.jpg'],0,0,1400,600);ctx.restore();
}
function drawIntro(renderer,ctx,game,time){const G=root.LawnRenderer.G,im=renderer.images,p=progress(time);ctx.clearRect(0,0,G.width,G.height);ground(renderer,ctx,game,p);
 if(time<2.9){const top=G.y+game.rows[0]*G.h,bottom=G.y+(game.rows.at(-1)+1)*G.h,x=G.x+G.w*9*p,bodyW=55;
 ctx.save();ctx.globalAlpha=Math.min(1,time/.15,Math.max(0,(2.9-time)/.2));ctx.fillStyle='#20130955';ctx.beginPath();ctx.ellipse(x+4,bottom+4,39,12,0,0,Math.PI*2);ctx.fill();ctx.drawImage(im['ui/SodRoll.png'],x-bodyW/2,top,bodyW,bottom-top-22);ctx.translate(x,bottom-25);ctx.rotate(p*Math.PI*7);ctx.drawImage(im['ui/SodRollCap.png'],-35,-35,70,70);ctx.restore();}
 else {renderer.draw(ctx,game,null,null,{});const phase=Math.min(2,Math.floor((time-2.9)/.6));const pic=im['ui/PrepareGrowPlants.png'];ctx.drawImage(pic,0,phase*108,255,108,422,230,255,108);}
}
const api={FILES,DURATION,progress,ground,drawIntro};root.LawnUI=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
