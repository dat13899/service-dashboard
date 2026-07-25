// == hermes-core.js — Globals, utils, canvas, PALETTES, SCENE_MODES ==


// ─── Cosmic Dreamscape v7 — Particle Word Mode + Gradient Paint ────────
const c=document.getElementById('c'),ctx=c.getContext('2d');
const tc=document.getElementById('trailCanvas'),tctx=tc.getContext('2d');
const bc=document.getElementById('bloom'),bctx=bc.getContext('2d');
const transc=document.getElementById('trans-overlay'),tranctx=transc.getContext('2d');
let W,H;
function resize(){
  W=c.width=tc.width=bc.width=transc.width=innerWidth;
  H=c.height=tc.height=bc.height=transc.height=innerHeight;
}
resize();addEventListener('resize',()=>{resize();initPrismGeometry();initAuroraBands();initWormhole();initGalaxy();initFireflySwarm();initStorm();});

const PI2=Math.PI*2;
const rand=(min,max)=>Math.random()*(max-min)+min;
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v;

// ─── Color Palettes ──────────────────────────────────────────────────
const PALETTES=[
  {name:'NEBULA', bg:[5,6,15], bgGrad:[[2,5,18],[8,8,12]],
    nebula:[[40,80,180],[120,40,160],[180,60,120],[30,120,140],[90,30,140]],
    partHue:[190,330], partSat:[60,100], partLig:[55,85], accent:[91,192,255]},
  {name:'SUNSET', bg:[20,8,10], bgGrad:[[25,6,8],[15,10,12]],
    nebula:[[200,50,30],[180,70,40],[140,60,50],[100,30,70],[60,10,80]],
    partHue:[0,50], partSat:[70,100], partLig:[55,85], accent:[255,150,80]},
  {name:'AURORA', bg:[5,20,20], bgGrad:[[3,25,15],[7,15,22]],
    nebula:[[30,120,80],[20,80,120],[40,160,60],[60,140,100],[80,40,140]],
    partHue:[100,200], partSat:[60,100], partLig:[55,85], accent:[80,220,150]},
  {name:'DEEPSEA', bg:[2,6,25], bgGrad:[[1,5,30],[3,8,20]],
    nebula:[[10,20,100],[20,40,140],[10,60,120],[5,30,160],[40,10,130]],
    partHue:[160,260], partSat:[50,90], partLig:[45,75], accent:[60,120,220]},
  {name:'LAVA', bg:[25,8,5], bgGrad:[[30,6,3],[20,10,8]],
    nebula:[[180,40,10],[200,60,20],[160,80,30],[100,20,10],[140,10,5]],
    partHue:[0,40], partSat:[80,100], partLig:[55,90], accent:[255,120,40]},
  {name:'VOID', bg:[8,6,20], bgGrad:[[6,4,25],[10,8,15]],
    nebula:[[60,20,100],[80,40,120],[40,20,80],[100,30,140],[20,10,60]],
    partHue:[240,310], partSat:[50,80], partLig:[45,75], accent:[140,80,220]},
];
let paletteIdx=0;
let palettePrev=0;
let paletteTransition=1;

