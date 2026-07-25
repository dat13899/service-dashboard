// == hermes-visuals.js — ALL drawing modes, audio, UI, controls ==

// ─── Aurora Mode ─────────────────────────────────────────────
const AURORA_BANDS=6;
let auroraBands=[];
function initAuroraBands(){
  auroraBands=[];
  const colors=[
    {h:110,s:70,l:55},
    {h:150,s:65,l:50},
    {h:190,s:60,l:45},
    {h:250,s:55,l:50},
    {h:300,s:50,l:45},
    {h:340,s:45,l:50},
  ];
  for(let i=0;i<AURORA_BANDS;i++){
    auroraBands.push({
      color:colors[i%colors.length],
      freq:rand(.003,.007),
      amp:rand(.04,.12),
      speed:rand(.15,.4),
      phase:rand(0,PI2),
      height:rand(80,180),
      alpha:rand(.025,.06),
    });
  }
}
// --- initAuroraBands moved to init sequence (called from hermes.html inline script after resize())

let auroraActive=false;

// ─── Scene Transition ───────────────────────────────────────────────
let sceneTransition={active:false,progress:0,fromMode:'',toMode:'',duration:600};
let sceneTransStart=0;

// ─── Word Form Mode ──────────────────────────────────────────────────
let wordMode=false;
let wordParticles=[];
let wordForming=false;
let wordFormed=false;
let wordHoldTimer=0;
const WORD_HOLD_DURATION=8000;
const WORD_SETTLE_SPEED=.025;
const WORD_CANVAS=document.createElement('canvas');
const WORD_CTX=WORD_CANVAS.getContext('2d');
let wordTargets=[];

function getWordPixelTargets(text,maxParticles=800){
  WORD_CANVAS.width=800;
  WORD_CANVAS.height=200;
  WORD_CTX.fillStyle='#000';
  WORD_CTX.fillRect(0,0,800,200);
  let fontSize=Math.min(120,Math.floor(800/text.length*1.2));
  if(text.length<=2)fontSize=Math.min(200,fontSize);
  WORD_CTX.textAlign='center';
  WORD_CTX.textBaseline='middle';
  WORD_CTX.fillStyle='#fff';
  WORD_CTX.font=`bold ${fontSize}px system-ui,sans-serif`;
  WORD_CTX.fillText(text,400,100);

  const imgData=WORD_CTX.getImageData(0,0,800,200);
  const d=imgData.data;
  const targets=[];
  const step=2;
  for(let y=0;y<200;y+=step){
    for(let x=0;x<800;x+=step){
      const i=(y*800+x)*4;
      if(d[i+3]>128){
        const jitterX=rand(-4,4);
        const jitterY=rand(-4,4);
        const cx=Math.round(W/2-400+x+jitterX);
        const cy=Math.round(H/2-100+y+jitterY);
        if(cx>0&&cx<W&&cy>0&&cy<H){
          targets.push({x:cx,y:cy});
          if(targets.length>=maxParticles)break;
        }
      }
    }
    if(targets.length>=maxParticles)break;
  }
  return targets;
}

function spawnWordParticles(text){
  wordTargets=getWordPixelTargets(text);
  if(wordTargets.length<5)return;
  wordParticles=[];
  wordForming=true;
  wordFormed=false;
  wordHoldTimer=0;
  const p=PALETTES[paletteIdx];
  for(let i=0;i<wordTargets.length;i++){
    const tgt=wordTargets[i];
    wordParticles.push({
      x:rand(0,W),y:rand(0,H),
      tx:tgt.x,ty:tgt.y,
      vx:rand(-60,60),vy:rand(-60,60),
      size:rand(1.5,4),
      hue:rand(p.partHue[0],p.partHue[1]),
      sat:rand(p.partSat[0],p.partSat[1]),
      lig:rand(p.partLig[0],p.partLig[1]),
      life:1,decay:.001,
      phase:rand(0,PI2),
      trail:[]
    });
  }
  // Hide regular particles when word mode forms
}

function updateWordParticles(dt){
  if(!wordForming||wordParticles.length===0)return;
  let settled=0;
  for(const wp of wordParticles){
    const dx=wp.tx-wp.x;
    const dy=wp.ty-wp.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    if(dist>.5){
      const speed=wordFormed ? .1 : WORD_SETTLE_SPEED*dt;
      const factor=Math.min(1,speed*(1+30/(dist+5)));
      wp.vx=lerp(wp.vx,dx*factor,.12);
      wp.vy=lerp(wp.vy,dy*factor,.12);
    }else{
      wp.x=wp.tx;wp.y=wp.ty;
      wp.vx*=0;wp.vy*=0;
      settled++;
    }
    wp.vx*=.93;wp.vy*=.93;
    wp.x+=wp.vx*dt*.016;
    wp.y+=wp.vy*dt*.016;
    wp.trail.push({x:wp.x,y:wp.y});
    if(wp.trail.length>6)wp.trail.shift();
  }

  if(!wordFormed&&settled>wordParticles.length*.85){
    wordFormed=true;
    wordHoldTimer=0;
  }
  if(wordFormed){
    wordHoldTimer+=dt;
    if(wordHoldTimer>WORD_HOLD_DURATION){
      // Disperse
      for(const wp of wordParticles){
        wp.vx+=rand(-30,30);
        wp.vy+=rand(-40,40);
        wp.decay=.002;
      }
      wordForming=false;
    }
  }
}

function drawWordParticles(){
  if(wordParticles.length===0)return;
  for(const wp of wordParticles){
    wp.life-=wp.decay*dt;
    if(wp.life<=0)continue;
    const tw=Math.sin(performance.now()*.003+wp.phase)*.15+.85;
    const pSize=wp.size*tw*(wordFormed?1.2:1);
    const a=wp.life*(wordFormed ? .9 : .6);

    // Trail
    for(let t=1;t<wp.trail.length;t++){
      const ta=t/wp.trail.length;
      tctx.globalAlpha=ta*.1*a;
      tctx.strokeStyle=`hsla(${wp.hue},${wp.sat}%,${wp.lig+15}%,${ta*.4})`;
      tctx.lineWidth=pSize*ta*.4;
      tctx.beginPath();tctx.moveTo(wp.trail[t-1].x,wp.trail[t-1].y);
      tctx.lineTo(wp.trail[t].x,wp.trail[t].y);tctx.stroke();
    }

    // Glow
    ctx.globalAlpha=a*.35;
    const gl=ctx.createRadialGradient(wp.x,wp.y,0,wp.x,wp.y,pSize*6);
    gl.addColorStop(0,`hsla(${wp.hue},${wp.sat}%,${wp.lig}%,.5)`);
    gl.addColorStop(.4,`hsla(${wp.hue},${wp.sat}%,${wp.lig}%,.15)`);
    gl.addColorStop(1,'hsla(0,0%,100%,0)');
    ctx.fillStyle=gl;ctx.beginPath();ctx.arc(wp.x,wp.y,pSize*6,0,PI2);ctx.fill();

    // Core
    ctx.globalAlpha=a*.9;
    ctx.fillStyle=`hsla(${wp.hue},${wp.sat}%,${wp.lig}%,.95)`;
    ctx.beginPath();ctx.arc(wp.x,wp.y,pSize,0,PI2);ctx.fill();
    ctx.globalAlpha=1;
  }
  tctx.globalAlpha=1;
}

// ─── Word Text Input ─────────────────────────────────────────────────
const wordModal=document.getElementById('word-modal');
const wordInput=document.getElementById('word-input');
const wordSubmit=document.getElementById('word-submit');
let wordModalActive=false;

function openWordModal(){
  wordModal.classList.add('show');
  wordInput.value='';
  wordModalActive=true;
  setTimeout(()=>wordInput.focus(),100);
}

function submitWordText(){
  const text=wordInput.value.trim();
  if(!text||text.length<1)return;
  wordModal.classList.remove('show');
  wordModalActive=false;
  spawnWordParticles(text);
}

wordSubmit.addEventListener('click',submitWordText);
wordInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();submitWordText();}
  if(e.key==='Escape'){wordModal.classList.remove('show');wordModalActive=false;}
});
wordModal.addEventListener('click',e=>{
  if(e.target===wordModal){wordModal.classList.remove('show');wordModalActive=false;}
});

// ─── Gradient Color Strip ────────────────────────────────────────────
const gradCanvas=document.getElementById('gradient-canvas');
const gradCtx=gradCanvas.getContext('2d');
const gradStrip=document.getElementById('gradient-strip');
const gradPicker=document.getElementById('gradient-picker');

function renderGradientStrip(){
  const rect=gradStrip.getBoundingClientRect();
  const w=Math.round(rect.width);
  const h=Math.round(rect.height);
  gradCanvas.width=w;
  gradCanvas.height=h;
  const grd=gradCtx.createLinearGradient(0,0,w,0);
  grd.addColorStop(0,'hsl(0,100%,70%)');
  grd.addColorStop(.17,'hsl(60,100%,70%)');
  grd.addColorStop(.33,'hsl(120,100%,70%)');
  grd.addColorStop(.5,'hsl(180,100%,70%)');
  grd.addColorStop(.67,'hsl(240,100%,70%)');
  grd.addColorStop(.83,'hsl(300,100%,70%)');
  grd.addColorStop(1,'hsl(360,100%,70%)');
  gradCtx.fillStyle=grd;
  gradCtx.fillRect(0,0,w,h);
}
renderGradientStrip();

function pickGradientColor(clientX){
  const rect=gradStrip.getBoundingClientRect();
  let x=clientX-rect.left;
  x=clamp(x,0,rect.width);
  const hue=Math.round((x/rect.width)*360);
  paintHue=clamp(hue,0,360);
  const pct=(paintHue/360)*100;
  gradPicker.style.left=`calc(${pct}% - 2px)`;
  paintHueInd.style.background=`hsl(${paintHue},80%,70%)`;
}

gradStrip.addEventListener('mousedown',e=>{
  pickGradientColor(e.clientX);
  function onMove(ev){pickGradientColor(ev.clientX);}
  function onUp(){document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);}
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
});

// ─── Tunnel Mode ─────────────────────────────────────────────────────
let tunnelMode=false;
let tunnelTransition=0;
let tunnelTargetTransition=0;
const TUNNEL_SPEED=.04;
let tunnelAngle=0;

// The effective tunnel speed (adjusted by config)
function getTunnelSpeed(){return .04*(cfgTunnelSpeed/5);}

// ─── Background panorama ────────────────────────────────────────────
const PANO_SPEED=.00005;
const PANO_W=400;
const PANO_H=400;
const panoCanvas=document.createElement('canvas');
panoCanvas.width=PANO_W;panoCanvas.height=PANO_H;
const panoCtx=panoCanvas.getContext('2d');
let panoTime=0;

function renderPanorama(time){
  const p=PALETTES[paletteIdx];
  const img=panoCtx.createImageData(PANO_W,PANO_H);
  const d=img.data;
  for(let y=0;y<PANO_H;y++){
    for(let x=0;x<PANO_W;x++){
      const i=(y*PANO_W+x)*4;
      const n1=Math.sin(x*.02+time*PANO_SPEED)*Math.cos(y*.025+time*PANO_SPEED*.7);
      const n2=Math.sin((x-y)*.015+time*PANO_SPEED*1.3)*Math.cos((x+y)*.01+time*PANO_SPEED*.5);
      const n3=Math.sin(x*.03-time*PANO_SPEED*.9)*Math.cos(y*.035+time*PANO_SPEED*1.1);
      const n=(n1*.5+n2*.3+n3*.2)*.5+.5;
      const bgl=lerp(p.bgGrad[0][0],p.bgGrad[1][0],y/PANO_H);
      const bgr=lerp(p.bgGrad[0][1],p.bgGrad[1][1],y/PANO_H);
      const bgb=lerp(p.bgGrad[0][2],p.bgGrad[1][2],y/PANO_H);
      const nc=p.nebula[y%p.nebula.length];
      const nStrength=n*.08;
      d[i]=Math.min(255,Math.round(bgl+nStrength*nc[0]));
      d[i+1]=Math.min(255,Math.round(bgr+nStrength*nc[1]));
      d[i+2]=Math.min(255,Math.round(bgb+nStrength*nc[2]));
      d[i+3]=255;
    }
  }
  panoCtx.putImageData(img,0,0);
}

// ─── Stars ───────────────────────────────────────────────────────────
const STARS_CNT=1200;
const stars=[];
const GALAXY_ROTATION={x:W/2,y:H/4,strength:.02};
for(let i=0;i<STARS_CNT;i++){
  const layer=Math.floor(rand(0,4));
  const angle=rand(0,PI2);
  const radial=rand(0,1);
  stars.push({
    x:rand(0,W),y:rand(0,H),
    size:layer===0?rand(.2,.5):layer===1?rand(.5,1):layer===2?rand(1,1.8):rand(1.8,3.5),
    layer,
    baseAlpha:layer===0?rand(.15,.4):layer===1?rand(.3,.55):layer===2?rand(.5,.8):rand(.7,1),
    twinkleSpeed:rand(.2,4),
    twinklePhase:rand(0,PI2),
    gAngle:angle,gRadial:radial,gSpeed:rand(-.0002,.0002),
    tz:rand(.01,.99),
    tAngle:rand(0,PI2),
    tRadial:rand(.05,.95)
  });
}

