const fs = require('fs');
const code = fs.readFileSync('public/hermes.html', 'utf8');
const m = code.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('NO SCRIPT'); process.exit(1); }
const js = m[1];

global.document = {
  getElementById: (id) => ({
    _id: id,
    style: {},
    classList: { add:()=>{}, remove:()=>{}, toggle:()=>{}, contains:()=>false },
    textContent: '',
    addEventListener: () => {},
    appendChild: () => {},
    innerHTML: '',
    focus: () => {},
    children: [],
    querySelectorAll: () => [],
    querySelector: () => null,
    getContext: () => ({
      clearRect:()=>{}, fillRect:()=>{}, drawImage:()=>{}, getImageData:()=>({data:[0,0,0,0]}),
      putImageData:()=>{}, measureText:()=>({width:0}), createLinearGradient:()=>({addColorStop:()=>{}}),
      createRadialGradient:()=>({addColorStop:()=>{}}), save:()=>{}, restore:()=>{}, scale:()=>{},
      translate:()=>{}, rotate:()=>{}, beginPath:()=>{}, moveTo:()=>{}, lineTo:()=>{}, arc:()=>{},
      closePath:()=>{}, fill:()=>{}, stroke:()=>{}, fillStyle:'', strokeStyle:'', lineWidth:1,
      globalAlpha:1, globalCompositeOperation:'', filter:''
    })
  }),
  createElement: () => ({style:{}, classList:{add:()=>{}}, href:'', download:'', click:()=>{}}),
  querySelectorAll: () => [],
  querySelector: () => null,
  body: {},
  documentElement: {style:{}}
};
global.window = global;
global.addEventListener = () => {};
global.innerWidth = 1920;
global.innerHeight = 1080;
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (fn) => { setTimeout(fn, 500); };
global.setTimeout = (fn, ms) => { if (ms < 100) fn(); };
global.clearTimeout = () => {};
global.audioInitialized = false;

try {
  eval(js);
  console.log('JS EXECUTED OK -- no thrown errors');
} catch(e) {
  console.log('RUNTIME ERROR:', e.message);
  const lines = e.stack.split('\n').slice(0,6);
  lines.forEach(l => console.log('  ' + l));
}