// ─── Scene Modes ─────────────────────────────────────────────────────
const SCENE_MODES=[
  {id:'cosmic',   label:'Cosmic Drift',     icon:'🌌', desc:'Classic immersive dreamscape', badge:'◆ cosmic drift ◆',           badgeCls:'',             nebulaMul:1,   webMul:1,   starParallax:1,   tunnelDefault:false, paintMode:false, wordMode:false},
  {id:'tunnel',   label:'Hyperspace',       icon:'🌀', desc:'Warp-speed 3D star tunnel',      badge:'◇ H Y P E R S P A C E ◇',   badgeCls:'hyper',       nebulaMul:.6,  webMul:0,    starParallax:.3,  tunnelDefault:true,  paintMode:false, wordMode:false},
  {id:'paint',    label:'Particle Paint',   icon:'🎨', desc:'Draw with light particles',     badge:'◇ P A R T I C L E  P A I N T ◇', badgeCls:'paint-mode', nebulaMul:.5,  webMul:.4,   starParallax:.5,  tunnelDefault:false, paintMode:true,  wordMode:false},
  {id:'constellation', label:'Constellation', icon:'✦', desc:'Star web & connection focus',  badge:'◇ C O N S T E L L A T I O N ◇', badgeCls:'constellation-mode', nebulaMul:.4, webMul:2.5, starParallax:1.5, tunnelDefault:false, paintMode:false, wordMode:false},
  {id:'nebula',   label:'Nebula Flow',      icon:'🌊', desc:'Emphasized nebula clouds',       badge:'◇ N E B U L A  F L O W ◇',   badgeCls:'nebula-mode', nebulaMul:2.2, webMul:.3,   starParallax:.7,  tunnelDefault:false, paintMode:false, wordMode:false},
  {id:'word',     label:'Word Form',        icon:'✎', desc:'Type text → particle letters',   badge:'◇ W O R D  F O R M ◇',        badgeCls:'word-mode',  nebulaMul:.3,  webMul:0,    starParallax:.4,  tunnelDefault:false, paintMode:false, wordMode:true},
  {id:'prism',    label:'Prism Rave',       icon:'🔮', desc:'Kaleidoscope geometric rave',    badge:'◇ P R I S M  R A V E ◇',       badgeCls:'prism-mode', nebulaMul:.2,  webMul:0,    starParallax:.3,  tunnelDefault:false, paintMode:false, wordMode:false},
  {id:'aurora',   label:'Aurora Borealis',  icon:'🌟', desc:'Flowing aurora curtain waves', badge:'◇ A U R O R A  B O R E A L I S ◇',badgeCls:'aurora-mode',nebulaMul:.08, webMul:0,    starParallax:.5,  tunnelDefault:false, paintMode:false, wordMode:false},
  {id:'wormhole', label:'Stargate Wormhole', icon:'🌀', desc:'Warp-ring time-space portal',    badge:'◇ S T A R G A T E  W O R M H O L E ◇',badgeCls:'wormhole-mode',nebulaMul:.05,webMul:0,    starParallax:.2,  tunnelDefault:false, paintMode:false, wordMode:false},
  {id:'galaxy',   label:'Galaxy Map',       icon:'🌌', desc:'Top-down spiral galaxy explorer',badge:'◇ G A L A X Y  M A P ◇',      badgeCls:'galaxy-mode', nebulaMul:.02,webMul:0,    starParallax:.08, tunnelDefault:false, paintMode:false, wordMode:false},
  {id:'firefly',  label:'Firefly Swarm',     icon:'🪲', desc:'Boids flocking light swarm',       badge:'◇ F I R E F L Y  S W A R M ◇', badgeCls:'firefly-mode',nebulaMul:.01,webMul:0,    starParallax:.04, tunnelDefault:false, paintMode:false, wordMode:false},
  {id:'storm',    label:'Cosmic Storm',       icon:'⚡', desc:'Lightning bolts & charged rain',     badge:'◇ C O S M I C  S T O R M ◇',    badgeCls:'storm-mode', nebulaMul:.4, webMul:.3,   starParallax:.3,  tunnelDefault:false, paintMode:false, wordMode:false},
];
let currentMode='cosmic';
let paintMode=false;
let paintBrushSize=8;
let paintHue=200;
let paintMouseDown=false;
let paintSpawnTimer=0;

// ─── Config Panel ───────────────────────────────────────────────────
let cfgPanelOpen=false;
let showTrails=true;
let cfgTunnelSpeed=5;
let cfgBloomIntensity=5;
let cfgNebulaSpeed=5;
let cfgDensity=5;
let cfgAuroraSpeed=5;
let cfgWaves=6;
let showVisualizer=true;

// ─── Resonance Wave Rings ──────────────────────────────────────────
let resonanceWaves=[];
const MAX_WAVES=24;
let waveIdCounter=0;