// ─── Nebula clouds ──────────────────────────────────────────────────
const NEBULA_CNT=14;
const nebulas=[];
for(let i=0;i<NEBULA_CNT;i++){
  const c=PALETTES[0].nebula[i%PALETTES[0].nebula.length];
  nebulas.push({
    x:rand(0,W),y:rand(0,H),
    vx:rand(-.05,.05),vy:rand(-.05,.05),
    radius:rand(80,350),
    baseAlpha:rand(.025,.07),
    pulse:rand(.2,.6),pulseSpeed:rand(.0008,.0035),
    phase:rand(0,PI2),
    cr:c[0],cg:c[1],cb:c[2],
    tr:c[0],tg:c[1],tb:c[2]
  });
}

// ─── Particles ──────────────────────────────────────────────────────
const MAX_PARTICLES_BASE=350;
function getEffMaxParticles(){return Math.round(150+cfgDensity*80);}
const particles=[];
let mouse={x:W/2,y:H/2,active:false};
let clickBoom=false,boomTimer=0;

// ─── Gravity Well ───────────────────────────────────────────────────
let gravityWell={active:false,x:0,y:0,strength:0,radius:200};
let mouseDown=false;
let gravityDownTimer=0;

addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true;if(paintMode&&mouseDown)paintSpawnTimer=0});
addEventListener('mousedown',e=>{
  mouseDown=true;gravityDownTimer=0;
  gravityWell.active=true;
  gravityWell.x=e.clientX;gravityWell.y=e.clientY;
  gravityWell.strength=0;
  if(paintMode)paintMouseDown=true;
});
addEventListener('mouseup',e=>{
  mouseDown=false;
  if(!paintMode){
    for(const p of particles){
      const dx=p.x-gravityWell.x,dy=p.y-gravityWell.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<gravityWell.radius*1.5&&d>1){
        const f=Math.min(12,gravityWell.strength*30/(d+10));
        p.vx+=dx/d*f;p.vy+=dy/d*f;
        p.life=Math.min(1,p.life+.15);
      }
    }
  }
  gravityWell.active=false;gravityWell.strength=0;
  paintMouseDown=false;
});
addEventListener('click',()=>{
  if(!mouseDown&&!paintMode)doExplosion(mouse.x,mouse.y,50);
});
addEventListener('touchmove',e=>{
  const t=e.touches[0];mouse.x=t.clientX;mouse.y=t.clientY;mouse.active=true;
  if(e.touches.length===1&&!paintMode){
    gravityWell.active=true;gravityWell.x=mouse.x;gravityWell.y=mouse.y;
  }
  if(paintMode&&e.touches.length>=1)paintSpawnTimer=0;
},{passive:true});
addEventListener('touchstart',e=>{
  const t=e.touches[0];mouse.x=t.clientX;mouse.y=t.clientY;mouse.active=true;
  if(!paintMode){
    gravityWell.active=true;gravityWell.x=mouse.x;gravityWell.y=mouse.y;
    doExplosion(mouse.x,mouse.y,30);
  }
  if(paintMode)paintMouseDown=true;
},{passive:true});
addEventListener('touchend',()=>{
  if(!paintMode){
    gravityWell.active=false;gravityWell.strength=0;
    for(const p of particles){
      const dx=p.x-gravityWell.x,dy=p.y-gravityWell.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<gravityWell.radius*1.5&&d>1){
        p.vx+=dx/d*4;p.vy+=dy/d*4;
      }
    }
  }
  paintMouseDown=false;
});

function doExplosion(x,y,count){
  clickBoom=true;boomTimer=1.2;
  for(let i=0;i<count;i++){
    if(particles.length>=getEffMaxParticles())break;
    const ang=rand(0,PI2),spd=rand(120,400);
    particles.push(createParticle(x,y,Math.cos(ang)*spd,Math.sin(ang)*spd,true));
  }
}

let audioReactive=true;
let audioLevel=0;

function createParticle(x,y,vx,vy,explosion=false){
  const p=PALETTES[paletteIdx];
  const size=explosion?rand(2.5,7):rand(1.5,5);
  return{
    x,y,vx,vy,
    life:1,decay:explosion?rand(.005,.012):rand(.0012,.0045),
    size,
    hue:rand(p.partHue[0],p.partHue[1]),
    sat:rand(p.partSat[0],p.partSat[1]),
    lig:rand(p.partLig[0],p.partLig[1]),
    targetHue:null,
    trail:[],oscPhase:rand(0,PI2),
    baseSize:size,
    _gravitated:false,
    _paint:false
  };
}
for(let i=0;i<40;i++){
  const ang=rand(0,PI2),spd=rand(10,60);
  particles.push(createParticle(rand(0,W),rand(0,H),Math.cos(ang)*spd,Math.sin(ang)*spd));
}

// ─── Paint Spawn ─────────────────────────────────────────────────────
function spawnPaintParticle(x,y){
  if(particles.length>=getEffMaxParticles())return;
  const p=createParticle(x,y,rand(-5,5),rand(-5,5),false);
  p.hue=paintHue;
  p.sat=rand(60,100);
  p.lig=rand(60,90);
  p.baseSize=paintBrushSize*rand(.4,1);
  p.size=p.baseSize;
  p.decay=rand(.0008,.002);
  p.life=1;
  p._paint=true;
  p.trail=[];
  particles.push(p);
}

// ─── Shooting Stars ─────────────────────────────────────────────────
const SHOOTER_INTERVAL=2500;
let shooterTimer=rand(0,SHOOTER_INTERVAL);
let shooters=[];
function spawnShooter(){
  const angle=rand(-.4,.4)-Math.PI/1.7;
  const speed=rand(1200,3500);
  shooters.push({
    x:rand(0,W),y:rand(-H*.12,0),
    vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
    life:1,decay:rand(.005,.016),
    width:rand(1.2,3.8),
  });
}

// ─── Cosmic Web ─────────────────────────────────────────────────────
const WEB_POINTS=160;
const webPoints=[];
for(let i=0;i<WEB_POINTS;i++){
  webPoints.push({x:rand(0,W),y:rand(0,H),vx:rand(-.03,.03),vy:rand(-.03,.03)});
}
function drawCosmicWeb(time){
  const tr=tunnelTransition;
  if(tr>.5)return;
  const scene=SCENE_MODES.find(m=>m.id===currentMode);
  const webMul=scene?scene.webMul:1;
  if(webMul<.01)return;
  const accent=PALETTES[paletteIdx].accent;
  const dMax=currentMode==='constellation'?280:160;
  const alphaMul=(1-tr)*webMul;
  for(let i=0;i<webPoints.length;i++){
    const a=webPoints[i];
    a.x+=a.vx;a.y+=a.vy;
    if(a.x<0||a.x>W)a.vx*=-1;
    if(a.y<0||a.y>H)a.vy*=-1;
    for(let j=i+1;j<webPoints.length;j++){
      const b=webPoints[j];
      const dx=a.x-b.x,dy=a.y-b.y;
      const d=dx*dx+dy*dy;
      if(d<dMax*dMax){
        const alpha=(1-d/(dMax*dMax))*.25*alphaMul;
        if(alpha<.005)continue;
        const arMul=currentMode==='constellation'?2:1;
        ctx.globalAlpha=alpha*arMul*(.5+audioLevel*1.5);
        ctx.strokeStyle=`rgba(${accent[0]},${accent[1]},${accent[2]},${alpha*2*arMul})`;
        ctx.lineWidth=currentMode==='constellation' ? .7 : .4;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
  }
  ctx.globalAlpha=1;
}

// ─── Web Audio ──────────────────────────────────────────────────────
let audioCtx=null,audioGain=null,analyser=null,audioNodes=[],audioEnabled=false,freqData=null;
window.audioInitialized=false;

function initAudio(){
  if(window.audioInitialized)return;
  window.audioInitialized=true;
  try{
    audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume();
    analyser=audioCtx.createAnalyser();analyser.fftSize=64;
    freqData=new Uint8Array(analyser.frequencyBinCount);
    audioGain=audioCtx.createGain();audioGain.gain.value=0;
    audioGain.connect(analyser);analyser.connect(audioCtx.destination);
    const now=audioCtx.currentTime;
    audioGain.gain.setValueAtTime(0,now);audioGain.gain.linearRampToValueAtTime(.22,now+3);

    const add=(fn,arr)=>{fn();arr.forEach(n=>n.start?.());arr.forEach(n=>audioNodes.push(n));};
    add(()=>{
      const o=audioCtx.createOscillator();o.type='sine';o.frequency.value=27.5;
      const g=audioCtx.createGain();g.gain.value=.12;
      const l=audioCtx.createOscillator();l.frequency.value=.3;
      const lg=audioCtx.createGain();lg.gain.value=5;
      l.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(audioGain);
      [o,l,g,lg].forEach(n=>audioNodes.push(n));
      o.start();l.start();
    },[]);
    add(()=>{
      const o=audioCtx.createOscillator();o.type='sine';o.frequency.value=41.2;
      const g=audioCtx.createGain();g.gain.value=.07;
      const l=audioCtx.createOscillator();l.frequency.value=.5;
      const lg=audioCtx.createGain();lg.gain.value=4;
      l.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(audioGain);
      o.start();l.start();
    },[]);
    add(()=>{
      const buf=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate);
      const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      const s=audioCtx.createBufferSource();s.buffer=buf;s.loop=true;
      const bp=audioCtx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=180;bp.Q=2.5;
      const g=audioCtx.createGain();g.gain.value=.035;
      const l=audioCtx.createOscillator();l.frequency.value=.06;
      const lg=audioCtx.createGain();lg.gain.value=120;
      l.connect(lg);lg.connect(bp.frequency);s.connect(bp);bp.connect(g);g.connect(audioGain);
      s.start();l.start();
    },[]);
    add(()=>{
      const o=audioCtx.createOscillator();o.type='triangle';o.frequency.value=880;
      const g=audioCtx.createGain();g.gain.value=.018;
      const l=audioCtx.createOscillator();l.frequency.value=.12;
      const lg=audioCtx.createGain();lg.gain.value=350;
      l.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(audioGain);
      o.start();l.start();
    },[]);

    (function scheduleChime(){
      if(!audioEnabled)return;
      const n=audioCtx.currentTime;
      const o=audioCtx.createOscillator();o.type='sine';
      const g=audioCtx.createGain();g.gain.setValueAtTime(0,n);
      const notes=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,784];
      o.frequency.value=notes[Math.floor(Math.random()*notes.length)];
      const s=n+rand(5,15);
      g.gain.linearRampToValueAtTime(.04,s+.1);
      g.gain.exponentialRampToValueAtTime(.001,s+rand(2,5));
      o.connect(g);g.connect(audioGain);
      o.start(s);o.stop(s+6);
      setTimeout(scheduleChime,rand(8,22)*1000);
    })();

    audioEnabled=true;
    document.getElementById('vol-toggle').textContent='♫';
    document.getElementById('vol-toggle').style.color='rgba(91,192,255,.8)';
  }catch(e){console.warn('Audio:',e);document.getElementById('vol-toggle').style.display='none'}
}

function toggleAudio(){
  if(!window.audioInitialized){initAudio();return}
  audioEnabled=!audioEnabled;
  const n=audioCtx.currentTime;
  if(audioEnabled){
    audioGain.gain.linearRampToValueAtTime(.22,n+2);
    document.getElementById('vol-toggle').textContent='♫';
    document.getElementById('vol-toggle').style.color='rgba(91,192,255,.8)';
  }else{
    audioGain.gain.linearRampToValueAtTime(0,n+1);
    document.getElementById('vol-toggle').textContent='♪';
    document.getElementById('vol-toggle').style.color='rgba(200,220,255,.5)';
    audioLevel=0;
  }
}
document.getElementById('vol-toggle').addEventListener('click',toggleAudio);

function updateAudioLevel(){
  if(!audioEnabled||!analyser||!freqData)return;
  try{
    analyser.getByteFrequencyData(freqData);
    let s=0;for(let i=0;i<freqData.length;i++)s+=freqData[i];
    audioLevel=s/(freqData.length*255);
    document.getElementById('audio-dot').style.opacity=.3+audioLevel*.7;
  }catch(_){}
}

// ─── Thunder Rumble Audio (triggered by lightning) ────────────────
function playThunderRumble(intensity){
  if(!audioEnabled||!audioCtx||!audioGain)return;
  try{
    const now=audioCtx.currentTime;
    const freq=rand(30,80);
    const o=audioCtx.createOscillator();
    o.type='sine';
    o.frequency.setValueAtTime(freq,now);
    o.frequency.exponentialRampToValueAtTime(freq*.3,now+1.5);
    const g=audioCtx.createGain();
    g.gain.setValueAtTime(0,now);
    const vol=clamp(intensity*.12,0,.2);
    g.gain.linearRampToValueAtTime(vol,now+.05);
    g.gain.exponentialRampToValueAtTime(.001,now+1.8);
    o.connect(g);g.connect(audioGain);
    o.start(now);o.stop(now+2.5);
    // Sub-harmonic rumble
    const o2=audioCtx.createOscillator();
    o2.type='triangle';
    o2.frequency.setValueAtTime(freq*.5,now);
    const g2=audioCtx.createGain();
    g2.gain.setValueAtTime(0,now);
    g2.gain.linearRampToValueAtTime(vol*.35,now+.08);
    g2.gain.exponentialRampToValueAtTime(.001,now+2.5);
    o2.connect(g2);g2.connect(audioGain);
    o2.start(now);o2.stop(now+3);
  }catch(e){}
}

// ─── Title Vignette ─────────────────────────────────────────────────
function drawVignette(){
  const grd=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.15,W/2,H/2,Math.max(W,H)*.75);
  grd.addColorStop(0,'rgba(0,0,0,0)');
  grd.addColorStop(.6,'rgba(0,0,0,0)');
  grd.addColorStop(1,`rgba(0,0,0,${.35+tunnelTransition*.3})`);
  ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
}

// ─── Light Bloom ────────────────────────────────────────────────────
const bloom={x:W/2,y:H/2,radius:200,alpha:0};
function drawBloom(){
  bctx.clearRect(0,0,W,H);
  if(tunnelTransition>.9){bloom.alpha=lerp(bloom.alpha,0,.05);return}
  bloom.x=lerp(bloom.x,mouse.x,.08);
  bloom.y=lerp(bloom.y,mouse.y,.08);
  const targetAlpha=paintMode ? .25*(cfgBloomIntensity/5) : gravityWell.active ? .4*(cfgBloomIntensity/5) : (.15+audioLevel*.25)*(cfgBloomIntensity/5);
  bloom.alpha=lerp(bloom.alpha,targetAlpha,.03);
  if(bloom.alpha<.01)return;
  const accent=paintMode?[paintHue,60,80]:PALETTES[paletteIdx].accent;
  const grd=bctx.createRadialGradient(bloom.x,bloom.y,0,bloom.x,bloom.y,bloom.radius*(1+audioLevel*.8));
  if(paintMode){
    grd.addColorStop(0,`hsla(${paintHue},80%,70%,${bloom.alpha*.25})`);
    grd.addColorStop(.4,`hsla(${paintHue},80%,70%,${bloom.alpha*.06})`);
  }else{
    grd.addColorStop(0,`rgba(${accent[0]},${accent[1]},${accent[2]},${bloom.alpha*.3})`);
    grd.addColorStop(.4,`rgba(${accent[0]},${accent[1]},${accent[2]},${bloom.alpha*.08})`);
  }
  grd.addColorStop(1,'rgba(0,0,0,0)');
  bctx.fillStyle=grd;bctx.fillRect(0,0,W,H);
}

// ─── Palette ────────────────────────────────────────────────────────
function buildPaletteUI(){
  const c=document.getElementById('palette-indicator');c.innerHTML='';
  PALETTES.forEach((p,i)=>{
    const d=document.createElement('div');
    d.className='palette-dot'+(i===paletteIdx?' active':'');
    const col=p.nebula[0];
    d.style.background=`rgb(${col[0]},${col[1]},${col[2]})`;
    d.style.color=`rgb(${col[0]},${col[1]},${col[2]})`;
    d.addEventListener('click',()=>setPalette(i));c.appendChild(d);
  });
}
buildPaletteUI();

function setPalette(idx){
  if(idx===paletteIdx&&paletteTransition>=1)return;
  palettePrev=paletteIdx;paletteIdx=idx;paletteTransition=0;
  const p=PALETTES[idx];
  for(let i=0;i<nebulas.length;i++){
    const n=nebulas[i],c=p.nebula[i%p.nebula.length];
    n.tr=c[0];n.tg=c[1];n.tb=c[2];
  }
  for(const pt of particles)if(!pt._paint)pt.targetHue=rand(p.partHue[0],p.partHue[1]);
}

// ─── Scene Mode Switching ───────────────────────────────────────────
function setSceneMode(modeId){
  const scene=SCENE_MODES.find(m=>m.id===modeId);
  if(!scene||modeId===currentMode)return;
  const prevMode=currentMode;

  // Start transition effect
  sceneTransition.active=true;
  sceneTransition.progress=0;
  sceneTransition.fromMode=prevMode;
  sceneTransition.toMode=modeId;
  sceneTransition.duration=600;
  sceneTransStart=performance.now();

  // Switch mode after brief delay (mid-transition)
  setTimeout(()=>{
    currentMode=modeId;
    paintMode=scene.paintMode;
    wordMode=scene.wordMode;
    prismMode=scene.id==='prism';
    galaxyMode=scene.id==='galaxy';
    fireflyMode=scene.id==='firefly';
    stormMode=scene.id==='storm';
    tunnelMode=scene.tunnelDefault;
    tunnelTargetTransition=scene.tunnelDefault?1:0;

    // If entering word mode, open the modal
    if(scene.wordMode&&prevMode!=='word'){
      setTimeout(openWordModal,300);
    }

    // Update mode badge
    const badge=document.getElementById('mode-badge');
    badge.textContent=scene.badge;
    badge.className='show '+scene.badgeCls;
    if(scene.tunnelDefault||scene.id==='prism')badge.classList.add('show');
    else if(!scene.paintMode&&!scene.wordMode&&modeId!=='constellation'&&modeId!=='nebula')badge.classList.add('show');

    // Update panel buttons
    document.querySelectorAll('.mode-btn').forEach(b=>{
      b.classList.toggle('active',b.dataset.mode===modeId);
    });

    // Paint controls
    document.getElementById('paint-controls').classList.toggle('show',scene.paintMode);

    // HUD scene name
    document.getElementById('scene-name').textContent=scene.icon+' '+scene.label.toUpperCase();
  },300);
}

// ─── Scene Mode Panel UI ────────────────────────────────────────────
const panelToggle=document.getElementById('mode-panel-toggle');
const panel=document.getElementById('mode-panel');
let panelOpen=false;

function isMobilePanel(){return window.innerWidth<=768}

panelToggle.addEventListener('click',()=>{
  panelOpen=!panelOpen;
  panel.classList.toggle('open',panelOpen);
  panel.classList.toggle('visible',panelOpen);
  panelToggle.classList.toggle('open',panelOpen);
  panelToggle.textContent=panelOpen?'✕':'☰';
});

// Mobile: tap peek bar to open/close
panel.addEventListener('click',e=>{
  if(!isMobilePanel())return;
  // Only toggle if clicked on panel itself (not on a mode-btn child)
  if(e.target===panel||e.target===panel.firstChild){
    panelOpen=!panelOpen;
    panel.classList.toggle('visible',panelOpen);
  }
});

document.querySelectorAll('.mode-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const mode=btn.dataset.mode;
    setSceneMode(mode);
    // Mobile: auto-close panel
    if(isMobilePanel()&&panelOpen){
      panelOpen=false;
      panel.classList.remove('visible');
    }
  });
});

// ─── Paint Controls ─────────────────────────────────────────────────
const paintSizeSlider=document.getElementById('paint-size');
const paintSizeVal=document.getElementById('paint-size-val');
const paintHueSlider=document.getElementById('paint-hue');
const paintHueInd=document.getElementById('paint-hue-indicator');

if(paintHueSlider){
  paintSizeSlider.addEventListener('input',()=>{
    paintBrushSize=parseFloat(paintSizeSlider.value);
    paintSizeVal.textContent=paintBrushSize;
  });
}
paintHueInd.style.background='hsl(200,80%,70%)';

const paintClearBtn=document.getElementById('paint-clearbtn');
paintClearBtn.addEventListener('click',()=>{
  document.getElementById('trailCanvas').getContext('2d').clearRect(0,0,W,H);
  particles.length=0;
});

// ─── Snapshot ───────────────────────────────────────────────────────
function takeSnapshot(){
  const tempCanvas=document.createElement('canvas');
  tempCanvas.width=W;
  tempCanvas.height=H;
  const tmpCtx=tempCanvas.getContext('2d');
  // Draw trail canvas first
  tmpCtx.drawImage(tc,0,0);
  // Draw main canvas
  tmpCtx.drawImage(c,0,0);
  // Draw bloom
  tmpCtx.drawImage(bc,0,0);

  const link=document.createElement('a');
  link.download=`hermes-${currentMode}-${Date.now()}.png`;
  link.href=tempCanvas.toDataURL('image/png');
  link.click();

  const toast=document.getElementById('snapshot-toast');
  toast.textContent='📸 snapshot saved!';
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2000);
}

// ─── Keyboard ───────────────────────────────────────────────────────
addEventListener('keydown',e=>{
  const k=e.key;
  const n=parseInt(k);
  if(wordModalActive){if(k==='Escape'){wordModal.classList.remove('show');wordModalActive=false;}return}
  if(n>=1&&n<=PALETTES.length){e.preventDefault();setPalette(n-1);return}
  if(k==='z'||k==='Z'){e.preventDefault();let r;do{r=Math.floor(Math.random()*PALETTES.length)}while(r===paletteIdx);setPalette(r);return}
  if(k===' '||k==='Space'){e.preventDefault();doExplosion(mouse.x,mouse.y,60);return}
  if(k==='h'||k==='H'){e.preventDefault();document.getElementById('hud').classList.toggle('hidden');return}
  if(k==='m'||k==='M'){e.preventDefault();toggleAudio();return}
  if(k==='f'||k==='F'){e.preventDefault();audioReactive=!audioReactive;return}
  if(k==='p'||k==='P'){
    e.preventDefault();
    setSceneMode(paintMode?'cosmic':'paint');
    return;
  }
  if(k==='c'||k==='C'){
    e.preventDefault();
    setSceneMode(currentMode==='constellation'?'cosmic':'constellation');
    return;
  }
  if(k==='n'||k==='N'){
    e.preventDefault();
    setSceneMode(currentMode==='nebula'?'cosmic':'nebula');
    return;
  }
  if(k==='r'||k==='R'){
    e.preventDefault();
    setSceneMode(currentMode==='prism'?'cosmic':'prism');
    return;
  }
  if(k==='t'||k==='T'){
    e.preventDefault();
    const scene=SCENE_MODES.find(m=>m.id===currentMode);
    if(scene&&scene.tunnelDefault){
      setSceneMode('cosmic');
    }else{
      setSceneMode('tunnel');
    }
    return;
  }
  if(k==='w'||k==='W'){
    e.preventDefault();
    if(currentMode==='word'){
      openWordModal();
    }else{
      setSceneMode('word');
    }
    return;
  }
  if(k==='a'||k==='A'){
    e.preventDefault();
    setSceneMode(currentMode==='aurora'?'cosmic':'aurora');
    return;
  }
  if(k==='y'||k==='Y'){
    e.preventDefault();
    setSceneMode(currentMode==='galaxy'?'cosmic':'galaxy');
    return;
  }
  if(k==='b'||k==='B'){
    if(wordModalActive)return;
    e.preventDefault();
    setSceneMode(currentMode==='firefly'?'cosmic':'firefly');
    return;
  }
  if(k==='u'||k==='U'){
    e.preventDefault();
    setSceneMode(currentMode==='storm'?'cosmic':'storm');
    return;
  }
  if(k==='o'||k==='O'){
    e.preventDefault();
    setSceneMode(currentMode==='wormhole'?'cosmic':'wormhole');
    return;
  }
  if(k==='x'||k==='X'){
    e.preventDefault();
    if(currentMode==='wormhole'){
      wormholeCinematic=!wormholeCinematic;
    }
    return;
  }
  if(k==='g'||k==='G'){
    e.preventDefault();
    toggleConfigPanel();
    return;
  }
  if(k==='s'||k==='S'){
    e.preventDefault();
    takeSnapshot();
    return;
  }
  if(k==='?'||k==='/'){e.preventDefault();document.getElementById('help-overlay').classList.toggle('show');}
});
document.getElementById('help-overlay').addEventListener('click',()=>document.getElementById('help-overlay').classList.remove('show'));

// ─── Config Panel ───────────────────────────────────────────────────
const cfgBtn=document.getElementById('cfg-btn');
const cfgPanel=document.getElementById('mode-config');
const cfgTunnelSlider=document.getElementById('cfg-tunnel-speed');
const cfgTunnelVal=document.getElementById('cfg-tunnel-val');
const cfgBloomSlider=document.getElementById('cfg-bloom');
const cfgBloomVal=document.getElementById('cfg-bloom-val');
const cfgNebulaSlider=document.getElementById('cfg-nebula-speed');
const cfgNebulaVal=document.getElementById('cfg-nebula-val');
const cfgDensitySlider=document.getElementById('cfg-density');
const cfgDensityVal=document.getElementById('cfg-density-val');
const cfgReactive=document.getElementById('cfg-reactive');
const cfgTrails=document.getElementById('cfg-trails');
const cfgHud=document.getElementById('cfg-hud');

function toggleConfigPanel(force){
  cfgPanelOpen=force!==undefined?force:!cfgPanelOpen;
  cfgPanel.classList.toggle('open',cfgPanelOpen);
  cfgBtn.classList.toggle('active',cfgPanelOpen);
}

cfgBtn.addEventListener('click',()=>toggleConfigPanel());

cfgTunnelSlider.addEventListener('input',()=>{
  cfgTunnelSpeed=parseFloat(cfgTunnelSlider.value);
  cfgTunnelVal.textContent=cfgTunnelSpeed;
});

cfgBloomSlider.addEventListener('input',()=>{
  cfgBloomIntensity=parseFloat(cfgBloomSlider.value);
  cfgBloomVal.textContent=cfgBloomIntensity;
});

cfgNebulaSlider.addEventListener('input',()=>{
  cfgNebulaSpeed=parseFloat(cfgNebulaSlider.value);
  cfgNebulaVal.textContent=cfgNebulaSpeed;
});

// Density slider is wired below with particle spawning

function toggleCfg(el,prop){
  el.classList.toggle('on');
  if(prop==='reactive'){audioReactive=el.classList.contains('on');return}
  if(prop==='trails'){showTrails=el.classList.contains('on');return}
  if(prop==='hud'){document.getElementById('hud').classList.toggle('hidden',!el.classList.contains('on'));return}
  if(prop==='viz'){showVisualizer=el.classList.contains('on');return}
}

cfgReactive.addEventListener('click',()=>toggleCfg(cfgReactive,'reactive'));
cfgTrails.addEventListener('click',()=>toggleCfg(cfgTrails,'trails'));
cfgHud.addEventListener('click',()=>toggleCfg(cfgHud,'hud'));

// ─── Keyboard Mode Cycling (Tab / Arrow Keys) ──────────────────────
addEventListener('keydown',e=>{
  const k=e.key;
  // Skip if typing in word input
  if(wordModalActive)return;
  if(k==='Tab'||k==='ArrowRight'||k==='ArrowLeft'){
    e.preventDefault();
    const idx=SCENE_MODES.findIndex(m=>m.id===currentMode);
    if(k==='Tab'||k==='ArrowRight'){
      const next=(idx+1)%SCENE_MODES.length;
      setSceneMode(SCENE_MODES[next].id);
    }else{
      const prev=(idx-1+SCENE_MODES.length)%SCENE_MODES.length;
      setSceneMode(SCENE_MODES[prev].id);
    }
  }
});

// ─── Mobile Dual-Touch Gestures ────────────────────────────────────
let touchPinchDist=0;
let touchModeCycle=false;
let touchStartAvgX=0;
addEventListener('touchstart',e=>{
  if(e.touches.length===2&&!wordModalActive){
    const t1=e.touches[0],t2=e.touches[1];
    touchPinchDist=Math.hypot(t1.clientX-t2.clientX,t1.clientY-t2.clientY);
    touchStartAvgX=(t1.clientX+t2.clientX)/2;
    touchModeCycle=true;
    e.preventDefault();
  }
},{passive:false});

addEventListener('touchmove',e=>{
  if(e.touches.length===2&&touchModeCycle){
    e.preventDefault();
    const t1=e.touches[0],t2=e.touches[1];
    const dist=Math.hypot(t1.clientX-t2.clientX,t1.clientY-t2.clientY);
    const delta=touchPinchDist-dist;

    // Pinch in → open config, Pinch out → close config
    if(Math.abs(delta)>80){
      toggleConfigPanel(delta>0);
      touchModeCycle=false;
    }

    // Two-finger horizontal swipe → cycle modes
    const avgX_now=(t1.clientX+t2.clientX)/2;
    const swipeX=avgX_now-touchStartAvgX;
    if(Math.abs(swipeX)>120){
      if(swipeX>0){
        const idx=SCENE_MODES.findIndex(m=>m.id===currentMode);
        setSceneMode(SCENE_MODES[(idx+1)%SCENE_MODES.length].id);
      }else{
        const idx=SCENE_MODES.findIndex(m=>m.id===currentMode);
        setSceneMode(SCENE_MODES[(idx-1+SCENE_MODES.length)%SCENE_MODES.length].id);
      }
      touchStartAvgX=avgX_now;
      touchModeCycle=false;
    }
  }
},{passive:false});

addEventListener('touchend',e=>{
  touchModeCycle=false;
});

// ─── Density slider wiring ─────────────────────────────────────────
cfgDensitySlider.addEventListener('input',()=>{
  cfgDensity=parseFloat(cfgDensitySlider.value);
  cfgDensityVal.textContent=cfgDensity;
  const newMax=getEffMaxParticles();
  while(particles.length<newMax&&particles.length<getEffMaxParticles()*1.5&&Math.random()<.3){
    const ang=rand(0,PI2),spd=rand(10,40);
    particles.push(createParticle(rand(0,W),rand(0,H),Math.cos(ang)*spd,Math.sin(ang)*spd));
  }
});

const cfgAuroraSlider=document.getElementById('cfg-aurora-speed');
const cfgAuroraVal=document.getElementById('cfg-aurora-val');
const cfgViz=document.getElementById('cfg-viz');

cfgAuroraSlider.addEventListener('input',()=>{
  cfgAuroraSpeed=parseFloat(cfgAuroraSlider.value);
  cfgAuroraVal.textContent=cfgAuroraSpeed;
});

cfgViz.addEventListener('click',()=>toggleCfg(cfgViz,'viz'));

// ─── Scene Transition Effect ────────────────────────────────────────
function drawSceneTransition(time){
  if(!sceneTransition.active)return;
  const elapsed=time-sceneTransStart;
  sceneTransition.progress=Math.min(1,elapsed/sceneTransition.duration);

  const p=sceneTransition.progress;
  const cx=W/2,cy=H/2;
  const maxR=Math.sqrt(W*W+H*H)/2+50;

  tranctx.clearRect(0,0,W,H);
  tranctx.globalAlpha=1;

  if(p<.5){
    // Phase 1: spiral swirl closing in
    const t=p*2;
    const r=t*t*maxR;
    const angle=t*PI2*2;

    tranctx.fillStyle='rgba(5,6,15,1)';
    // Draw a spiral swirl mask: fill everything outside the spiral curve
    tranctx.beginPath();
    // Heart shape curve decaying
    for(let a=0;a<PI2*2;a+=.02){
      const rr=r*(1-a/(PI2*2));
      const px=cx+Math.cos(angle+a)*rr;
      const py=cy+Math.sin(angle+a)*rr;
      if(a===0)tranctx.moveTo(px,py);
      else tranctx.lineTo(px,py);
    }
    tranctx.lineTo(cx+maxR*2,cy+maxR*2);
    tranctx.lineTo(cx-maxR*2,cy-maxR*2);
    tranctx.closePath();
    tranctx.fill();
  }else{
    // Phase 2: spiral expanding out
    const t=(p-.5)*2;
    const r=(1-t*t)*maxR;
    if(r<5){sceneTransition.active=false;tranctx.clearRect(0,0,W,H);return}

    // Clear everything first, then draw the opening hole
    tranctx.fillStyle='rgba(5,6,15,1)';
    tranctx.fillRect(0,0,W,H);

    // Cut a circular hole expanding
    tranctx.globalCompositeOperation='destination-out';
    tranctx.fillStyle='rgba(255,255,255,1)';
    const holeR=Math.max(.1,(1-t)*maxR);
    tranctx.beginPath();
    for(let a=0;a<PI2*2;a+=.02){
      const rr=holeR*(1-a/(PI2*2)*.3);
      const px=cx+Math.cos(a)*rr;
      const py=cy+Math.sin(a)*rr;
      if(a===0)tranctx.moveTo(px,py);
      else tranctx.lineTo(px,py);
    }
    tranctx.closePath();
    tranctx.fill();
    tranctx.globalCompositeOperation='source-over';
  }

  if(p>=1){
    sceneTransition.active=false;
    tranctx.clearRect(0,0,W,H);
  }
}

// ─── Gravity Indicator ──────────────────────────────────────────────
const gravInd=document.getElementById('gravity-indicator');
function updateGravityIndicator(){
  if(gravityWell.active&&gravityWell.strength>.3&&!paintMode){
    gravInd.classList.add('show');
    const r=gravityWell.radius*(.5+gravityWell.strength*.5);
    gravInd.style.left=(gravityWell.x-r)+'px';gravInd.style.top=(gravityWell.y-r)+'px';
    gravInd.style.width=(r*2)+'px';gravInd.style.height=(r*2)+'px';
    const accent=PALETTES[paletteIdx].accent;
    gravInd.style.borderColor=`rgba(${accent[0]},${accent[1]},${accent[2]},${.05+gravityWell.strength*.15})`;
  }else{
    gravInd.classList.remove('show');
  }
}

// ─── Drawing ────────────────────────────────────────────────────────
let prevTime=0,fps=0,frameCount=0,fpsTimer=0;
let dt=16; // will be updated each frame
const constel=document.getElementById('constellation');
let constelTimer=0;
const MAX_TRAIL=10;
const repelForce=.1;

function updateNebulas(dt){
  for(const n of nebulas){
    n.cr=lerp(n.cr,n.tr,.004*dt);
    n.cg=lerp(n.cg,n.tg,.004*dt);
    n.cb=lerp(n.cb,n.tb,.004*dt);
  }
  if(paletteTransition<1)paletteTransition=Math.min(1,paletteTransition+dt*.001);
  const pn=PALETTES[paletteIdx].name+(audioReactive?' ◇':'');
  document.getElementById('palette-name').textContent=pn;
  document.querySelectorAll('.palette-dot').forEach((d,i)=>d.classList.toggle('active',i===paletteIdx));
}

function drawBgGradient(){
  const p=PALETTES[paletteIdx];
  const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);
  const g1=p.bgGrad[0],g2=p.bgGrad[1];
  const pv=Math.sin(panoTime*PANO_SPEED*5)*.02;
  g.addColorStop(0,`rgba(${g1[0]+pv},${g1[1]+pv},${g1[2]+pv},1)`);
  g.addColorStop(1,`rgba(${g2[0]},${g2[1]},${g2[2]},1)`);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}

function drawStars(time){
  const scene=SCENE_MODES.find(m=>m.id===currentMode);
  const parallaxMul=scene?scene.starParallax:1;
  const nebulaMul=scene?scene.nebulaMul:1;

  for(const s of stars){
    if(!tunnelMode&&tunnelTransition<.1){
      if(s.gSpeed!==0){
        s.gAngle+=s.gSpeed*(1-tunnelTransition);
        const rad=s.gRadial*Math.max(W,H)*.4;
        const cx=GALAXY_ROTATION.x,sx=Math.cos(s.gAngle)*rad;
        const sy=Math.sin(s.gAngle)*rad*.6;
        s.x=cx+sx;s.y=GALAXY_ROTATION.y+sy;
      }
    }
  }

  for(const s of stars){
    const tr=tunnelTransition;
    let px,py,sz,al;

    if(tr>.01){
      const cx=W/2,cy=H/2;
      s.tz = ((s.tz - getTunnelSpeed() * tr) % 1 + 1) % 1;
      const zDepth = s.tz;
      const angle = s.tAngle + time * .00008 * (1-zDepth) * tr;
      const radial = s.tRadial * Math.max(W,H) * .55 * (1+zDepth*2);
      const sx2 = Math.cos(angle) * radial;
      const sy2 = Math.sin(angle) * radial * .6;
      const rot = time * .0003 * tr;
      const cosR=Math.cos(rot),sinR=Math.sin(rot);
      px = cx + (sx2*cosR - sy2*sinR);
      py = cy + (sx2*sinR + sy2*cosR);
      sz = s.size * (1 + zDepth * 3) * (1 + tr);
      al = s.baseAlpha * (1 + zDepth) * .8;
    } else {
      px=s.x; py=s.y; sz=s.size; al=s.baseAlpha;
    }

    const tw=Math.sin(time*s.twinkleSpeed+s.twinklePhase)*.4+.6;
    const a=al*tw;
    if(a<.01)continue;

    if(tr<.5){
      const pfx=px-(mouse.x-px)*.001*(s.layer+1)*(1+audioLevel*.5)*(1-tr)*parallaxMul;
      const pfy=py-(mouse.y-py)*.001*(s.layer+1)*(1+audioLevel*.5)*(1-tr)*parallaxMul;
      px=lerp(px,pfx,.5); py=lerp(py,pfy,.5);
    }

    if(s.layer>=3&&sz>1.5&&tr<.8){
      ctx.globalAlpha=a*.03*nebulaMul;
      ctx.fillStyle='rgba(255,255,255,.5)';
      ctx.beginPath();ctx.arc(px,py,sz*6,0,PI2);ctx.fill();
    }
    ctx.globalAlpha=a;
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(px,py,sz,0,PI2);ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawNebulas(time){
  const tr=tunnelTransition;
  const scene=SCENE_MODES.find(m=>m.id===currentMode);
  const nebulaMul=scene?scene.nebulaMul:1;
  for(const n of nebulas){
    n.x+=n.vx*(cfgNebulaSpeed/5);n.y+=n.vy*(cfgNebulaSpeed/5);
    if(n.x<-n.radius)n.x=W+n.radius;if(n.x>W+n.radius)n.x=-n.radius;
    if(n.y<-n.radius)n.y=H+n.radius;if(n.y>H+n.radius)n.y=-n.radius;
    const pu=1+Math.sin(time*n.pulseSpeed+n.phase)*n.pulse*.5;
    const r=n.radius*pu*(1-tr*.4)*Math.sqrt(nebulaMul);
    const a=n.baseAlpha*(.8+audioLevel*.5)*(1-tr*.6)*nebulaMul;
    if(a<.005)continue;

    let nx=n.x,ny=n.y,nr=r;
    if(tr>.1){
      const cx=W/2,cy=H/2;
      nx=lerp(n.x,cx,tr*.3);
      ny=lerp(n.y,cy,tr*.3);
      nr=r*(1+tr*.5);
    }

    const g=ctx.createRadialGradient(nx,ny,0,nx,ny,nr);
    const cr=Math.round(n.cr),cg=Math.round(n.cg),cb=Math.round(n.cb);
    g.addColorStop(0,`rgba(${cr},${cg},${cb},${a})`);
    g.addColorStop(.5,`rgba(${cr},${cg},${cb},${a*.3})`);
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(nx,ny,nr,0,PI2);ctx.fill();
  }
}

function drawShooters(dt){
  const tr=tunnelTransition;
  const scene=SCENE_MODES.find(m=>m.id===currentMode);
  const score=scene?.id==='paint'||scene?.id==='constellation'||scene?.id==='word'?0:1;
  let alive=0;
  for(let i=shooters.length-1;i>=0;i--){
    const s=shooters[i];s.life-=s.decay*dt;
    if(s.life<=0){shooters.splice(i,1);continue}
    alive++;
    const tx=s.x+s.vx*dt*.016,ty=s.y+s.vy*dt*.016;
    const dist=Math.sqrt((tx-s.x)**2+(ty-s.y)**2);
    const hs=s.width*(1+audioLevel*2.5);

    tctx.globalAlpha=s.life*.3*(1-tr*.8)*score;
    const gl=tctx.createRadialGradient(tx,ty,0,tx,ty,hs*15);
    gl.addColorStop(0,`rgba(255,245,230,${s.life*.3+audioLevel*.2})`);
    gl.addColorStop(1,'rgba(0,0,0,0)');
    tctx.fillStyle=gl;tctx.beginPath();tctx.arc(tx,ty,hs*15,0,PI2);tctx.fill();

    ctx.globalAlpha=s.life*.55*(1-tr*.7)*score;
    ctx.strokeStyle='rgba(255,235,210,.5)';
    ctx.lineWidth=s.width;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(tx,ty);ctx.stroke();

    ctx.globalAlpha=s.life*(1-tr*.5)*score;
    ctx.fillStyle='#fffbe6';
    ctx.shadowColor='rgba(255,230,180,.8)';ctx.shadowBlur=hs*10;
    ctx.beginPath();ctx.arc(tx,ty,hs,0,PI2);ctx.fill();
    ctx.shadowBlur=0;

    s.x=tx;s.y=ty;
  }
  ctx.globalAlpha=1;
  tctx.globalAlpha=1;
  document.getElementById('shootersC').textContent=alive;
}

function drawParticles(dt){
  const connDist=220;
  const ar=audioReactive?1+audioLevel*4:1;
  const tr=tunnelTransition;
  const toMerge=[];
  const scene=SCENE_MODES.find(m=>m.id===currentMode);
  const isConstellation=currentMode==='constellation';
  const isPaint=currentMode==='paint';

  // ── Paint Spawning ──
  if(isPaint&&mouse.active){
    paintSpawnTimer+=dt;
    const spawnInterval=30;
    while(paintSpawnTimer>=spawnInterval){
      paintSpawnTimer-=spawnInterval;
      if(mouseDown||paintMouseDown){
        const jitter=rand(-paintBrushSize,paintBrushSize);
        spawnPaintParticle(mouse.x+jitter,mouse.y+rand(-paintBrushSize,paintBrushSize));
        if(paintBrushSize>10)spawnPaintParticle(mouse.x+rand(-paintBrushSize*.5,paintBrushSize*.5),mouse.y+rand(-paintBrushSize*.5,paintBrushSize*.5));
        if(paintBrushSize>15)spawnPaintParticle(mouse.x+rand(-paintBrushSize*.3,paintBrushSize*.3),mouse.y+rand(-paintBrushSize*.3,paintBrushSize*.3));
      }
    }
  }

  // Gravity well growth (only non-paint)
  if(!isPaint&&mouseDown&&gravityWell.active){
    gravityDownTimer+=dt;
    gravityWell.strength=Math.min(1,gravityDownTimer/2000);
    gravityWell.x=lerp(gravityWell.x,mouse.x,.1);
    gravityWell.y=lerp(gravityWell.y,mouse.y,.1);
    gravityWell.radius=200+gravityWell.strength*200;
  }

  let aliveCt=0;
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];

    if(p.targetHue!==null&&!p._paint){
      const d=p.targetHue-p.hue;
      if(Math.abs(d)>180)p.hue+=d>0?360:-360;
      else if(Math.abs(d)>1)p.hue+=d*.02*dt;
      else{p.hue=p.targetHue;p.targetHue=null}
    }

    p.life-=p.decay*dt;
    if(p.life<=0){particles.splice(i,1);continue}
    aliveCt++;

    // Boom repulsion (skip in paint mode)
    if(!p._paint&&!p._exploded&&clickBoom&&boomTimer>.5){
      const dx=mouse.x-p.x,dy=mouse.y-p.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<200){const f=8/(d+.1);p.vx-=dx*f;p.vy-=dy*f;p._exploded=true}
    }

    // Gravity well (skip paint particles)
    if(!p._paint&&gravityWell.active&&gravityWell.strength>.05){
      const gx=gravityWell.x-p.x,gy=gravityWell.y-p.y;
      const gd=Math.sqrt(gx*gx+gy*gy);
      if(gd<gravityWell.radius&&gd>.5){
        const gf=gravityWell.strength*2.5/(gd*.1+1);
        p.vx+=gx/gd*gf;p.vy+=gy/gd*gf;
        if(gd<12&&p.life>.3&&p.size>1.5){
          p.life+=.15;p.size=Math.min(8,p.size*1.15);p.baseSize=p.size;
          p.sat=Math.min(100,p.sat+5);p.lig=Math.min(95,p.lig+5);
        }
        if(gd<6){
          const ang=Math.atan2(gy,gx)+rand(-.5,.5);
          const spd=rand(80,200);
          p.vx=Math.cos(ang)*spd;p.vy=Math.sin(ang)*spd;
        }
      }
    }else if(!p._paint&&tr<.5){
      const dx=mouse.x-p.x,dy=mouse.y-p.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d>5){p.vx+=dx*.26/(d+10);p.vy+=dy*.26/(d+10)}
    }

    // Soft repel + merge (skip paint particles for merge)
    if(!p._paint){
      for(let j=i+1;j<particles.length;j++){
        const o=particles[j];
        if(o._paint)continue;
        const rx=p.x-o.x,ry=p.y-o.y;
        const rd=Math.sqrt(rx*rx+ry*ry);
        if(rd<8&&rd>.1&&p.life>.5&&o.life>.5&&!isConstellation){
          toMerge.push({a:i,b:j,at:p,bt:o});
        }else if(rd<20&&rd>.1){
          const f=repelForce/(rd*rd+1);
          p.vx+=rx*f;p.vy+=ry*f;
          o.vx-=rx*f;o.vy-=ry*f;
        }
      }
    }

    p.vx*=.98;p.vy*=.98;
    p.x+=p.vx*dt*.016;p.y+=p.vy*dt*.016;
    if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;
    if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20;

    p.trail.push({x:p.x,y:p.y});
    if(p.trail.length>MAX_TRAIL)p.trail.shift();

    const pSize=p.baseSize*(p.life*.7+.3)*ar*(isPaint?1.2:1);

    // Draw trail
    const tLen=p.trail.length;
    for(let t=1;t<tLen;t++){
      const ta=t/tLen;
      tctx.globalAlpha=ta*.08*p.life*(1-tr*.8)*(isPaint?2:1);
      if(p._paint){
        tctx.strokeStyle=`hsla(${p.hue},${p.sat}%,${p.lig+10}%,${ta*.5})`;
      }else{
        tctx.strokeStyle=`hsla(${p.hue},${p.sat}%,${p.lig+10}%,${ta*.3})`;
      }
      tctx.lineWidth=pSize*ta*.3*(isPaint?1.5:1);
      tctx.beginPath();tctx.moveTo(p.trail[t-1].x,p.trail[t-1].y);
      tctx.lineTo(p.trail[t].x,p.trail[t].y);tctx.stroke();
    }

    // Draw particle
    const glowMul=isPaint?2:1;
    ctx.globalAlpha=(p.life*.6)*(.6+audioLevel*.4)*(1-tr*.3)*(isPaint?1.2:1);
    const gl=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,pSize*5*glowMul);
    if(p._paint){
      gl.addColorStop(0,`hsla(${p.hue},${p.sat}%,${p.lig}%,.7)`);
      gl.addColorStop(.4,`hsla(${p.hue},${p.sat}%,${p.lig}%,.2)`);
    }else{
      gl.addColorStop(0,`hsla(${p.hue},${p.sat}%,${p.lig}%,.5)`);
      gl.addColorStop(.4,`hsla(${p.hue},${p.sat}%,${p.lig}%,.12)`);
    }
    gl.addColorStop(1,'hsla(0,0%,100%,0)');
    ctx.fillStyle=gl;ctx.beginPath();ctx.arc(p.x,p.y,pSize*5,0,PI2);ctx.fill();

    ctx.globalAlpha=.85+audioLevel*.15;
    ctx.fillStyle=`hsla(${p.hue},${p.sat}%,${p.lig}%,.9)`;
    ctx.beginPath();ctx.arc(p.x,p.y,pSize,0,PI2);ctx.fill();
  }

  // Merge
  if(!isConstellation){
    for(const m of toMerge){
      const a=particles[m.a],b=particles[m.b];
      if(!a||!b||a.merged||b.merged)continue;
      if(a.life<.3||b.life<.3)continue;
      a.x=(a.x+b.x)/2;a.y=(a.y+b.y)/2;
      a.vx=(a.vx+b.vx)*.5;a.vy=(a.vy+b.vy)*.5;
      a.size=Math.min(8,a.size*1.3);
      a.baseSize=a.size;
      a.life=Math.min(1,a.life+.2);
      a.hue=(a.hue+b.hue)/2;
      a.sat=Math.min(100,a.sat+10);
      a.lig=Math.min(95,a.lig+8);
      a.merged=true;
      b.life=0;b.merged=true;
      if(aliveCt<getEffMaxParticles()-5){
        const pPal=PALETTES[paletteIdx];
        for(let k=0;k<3;k++){
          const ang=rand(0,PI2),spd=rand(40,120);
          const np=createParticle(a.x,a.y,Math.cos(ang)*spd,Math.sin(ang)*spd,true);
          np.life=.6;np.decay=.012;np.hue=rand(pPal.partHue[0],pPal.partHue[1]);
          particles.push(np);
        }
      }
    }
  }

  for(let i=particles.length-1;i>=0;i--){if(particles[i].life<=0)particles.splice(i,1);}

  // Connections
  const baseConnMul=isConstellation?3:(isPaint ? .5 : 1);
  const connReach=audioReactive?connDist*(1+audioLevel*2)*(1-tr*.5)*Math.sqrt(baseConnMul):connDist*(1-tr*.5)*Math.sqrt(baseConnMul);
  const cr2=connReach*connReach;
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a=particles[i],b=particles[j];
      const dx=a.x-b.x,dy=a.y-b.y;
      const d=dx*dx+dy*dy;
      if(d<cr2){
        const alpha=(1-d/cr2)*.3*Math.min(a.life,b.life)*(1-tr*.6)*baseConnMul;
        ctx.globalAlpha=Math.max(0,alpha);
        ctx.strokeStyle=`hsla(${(a.hue+b.hue)/2},70%,70%,${alpha})`;
        ctx.lineWidth=isConstellation ? .8 : .5;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
  }
  ctx.globalAlpha=1;
  particles.length>0&&(document.getElementById('particlesC').textContent=particles.length);
}

// ─── Prism Rave — Kaleidoscope Geometry ──────────────────────────────
let prismMode=false;
let prismGeometry=[];
const PRISM_SIDES=8;
let prismHue=0;
let prismPulse=0;
let prismRotation=0;
let prismWavePhase=0;

function initPrismGeometry(){
  prismGeometry=[];
  // Generate concentric layers of polygon rings
  const layers=6;
  const baseR=Math.min(W,H)*.08;
  for(let l=0;l<layers;l++){
    const segments=PRISM_SIDES-l%2+2;
    const radius=baseR*(l+1)*1.1;
    const points=[];
    for(let i=0;i<segments;i++){
      const a=(PI2/segments)*i-Math.PI/2;
      points.push({x:Math.cos(a)*radius,y:Math.sin(a)*radius});
    }
    prismGeometry.push({segments,radius,points,phase:rand(0,PI2),hueOff:l*40,lineWidth:1+l*.4});
  }
}
// --- initPrismGeometry moved to init sequence (called after resize())

function drawPrismRave(time){
  if(currentMode!=='prism')return;
  ctx.save();
  const cx=W/2,cy=H/2;
  const ar=audioLevel*2;
  const p=Math.sin(time*.001)*.5+.5;
  prismHue=(time*.03)%360;
  prismPulse=Math.sin(time*.002)*.3+1;
  prismRotation+=.002*(cfgTunnelSpeed/5);
  prismWavePhase+=.02;

  // ── Draw mirrored kaleidoscope sectors ──
  const sectors=PRISM_SIDES;
  for(let s=0;s<sectors;s++){
    const sectorAngle=(PI2/sectors)*s+prismRotation;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(sectorAngle);

    // ── Draw concentric polygon rings ──
    for(const layer of prismGeometry){
      const pulseR=layer.radius*prismPulse*(1+ar*.15);
      const hue=(prismHue+layer.hueOff+time*.01)%360;
      const sat=70+Math.sin(time*.001+layer.phase)*20;
      const lig=50+Math.sin(time*.0015+layer.phase+prismWavePhase)*20;
      const alpha=.15+Math.sin(time*.001+layer.phase)*.1+ar*.1;

      ctx.globalAlpha=clamp(alpha,.05,.4);
      ctx.strokeStyle=`hsla(${hue},${sat}%,${lig}%,${ctx.globalAlpha})`;
      ctx.lineWidth=layer.lineWidth;
      ctx.shadowColor=`hsla(${hue},${sat}%,${lig}%,.3)`;
      ctx.shadowBlur=8+audioLevel*20;

      ctx.beginPath();
      for(let i=0;i<layer.points.length;i++){
        const px=layer.points[i].x*pulseR;
        const py=layer.points[i].y*pulseR;
        if(i===0)ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
      }
      ctx.closePath();
      ctx.stroke();

      // Fill with subtle gradient
      const fillAlpha=.02+Math.sin(time*.0005+layer.phase)*.01+ar*.03;
      ctx.fillStyle=`hsla(${hue},${sat}%,${lig+10}%,${clamp(fillAlpha,0,.06)})`;
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.shadowBlur=0;
  ctx.globalAlpha=1;

  // ── Central glowing mandala dot ──
  const mHue=(prismHue+180)%360;
  const mg=ctx.createRadialGradient(cx,cy,0,cx,cy,60+ar*40);
  mg.addColorStop(0,`hsla(${mHue},100%,80%,${.3+ar*.2})`);
  mg.addColorStop(.5,`hsla(${mHue},100%,60%,${.1+ar*.1})`);
  mg.addColorStop(1,'hsla(0,0%,0%,0)');
  ctx.fillStyle=mg;ctx.beginPath();ctx.arc(cx,cy,60+ar*40,0,PI2);ctx.fill();

  // ── Rotating laser lines ──
  for(let i=0;i<8;i++){
    const a=(PI2/8)*i+prismRotation*3+Math.sin(time*.0005+i)*.3;
    const len=Math.min(W,H)*.5*(.6+Math.sin(time*.0025+i*.8)*.4+ar*.15);
    ctx.globalAlpha=.08+Math.sin(time*.0015+i*1.2)*.04+ar*.06;
    const lhue=(prismHue+i*45)%360;
    ctx.strokeStyle=`hsla(${lhue},100%,70%,${ctx.globalAlpha})`;
    ctx.lineWidth=1.5;
    ctx.shadowColor=`hsla(${lhue},100%,70%,.2)`;
    ctx.shadowBlur=12;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len);ctx.stroke();
  }
  ctx.shadowBlur=0;
  ctx.globalAlpha=1;

  // ── Prism particles (tiny colored dots swirling outward) ──
  prismPulse+=.02;
  const count=60+Math.floor(audioLevel*40);
  for(let i=0;i<count;i++){
    const t=i/count;
    const a=PI2*t+prismPulse*3+time*.0005;
    const dist=80+Math.sin(time*.001+i*.3)*40+t*Math.min(W,H)*.35;
    const px=cx+Math.cos(a)*dist;
    const py=cy+Math.sin(a)*dist;
    const phue=(prismHue+Math.floor(t*360))%360;
    const palpha=.15+Math.sin(time*.002+i*.7)*.1+ar*.08;
    ctx.globalAlpha=clamp(palpha,0,.4);
    ctx.fillStyle=`hsla(${phue},100%,70%,${ctx.globalAlpha})`;
    ctx.beginPath();ctx.arc(px,py,1.5+ar*2+Math.sin(time*.003+i*.5),0,PI2);ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.restore();
}

// ─── Aurora Borealis ── Flowing curtain waves ──────────────────────
function drawAurora(time){
  if(currentMode!=='aurora')return;
  const spd=cfgAuroraSpeed/5;
  for(const b of auroraBands){
    const baseY=H*0.12;
    ctx.beginPath();
    ctx.moveTo(0,H);
    for(let x=0;x<=W;x+=3){
      const yOff=baseY+b.phase+b.speed*time*spd;
      const w1=Math.sin(x*b.freq+time*b.speed*.3*spd)*b.amp*H;
      const w2=Math.sin(x*b.freq*1.7+time*b.speed*.5*spd+b.phase*1.3)*b.amp*H*.5;
      const w3=Math.sin(x*b.freq*.4+time*b.speed*.1*spd+b.phase*.7)*b.amp*H*.3;
      ctx.lineTo(x,yOff+w1+w2+w3);
    }
    ctx.lineTo(W,H);
    ctx.closePath();
    const mix=1+audioLevel*2;
    ctx.fillStyle=`hsla(${b.color.h},${b.color.s}%,${b.color.l+Math.sin(time*.0005+b.phase)*8}%,${clamp(b.alpha*mix,0,.1)})`;
    ctx.fill();
    // Glowing crest line
    ctx.beginPath();
    for(let x=0;x<=W;x+=4){
      const yOff=baseY+b.phase+b.speed*time*spd;
      const w1=Math.sin(x*b.freq+time*b.speed*.3*spd)*b.amp*H;
      const w2=Math.sin(x*b.freq*1.7+time*b.speed*.5*spd+b.phase*1.3)*b.amp*H*.5;
      if(x===0)ctx.moveTo(x,yOff+w1+w2);
      else ctx.lineTo(x,yOff+w1+w2);
    }
    ctx.strokeStyle=`hsla(${b.color.h},${b.color.s}%,${b.color.l+20}%,${clamp(b.alpha*mix*.4,0,.03)})`;
    ctx.lineWidth=2;
    ctx.stroke();
  }
}

// ─── Stargate Wormhole — Warp-ring portal ──────────────────────────
let wormholeMode=false;
let wormholeCinematic=false;
const WH_RINGS=12;
let wormholeRings=[];
function initWormhole(){
  wormholeRings=[];
  for(let i=0;i<WH_RINGS;i++){
    const t=i/WH_RINGS;
    wormholeRings.push({
      t,
      phase:rand(0,PI2),
      hueOff:i*30,
      twist:t*PI2*2,
      radius:Math.min(W,H)*(.12+t*.35),
      opacity:.05+t*.12,
      vertexes:[],
    });
  }
}
// --- initWormhole moved to init sequence (called after resize())

// ─── Galaxy Map — Top-down spiral galaxy ─────────────────────
let galaxyMode=false;
let fireflyMode=false;
let galaxyStars=[];
let galaxyRotation=0;
let galaxyOrbitX=0.5;
let galaxyOrbitY=0.5;
let galaxyOrbitTargetX=0.5;
let galaxyOrbitTargetY=0.5;
let galaxyDragX=0,galaxyDragY=0;
let galaxyDrag=false;
let galaxyAutoRotate=true;
const GALAXY_STAR_COUNT=4000;
const GALAXY_ARMS=4;

// --- initGalaxy moved to init sequence (called after resize())

function drawWormhole(time){
  if(currentMode!=='wormhole')return;
  const cx=W/2,cy=H/2;
  const ar=audioLevel*2.5;
  const spd=cfgTunnelSpeed/5;
  const sp=time*spd;
  const pulse=Math.sin(sp*.001)*.1+1;

  // ── 3D Mouse Perspective Tilt ──
  const tiltX=clamp((mouse.x/W-.5)*2,-1,1);
  const tiltY=clamp((mouse.y/H-.5)*2,-1,1);
  const tiltIntensity=wormholeCinematic?.15:.06;

  // ── Cinematic auto-pilot camera ──
  let camX=0,camY=0,camZoom=0.5;
  if(wormholeCinematic){
    const camSpeed=spd*.15;
    camX=Math.sin(time*camSpeed*.0004)*W*.15;
    camY=Math.cos(time*camSpeed*.0003)*H*.1;
    camZoom=.4+Math.sin(time*camSpeed*.0002)*.15;
  }

  ctx.save();

  // Apply 3D perspective tilt + cinematic camera
  const tiltOffsetX=tiltX*tiltIntensity*Math.min(W,H)*.12;
  const tiltOffsetY=tiltY*tiltIntensity*Math.min(W,H)*.06;
  ctx.translate(cx,cy);
  ctx.rotate(tiltX*tiltIntensity*.06);
  ctx.scale(1+tiltX*tiltIntensity*.02,1+tiltY*tiltIntensity*.02);
  ctx.translate(-cx+tiltOffsetX,-cy+tiltOffsetY);

  if(wormholeCinematic){
    ctx.translate(cx+camX,cy+camY);
    ctx.scale(1+camZoom,1+camZoom);
    ctx.translate(-cx,-cy);
  }

  // ── Background ring glow ──
  const backGlow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*.55);
  backGlow.addColorStop(0,`rgba(80,40,160,${.03+ar*.04})`);
  backGlow.addColorStop(.4,`rgba(40,20,100,${.05+ar*.03})`);
  backGlow.addColorStop(.7,`rgba(20,10,60,${.03})`);
  backGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=backGlow;
  ctx.beginPath();ctx.arc(cx,cy,Math.min(W,H)*.55,0,PI2);ctx.fill();

  // ── Draw concentric warp rings (3D perspective) ──
  const ringCount=WH_RINGS;
  for(let r=0;r<ringCount;r++){
    const ring=wormholeRings[r];
    const twistAngle=sp*.0005+ring.twist+ring.t*PI2+Math.sin(sp*.0008+ring.t*PI2)*.5;
    const rPulse=ring.radius*pulse*(1+ar*.08);
    const hue=(ring.hueOff+sp*.01+ar*10)%360;
    const sat=60+Math.sin(sp*.0007+ring.phase)*20+ar*15;
    const lig=50+Math.sin(sp*.001+ring.phase)*15+ar*10;
    const alpha=ring.opacity*(.5+Math.sin(sp*.0006+ring.phase)*.3+ar*.1);

    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(twistAngle*0.3);

    // Draw as 3D-tilted ellipse with wobble
    const segs=32+r*4;
    const scaleY=Math.sin(ring.t*PI)*.8+.2;
    const pts=[];
    for(let i=0;i<=segs;i++){
      const a=(PI2/segs)*i;
      const wobble=Math.sin(a*3+sp*.001+ring.phase)*.04*rPulse;
      const rx=(rPulse+wobble)*(1+ring.t*.3+ar*.1);
      const ry=(rPulse+wobble)*scaleY;
      pts.push({x:Math.cos(a)*rx,y:Math.sin(a)*ry});
    }

    // Fill ring
    ctx.globalAlpha=clamp(alpha*.6,0,.15);
    ctx.fillStyle=`hsla(${hue},${sat}%,${lig+10}%,${ctx.globalAlpha})`;
    ctx.beginPath();
    for(let i=0;i<pts.length;i++){
      if(i===0)ctx.moveTo(pts[i].x,pts[i].y);
      else ctx.lineTo(pts[i].x,pts[i].y);
    }
    ctx.closePath();ctx.fill();

    // Stroke ring
    ctx.globalAlpha=clamp(alpha,0,.25);
    ctx.strokeStyle=`hsla(${hue},${sat}%,${lig}%,${ctx.globalAlpha})`;
    ctx.lineWidth=1+ring.t*2.5+ar*.5;
    ctx.shadowColor=`hsla(${hue},${sat}%,${lig}%,.3)`;
    ctx.shadowBlur=6+ar*15;
    ctx.beginPath();
    for(let i=0;i<pts.length;i++){
      if(i===0)ctx.moveTo(pts[i].x,pts[i].y);
      else ctx.lineTo(pts[i].x,pts[i].y);
    }
    ctx.closePath();ctx.stroke();
    ctx.shadowBlur=0;
    ctx.restore();
  }

  // ── Inner vortex spiral ──
  ctx.globalAlpha=.15+ar*.12;
  const vSpirals=3;
  for(let s=0;s<vSpirals;s++){
    const sAngle=sp*.0008+s*PI2/3;
    ctx.beginPath();
    for(let i=0;i<=100;i++){
      const t=i/100;
      const angle=t*PI2*6+sAngle+sp*.001;
      const rad=t*Math.min(W,H)*.48;
      const wobX=Math.sin(t*PI*8+sp*.002+s)*8*ar;
      const wobY=Math.cos(t*PI*8+sp*.002+s)*8*ar;
      const px=cx+Math.cos(angle)*rad+wobX;
      const py=cy+Math.sin(angle)*rad*.35+wobY;
      if(i===0)ctx.moveTo(px,py);
      else ctx.lineTo(px,py);
    }
    ctx.strokeStyle=`hsla(${(s*120+sp*.02)%360},80%,70%,${.05+ar*.06})`;
    ctx.lineWidth=1.5+ar*2;
    ctx.shadowColor=`hsla(${(s*120+sp*.02)%360},80%,70%,.2)`;
    ctx.shadowBlur=10+ar*20;
    ctx.stroke();
    ctx.shadowBlur=0;
  }

  // ── Event horizon (bright core) ──
  const coreR=Math.min(W,H)*.08*(1+ar*.5);
  const coreG=ctx.createRadialGradient(cx,cy,0,cx,cy,coreR*2);
  coreG.addColorStop(0,`rgba(200,180,255,${.15+ar*.15})`);
  coreG.addColorStop(.3,`rgba(120,80,220,${.1+ar*.1})`);
  coreG.addColorStop(.6,`rgba(40,20,100,${.05+ar*.05})`);
  coreG.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=coreG;
  ctx.beginPath();ctx.arc(cx,cy,coreR*2,0,PI2);ctx.fill();

  // ── Wormhole ring particle stream ──
  for(let i=0;i<80;i++){
    const t=i/80+sp*.0002;
    const a=PI2*t+sp*.0006;
    const rad=Math.min(W,H)*.08+t*Math.min(W,H)*.4;
    const wob=Math.sin(t*PI2*5+sp*.001+i)*rad*.03;
    const px=cx+Math.cos(a)*(rad+wob);
    const py=cy+Math.sin(a)*(rad+wob)*.35;
    const phue=(t*360+sp*.01)%360;
    ctx.globalAlpha=clamp(.02+Math.sin(t*PI2+sp*.001+i)*.03+ar*.04,0,.15);
    ctx.fillStyle=`hsla(${phue},90%,70%,${ctx.globalAlpha})`;
    ctx.beginPath();ctx.arc(px,py,1+ar*2+Math.sin(t*PI2*3+sp*.001)*.8,0,PI2);ctx.fill();
  }

  ctx.globalAlpha=1;
  ctx.restore();
}

function initGalaxy(){
  galaxyStars=[];
  const maxR=Math.min(W,H)*.45;
  for(let i=0;i<GALAXY_STAR_COUNT;i++){
    const arm=Math.floor(rand(0,GALAXY_ARMS));
    const armAngle=(arm/GALAXY_ARMS)*PI2;
    const radialDist=Math.pow(rand(0,1),.6)*maxR;
    const scatter=radialDist*.08*(1+rand(-.5,.5));
    const angle=armAngle+radialDist*3/maxR+rand(-scatter,scatter);
    const dist=radialDist+rand(-radialDist*.04,radialDist*.04);
    const layer=dist<maxR*.08?4:dist<maxR*.2?3:dist<maxR*.4?2:1;
    galaxyStars.push({
      angle,dist,
      size:rand(.3,2)*(1+layer*.15),
      alpha:rand(.15,.8)*(layer/4+.3),
      hue:dist<maxR*.08?rand(20,50):rand(rand(180,250),rand(250,300)),
      sat:rand(30,80),
      lig:rand(40,80),
      layer,
      twinklePhase:rand(0,PI2),
      twinkleSpeed:rand(.3,3),
    });
  }
}

function drawGalaxy(time){
  if(currentMode!=='galaxy')return;
  const cx=W/2,cy=H/2;
  const ar=audioLevel*2.5;
  const spd=cfgTunnelSpeed/5;
  const maxR=Math.min(W,H)*.45;

  // Smooth orbit following mouse
  galaxyOrbitX=lerp(galaxyOrbitX,galaxyOrbitTargetX,.03);
  galaxyOrbitY=lerp(galaxyOrbitY,galaxyOrbitTargetY,.03);
  const orbitOffX=(galaxyOrbitX-.5)*(W*.12);
  const orbitOffY=(galaxyOrbitY-.5)*(H*.08);

  if(galaxyAutoRotate)galaxyRotation+=.0003*spd;

  ctx.save();
  ctx.translate(cx+orbitOffX,cy+orbitOffY);

  // ── Galaxy ambient glow ──
  const gg=ctx.createRadialGradient(0,0,0,0,0,maxR*1.3);
  gg.addColorStop(0,`hsla(40,60%,60%,.02)`);
  gg.addColorStop(.3,`hsla(200,50%,40%,${.01+ar*.02})`);
  gg.addColorStop(.6,`hsla(260,40%,30%,${.008+ar*.01})`);
  gg.addColorStop(1,'hsla(0,0%,0%,0)');
  ctx.fillStyle=gg;
  ctx.beginPath();ctx.arc(0,0,maxR*1.3,0,PI2);ctx.fill();

  // ── Draw spiral arm stars ──
  for(const s of galaxyStars){
    const angle=s.angle+galaxyRotation;
    const px=Math.cos(angle)*s.dist;
    const py=Math.sin(angle)*s.dist*.55;
    const tw=Math.sin(time*s.twinkleSpeed+s.twinklePhase)*.3+.7;
    const a=s.alpha*tw*(.6+ar*.3);
    if(a<.01)continue;

    const sz=s.size*(.8+ar*.3);

    // Glow for brighter stars
    if(s.layer>=3){
      ctx.globalAlpha=a*.15;
      ctx.fillStyle=`hsla(${s.hue},${s.sat}%,${s.lig+20}%,${a*.3})`;
      ctx.beginPath();ctx.arc(px,py,sz*4,0,PI2);ctx.fill();
    }

    ctx.globalAlpha=a;
    ctx.fillStyle=`hsla(${s.hue},${s.sat}%,${s.lig}%,1)`;
    ctx.beginPath();ctx.arc(px,py,sz,0,PI2);ctx.fill();
  }

  // ── Galactic core ──
  ctx.globalAlpha=1;
  const coreR=maxR*.1*(1+ar*.4);
  const coreG=ctx.createRadialGradient(0,0,0,0,0,coreR*3);
  coreG.addColorStop(0,`rgba(255,240,200,${.2+ar*.15})`);
  coreG.addColorStop(.15,`rgba(255,200,120,${.15+ar*.1})`);
  coreG.addColorStop(.35,`rgba(180,120,80,${.08+ar*.06})`);
  coreG.addColorStop(.6,`rgba(100,60,120,${.04+ar*.03})`);
  coreG.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=coreG;
  ctx.beginPath();ctx.arc(0,0,coreR*3,0,PI2);ctx.fill();

  // ── Core bright center ──
  const pulse=Math.sin(time*.0015)*.2+1;
  const brightR=coreR*.4*pulse;
  const brightG=ctx.createRadialGradient(0,0,0,0,0,brightR*2);
  brightG.addColorStop(0,`rgba(255,255,240,${.3+ar*.15})`);
  brightG.addColorStop(.5,`rgba(255,230,180,${.1+ar*.08})`);
  brightG.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=brightG;
  ctx.beginPath();ctx.arc(0,0,brightR*2,0,PI2);ctx.fill();

  // ── Orbit ring indicator ──
  ctx.globalAlpha=.03+ar*.03;
  ctx.strokeStyle='rgba(200,220,255,.1)';
  ctx.lineWidth=.5;
  for(let i=0;i<3;i++){
    const r=maxR*(.2+i*.25);
    ctx.beginPath();ctx.arc(0,0,r,0,PI2);ctx.stroke();
  }

  ctx.globalAlpha=1;
  ctx.restore();
}

// ─── Cosmic Storm — Lightning + Charged Rain ─────────────────
let stormMode=false;
const STORM_CLOUD_COUNT=8;
const STORM_LIGHTNING_INTERVAL=800;
const STORM_RAIN_COUNT=250;
let stormClouds=[];
let stormLightnings=[];
let stormRain=[];
let stormPuddles=[];
let stormFlashAlpha=0;
let stormLightningTimer=0;
let stormCloudCanvas=null;
let stormCloudCtx=null;

function initStorm(){
  stormClouds=[];
  for(let i=0;i<STORM_CLOUD_COUNT;i++){
    stormClouds.push({
      x:rand(0,W),y:rand(0,H*.35),
      vx:rand(-.15,.15),vy:rand(-.03,.03),
      radius:rand(80,220),
      baseAlpha:rand(.04,.1),
      pulse:rand(.3,.7),pulseSpeed:rand(.0005,.002),
      phase:rand(0,PI2),
      r:rand(25,45),g:rand(20,40),b:rand(50,80),
    });
  }
  stormRain=[];
  for(let i=0;i<STORM_RAIN_COUNT;i++){
    stormRain.push({
      x:rand(0,W),y:rand(-20,H),
      vy:rand(200,500),
      vx:rand(-20,20),
      size:rand(1,3),
      hue:rand(180,240),
      sat:rand(30,80),
      lig:rand(50,80),
      trail:[],
      phase:rand(0,PI2),
      life:1,decay:rand(.0005,.002),
    });
  }
  stormLightnings=[];
  stormLightningTimer=0;
  stormFlashAlpha=0;
  // Create offscreen canvas for cloud rendering
  stormCloudCanvas=document.createElement('canvas');
  stormCloudCanvas.width=W;stormCloudCanvas.height=H;
  stormCloudCtx=stormCloudCanvas.getContext('2d');
  // Puddle reflections
  stormPuddles=[];
  for(let i=0;i<12;i++){
    stormPuddles.push({
      x:rand(0,W),y:rand(H*.75,H*.02+H),
      size:rand(20,60),
      phase:rand(0,PI2),
      alpha:rand(.02,.08),
      wave:rand(.3,.8),waveSpeed:rand(.001,.003),
    });
  }
}

function generateLightningBolt(sx,sy,ex,ey,maxDepth=4){
  const bolts=[];
  const branches=[];
  function gen(ax,ay,bx,by,depth,jitter){
    const dx=bx-ax,dy=by-ay;
    const dist=Math.sqrt(dx*dx+dy*dy);
    if(depth<=0||dist<20){
      branches.push({ax,ay,bx,by});
      return;
    }
    const midX=(ax+bx)/2+rand(-jitter,jitter);
    const midY=(ay+by)/2+rand(-jitter,jitter);
    gen(ax,ay,midX,midY,depth-1,jitter*.55);
    gen(midX,midY,bx,by,depth-1,jitter*.55);
    // Fork off a sub-bolt occasionally
    if(depth>1&&Math.random()<.35){
      const forkEndX=midX+rand(-jitter*2,jitter*2);
      const forkEndY=midY+rand(30,80);
      gen(midX,midY,forkEndX,forkEndY,depth-2,jitter*.4);
    }
  }
  gen(sx,sy,ex,ey,maxDepth,rand(20,60));
  // Also add independent secondary forks from main path
  if(Math.random()<.5){
    // Ground-strike child forks
    const fCnt=Math.floor(rand(1,3));
    for(let i=0;i<fCnt;i++){
      const fMidX=lerp(sx,ex,rand(.2,.7));
      const fMidY=lerp(sy,ey,rand(.2,.7));
      const fEndX=fMidX+rand(-50,50);
      const fEndY=fMidY+rand(30,80);
      gen(fMidX,fMidY,fEndX,fEndY,Math.max(1,depth-2),rand(15,40));
    }
  }
  return branches;
}

function drawLightningBolt(time,branches,alpha){
  if(alpha<.02)return;
  const hue=200+Math.sin(time*.005)*30;
  const ar=audioLevel*2;
  for(const b of branches){
    ctx.globalAlpha=alpha*(.7+ar*.3);
    ctx.strokeStyle=`hsla(${hue},100%,70%,${ctx.globalAlpha})`;
    ctx.lineWidth=rand(1.5,3.5)*(1+ar*.5);
    ctx.shadowColor=`hsla(${hue},100%,80%,${alpha*.5})`;
    ctx.shadowBlur=8+ar*15;
    ctx.beginPath();
    ctx.moveTo(b.ax,b.ay);
    ctx.lineTo(b.bx,b.by);
    ctx.stroke();

    // Inner white core
    ctx.globalAlpha=alpha*(.3+ar*.2);
    ctx.strokeStyle='rgba(255,255,255,.8)';
    ctx.lineWidth=1;
    ctx.shadowBlur=0;
    ctx.beginPath();
    ctx.moveTo(b.ax,b.ay);
    ctx.lineTo(b.bx,b.by);
    ctx.stroke();
  }
  ctx.shadowBlur=0;
  ctx.globalAlpha=1;
}

function spawnLightningBolt(){
  const x=rand(0,W);
  const y=rand(0,30);
  const endX=x+rand(-80,80);
  const endY=rand(H*.3,H*.9);
  const branches=generateLightningBolt(x,y,endX,endY);
  stormLightnings.push({
    branches,
    life:1,
    decay:rand(.004,.008),
    phase:rand(0,PI2),
    hue:200,
  });
  stormFlashAlpha=clamp(.15+audioLevel*.25,.1,.4);
  // Trigger thunder rumble
  playThunderRumble(clamp(.4+audioLevel*.6,.3,1));
  // Vibrate storm overlay briefly
}

function updateStorm(dt){
  if(currentMode!=='storm')return;
  const ar=audioLevel*2.5;

  // Update clouds
  for(const c of stormClouds){
    c.x+=c.vx*dt*.016;
    c.y+=c.vy*dt*.016;
    if(c.x<-c.radius)c.x=W+c.radius;
    if(c.x>W+c.radius)c.x=-c.radius;
    if(c.y<-c.radius)c.y=H*.3;
    if(c.y>H*.4)c.y=H*.35;
  }

  // Lightning timer
  stormLightningTimer-=dt;
  if(stormLightningTimer<=0){
    spawnLightningBolt();
    stormLightningTimer=STORM_LIGHTNING_INTERVAL+rand(-300,600)-ar*150;
    if(Math.random()<.2+ar*.1)spawnLightningBolt(); // double strike!
  }

  // Update flashlight
  stormFlashAlpha*=Math.max(.97,.9+ar*.05);

  // Update lightning bolts
  for(let i=stormLightnings.length-1;i>=0;i--){
    const l=stormLightnings[i];
    l.life-=l.decay*dt;
    if(l.life<=0){stormLightnings.splice(i,1);continue}
  }

  // Update rain
  const rainTarget=STORM_RAIN_COUNT+Math.floor(ar*80);
  while(stormRain.length<rainTarget&&stormRain.length<STORM_RAIN_COUNT*2){
    stormRain.push({
      x:rand(0,W),y:rand(-50,0),
      vy:rand(200,500),vx:rand(-20,20),
      size:rand(1,3),hue:rand(180,240),
      sat:rand(30,80),lig:rand(50,80),
      trail:[],phase:rand(0,PI2),
      life:1,decay:rand(.0005,.002),
    });
  }
  while(stormRain.length>rainTarget&&stormRain.length>20){
    stormRain.pop();
  }
  for(let i=stormRain.length-1;i>=0;i--){
    const r=stormRain[i];
    r.life-=r.decay*dt;
    if(r.life<=0||r.y>H+30){
      // Recycle
      r.x=rand(0,W);r.y=rand(-40,-5);
      r.vy=rand(200,500)+(audioLevel*200);
      r.vx=rand(-20,20);
      r.life=1;
      r.hue=rand(180,240);
      // Wind from mouse
      if(mouse.active){
        r.vx+=(mouse.x-r.x)*.001;
      }
    }
    // Wind influenced by mouse
    if(mouse.active){r.vx+=(mouse.x-r.x)*.003*dt*.016}
    r.x+=r.vx*dt*.016;
    r.y+=r.vy*dt*.016;
    // Trail
    r.trail.push({x:r.x,y:r.y});
    if(r.trail.length>4)r.trail.shift();
  }

  // Update puddle reflections (pulse with storm intensity)
  for(const p of stormPuddles){
    p.alpha=lerp(p.alpha,.02+stormFlashAlpha*.08+ar*.04,.01);
    // Puddles shimmer with rain impact
    const waveEffect=Math.sin(time*p.waveSpeed+p.phase)*p.wave*.3;
    p.alpha=clamp(p.alpha+waveEffect*.01,0,.25);
  }
}

function drawStorm(time){
  if(currentMode!=='storm')return;
  const ar=audioLevel*2.5;

  // ── Render storm clouds to offscreen ──
  stormCloudCtx.clearRect(0,0,W,H);
  const flash=stormFlashAlpha>.01;
  for(const c of stormClouds){
    const pu=1+Math.sin(time*c.pulseSpeed+c.phase)*c.pulse*.5;
    const r=c.radius*pu;
    const a=clamp(c.baseAlpha*(.8+ar*.3),.02,.15);
    const g=stormCloudCtx.createRadialGradient(c.x,c.y,0,c.x,c.y,r);
    g.addColorStop(0,`rgba(${c.r},${c.g},${c.b},${a})`);
    g.addColorStop(.5,`rgba(${c.r-10},${c.g-5},${c.b-10},${a*.5})`);
    g.addColorStop(1,'rgba(0,0,0,0)');
    stormCloudCtx.fillStyle=g;
    stormCloudCtx.beginPath();stormCloudCtx.arc(c.x,c.y,r,0,PI2);
    stormCloudCtx.fill();
  }

  // ── Draw clouds to main canvas ──
  ctx.drawImage(stormCloudCanvas,0,0);

  // ── Draw rain ──
  for(const r of stormRain){
    const len=r.trail.length;
    for(let t=1;t<len;t++){
      const ta=t/len;
      tctx.globalAlpha=ta*.06*clamp(r.life,.2,1)*(.6+ar*.3);
      tctx.strokeStyle=`hsla(${r.hue},${r.sat}%,${r.lig+10}%,${ta*.4})`;
      tctx.lineWidth=r.size*ta*.3;
      tctx.beginPath();
      tctx.moveTo(r.trail[t-1].x,r.trail[t-1].y);
      tctx.lineTo(r.trail[t].x,r.trail[t].y);
      tctx.stroke();
    }
    // Rain streak
    ctx.globalAlpha=clamp(r.life*.15*(.5+ar*.3),.02,.25);
    const rHue=r.hue+Math.sin(time*.003+r.phase)*20;
    ctx.strokeStyle=`hsla(${rHue},80%,70%,${ctx.globalAlpha})`;
    ctx.lineWidth=r.size;
    ctx.beginPath();
    ctx.moveTo(r.x,r.y);
    ctx.lineTo(r.x-r.vx*dt*.008,r.y-r.vy*dt*.008);
    ctx.stroke();

    // Charged glow dot
    ctx.globalAlpha=clamp(r.life*.3*(.5+ar*.4),.02,.2);
    ctx.fillStyle=`hsla(${rHue},100%,80%,${ctx.globalAlpha})`;
    ctx.beginPath();ctx.arc(r.x,r.y,r.size*(.8+ar*.4),0,PI2);
    ctx.fill();
  }

  // ── Rain puddle reflections on ground ──
  for(const p of stormPuddles){
    const pa=clamp(p.alpha*(.5+ar*.4),0,.3);
    if(pa<.005)continue;
    tctx.globalAlpha=pa*.15;
    const phue=200+Math.sin(time*.002+p.phase)*20;
    tctx.fillStyle=`hsla(${phue},60%,65%,${pa*.2})`;
    const pw=p.size*4,ph=p.size*1.2;
    tctx.beginPath();
    tctx.ellipse(p.x,p.y,pw,ph,0,0,PI2);
    tctx.fill();
    tctx.globalAlpha=pa*.08;
    tctx.strokeStyle=`hsla(${phue},50%,80%,${pa*.1})`;
    tctx.lineWidth=.5;
    tctx.beginPath();
    tctx.moveTo(p.x-pw*.6,p.y-ph*.2);
    tctx.lineTo(p.x+pw*.6,p.y-ph*.2);
    tctx.stroke();
    tctx.globalAlpha=pa*.05;
    tctx.strokeStyle=`hsla(${phue+20},40%,85%,${pa*.08})`;
    tctx.beginPath();
    tctx.moveTo(p.x-pw*.4,p.y+ph*.1);
    tctx.lineTo(p.x+pw*.4,p.y+ph*.1);
    tctx.stroke();
  }
  tctx.globalAlpha=1;

  // ── Draw lightning bolts ──
  for(const l of stormLightnings){
    drawLightningBolt(time,l.branches,l.life);
  }

  // ── Screen flash ──
  if(stormFlashAlpha>.002){
    const el=document.getElementById('storm-flash');
    const fa=stormFlashAlpha*(.6+ar*.4);
    el.style.background=`rgba(180,210,255,${fa})`;
  }else{
    document.getElementById('storm-flash').style.background='rgba(200,220,255,0)';
  }
}

// ─── Galaxy Map Mouse Controls ────────────────────────────────
document.addEventListener('mousemove',e=>{
  if(currentMode==='galaxy'){
    galaxyOrbitTargetX=clamp(e.clientX/W,0,1);
    galaxyOrbitTargetY=clamp(e.clientY/H,0,1);
  }
});

// ─── Firefly Swarm — Boids Flocking ────────────────────────────
const FIREFLY_COUNT=200;
let fireflies=[];
const FF_PERCEPTION=150;
const FF_SEPARATION=35;
const FF_MAX_SPEED=2.5;
const FF_MAX_FORCE=.08;

function initFireflySwarm(){
  fireflies=[];
  for(let i=0;i<FIREFLY_COUNT;i++){
    fireflies.push({
      x:rand(0,W),y:rand(0,H),
      vx:rand(-1,1),vy:rand(-1,1),
      size:rand(1.5,4.5),
      hue:rand(80,160), // greens/yellows
      sat:rand(70,100),
      lig:rand(50,85),
      glowPhase:rand(0,PI2),
      glowSpeed:rand(.002,.008),
      glowIntensity:rand(.4,1),
      trail:[],
      phase:rand(0,PI2),
      wanderAngle:rand(0,PI2),
    });
  }
}
initFireflySwarm();
initStorm();

function updateFireflySwarm(dt){
  if(currentMode!=='firefly')return;
  const ar=audioLevel*2;
  const densityMul=getEffMaxParticles()/getEffMaxParticles();
  for(const fb of fireflies){
    // ── Boids flocking ──
    let steerX=0,steerY=0;
    let alignX=0,alignY=0,alignCount=0;
    let cohesX=0,cohesY=0,cohesCount=0;
    let sepaX=0,sepaY=0,sepaCount=0;

    for(const other of fireflies){
      if(other===fb)continue;
      const dx=other.x-fb.x;
      const dy=other.y-fb.y;
      const d=Math.sqrt(dx*dx+dy*dy);

      if(d<FF_PERCEPTION){
        // Alignment
        alignX+=other.vx;
        alignY+=other.vy;
        alignCount++;
        // Cohesion
        cohesX+=other.x;
        cohesY+=other.y;
        cohesCount++;

        if(d<FF_SEPARATION&&d>0){
          // Separation
          const force=(FF_SEPARATION-d)/FF_SEPARATION;
          sepaX-=(dx/d)*force;
          sepaY-=(dy/d)*force;
          sepaCount++;
        }
      }
    }

    // Apply forces
    if(sepaCount>0){
      steerX+=sepaX*6;
      steerY+=sepaY*6;
    }
    if(alignCount>0){
      steerX+=(alignX/alignCount-fb.vx)*.035;
      steerY+=(alignY/alignCount-fb.vy)*.035;
    }
    if(cohesCount>0){
      cohesX=(cohesX/cohesCount-fb.x)*.006;
      cohesY=(cohesY/cohesCount-fb.y)*.006;
      steerX+=cohesX;
      steerY+=cohesY;
    }

    // Mouse attraction / repulsion
    if(mouse.active){
      const dx=mouse.x-fb.x;
      const dy=mouse.y-fb.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<200&&d>5){
        steerX+=dx*.002*(200-d)/200;
        steerY+=dy*.002*(200-d)/200;
      }
    }

    // Wander
    fb.wanderAngle+=rand(-.05,.05);
    steerX+=Math.cos(fb.wanderAngle)*.02;
    steerY+=Math.sin(fb.wanderAngle)*.02;

    // Apply steering
    const steerMag=Math.sqrt(steerX*steerX+steerY*steerY);
    if(steerMag>0){
      const limited=Math.min(steerMag,FF_MAX_FORCE*(1+ar*.3));
      fb.vx+=(steerX/steerMag)*limited;
      fb.vy+=(steerY/steerMag)*limited;
    }

    // Limit speed
    const speed=Math.sqrt(fb.vx*fb.vx+fb.vy*fb.vy);
    if(speed>FF_MAX_SPEED*(1+ar*.3)){
      fb.vx=(fb.vx/speed)*FF_MAX_SPEED*(1+ar*.3);
      fb.vy=(fb.vy/speed)*FF_MAX_SPEED*(1+ar*.3);
    }

    // Apply velocity
    fb.x+=fb.vx;
    fb.y+=fb.vy;

    // Wrap around edges
    if(fb.x<-20)fb.x=W+20;
    if(fb.x>W+20)fb.x=-20;
    if(fb.y<-20)fb.y=H+20;
    if(fb.y>H+20)fb.y=-20;

    // Trail
    fb.trail.push({x:fb.x,y:fb.y});
    if(fb.trail.length>8)fb.trail.shift();
  }
}

function drawFireflySwarm(time){
  if(currentMode!=='firefly')return;
  const ar=audioLevel*3;
  for(const fb of fireflies){
    const tw=Math.sin(time*fb.glowSpeed+fb.glowPhase);
    const glow=.5+tw*.5;
    const pulseIntensity=fb.glowIntensity*glow*(1+ar*.4);
    const a=clamp(.2+pulseIntensity*.7,0,.95);

    if(a<.03)continue;
    const sz=fb.size*(1+pulseIntensity*.5+ar*.3);
    const hue=fb.hue+Math.sin(time*.001+fb.phase)*10;

    // ── Glow trail ──
    const tLen=fb.trail.length;
    for(let t=1;t<tLen;t++){
      const ta=t/tLen;
      tctx.globalAlpha=ta*.12*pulseIntensity;
      tctx.strokeStyle=`hsla(${hue},${fb.sat}%,${fb.lig+10}%,${ta*.4})`;
      tctx.lineWidth=sz*ta*.3;
      tctx.beginPath();
      tctx.moveTo(fb.trail[t-1].x,fb.trail[t-1].y);
      tctx.lineTo(fb.trail[t].x,fb.trail[t].y);
      tctx.stroke();
    }

    // ── Outer glow ring (firefly aura) ──
    ctx.globalAlpha=a*.3;
    const glowR=sz*10*pulseIntensity;
    const gg=ctx.createRadialGradient(fb.x,fb.y,0,fb.x,fb.y,glowR);
    gg.addColorStop(0,`hsla(${hue},${fb.sat}%,${fb.lig+20}%,.4)`);
    gg.addColorStop(.2,`hsla(${hue},${fb.sat}%,${fb.lig+10}%,.2)`);
    gg.addColorStop(.5,`hsla(${hue},${fb.sat}%,${fb.lig}%,.08)`);
    gg.addColorStop(1,'hsla(0,0%,100%,0)');
    ctx.fillStyle=gg;
    ctx.beginPath();ctx.arc(fb.x,fb.y,glowR,0,PI2);
    ctx.fill();

    // ── Firefly body (bright core) ──
    ctx.globalAlpha=a*.9;
    ctx.fillStyle=`hsla(${hue},${fb.sat}%,${fb.lig+15}%,1)`;
    ctx.shadowColor=`hsla(${hue},100%,80%,${a*.5})`;
    ctx.shadowBlur=10+sz*5+ar*10;
    ctx.beginPath();ctx.arc(fb.x,fb.y,sz*(.8+pulseIntensity*.3),0,PI2);
    ctx.fill();
    ctx.shadowBlur=0;

    // ── Inner bright spark ──
    ctx.globalAlpha=a*Math.min(1,pulseIntensity*1.5);
    ctx.fillStyle=`hsla(${hue},100%,90%,1)`;
    ctx.beginPath();ctx.arc(fb.x,fb.y,sz*.35,0,PI2);
    ctx.fill();
  }
  ctx.globalAlpha=1;
  tctx.globalAlpha=1;
}

// ─── Circular Audio Visualizer Ring ────────────────────────────
function drawCircularVisualizer(time){
  if(!showVisualizer)return;
  const cx=W/2,cy=H/2;
  const rad=Math.min(W,H)*.32;
  const bc=64;
  let hasFreq=!!(freqData&&freqData.length);
  const ar=audioLevel*3;
  for(let i=0;i<bc;i++){
    const a=(PI2/bc)*i+time*.00005;
    const fi=hasFreq?Math.floor((i/bc)*freqData.length):0;
    const ab=hasFreq?freqData[fi]/255:0;
    const sh=Math.sin(time*.002+i*.7)*.3+.5;
    const h=3+(ab*35+sh*14+ar*10);
    const x=cx+Math.cos(a)*rad;
    const y=cy+Math.sin(a)*rad;
    const hue=(i/bc)*360+time*.006;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(a+Math.PI/2);
    ctx.globalAlpha=clamp(.06+ab*.25+sh*.06+ar*.04,0,.4);
    ctx.fillStyle=`hsla(${hue},80%,70%,${ctx.globalAlpha})`;
    ctx.fillRect(-1.5,-h,3,h);
    ctx.restore();
  }
  // Central glow pulse
  if(audioLevel>.05||time%2000<500){
    const gp=Math.max(0,Math.min(1,audioLevel*4+Math.sin(time*.003)*.2));
    const gg=ctx.createRadialGradient(cx,cy,0,cx,cy,rad*.2*gp);
    gg.addColorStop(0,`rgba(100,200,255,${.02+gp*.04})`);
    gg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(cx,cy,rad*.2*gp,0,PI2);ctx.fill();
  }
  ctx.globalAlpha=1;
}

// ─── Trail canvas fade ─────────────────────────────────────────────
function fadeTrailCanvas(){
  if(!showTrails){tctx.clearRect(0,0,W,H);return}
  const p=PALETTES[paletteIdx];
  tctx.fillStyle=`rgba(${p.bg[0]},${p.bg[1]},${p.bg[2]},.035)`;
  tctx.fillRect(0,0,W,H);
}

