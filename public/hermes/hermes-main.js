// == hermes-main.js — Main loop, init, splash ==

// ─── Loop ───────────────────────────────────────────────────────────
function loop(time){
  dt=Math.min(time-prevTime||16,50);
  prevTime=time;frameCount++;fpsTimer+=dt;
  if(fpsTimer>=1000){fps=frameCount;frameCount=0;fpsTimer-=1000;document.getElementById('fpsC').textContent=fps}

  updateAudioLevel();
  panoTime=time;

  // Smooth tunnel transition
  if(Math.abs(tunnelTransition-tunnelTargetTransition)>.002){
    tunnelTransition=lerp(tunnelTransition,tunnelTargetTransition,.02*dt);
  }else{
    tunnelTransition=tunnelTargetTransition;
  }
  if(tunnelMode)tunnelAngle+=.003;

  // Background
  drawBgGradient();
  fadeTrailCanvas();

  updateNebulas(dt);
  updateGravityIndicator();

  // Word particles
  if(wordMode||wordParticles.length>0){
    updateWordParticles(dt);
  }

  // Layers
  drawCosmicWeb(time);
  drawNebulas(time);
  drawStars(time);
  drawShooters(dt);
  drawPrismRave(time);
  drawAurora(time);
  drawWormhole(time);
  drawGalaxy(time);
  updateStorm(dt);
  drawStorm(time);
  updateFireflySwarm(dt);
  drawFireflySwarm(time);
  drawCircularVisualizer(time);
  updateComets(dt);
  drawComets(time);
  updateStardust(dt);
  drawStardust();
  drawParticles(dt);

  // Word particles drawn on top
  if(wordParticles.length>0){
    drawWordParticles();
    // Clean up dead word particles
    wordParticles=wordParticles.filter(wp=>wp.life>.01);
    if(!wordForming&&wordParticles.length===0){
      // Done
    }
  }

  drawVignette();
  drawBloom();

  // Scene transition overlay
  drawSceneTransition(time);

  if(clickBoom){boomTimer-=dt*.001;if(boomTimer<=0){clickBoom=false;boomTimer=0}}

  shooterTimer-=dt;
  if(shooterTimer<=0){
    shooterTimer=SHOOTER_INTERVAL+rand(-1000,2000);
    const scene=SCENE_MODES.find(m=>m.id===currentMode);
    if(Math.random()<.65&&tunnelTransition<.7&&scene?.id!=='paint'&&scene?.id!=='constellation'&&scene?.id!=='word')spawnShooter();
  }

  constelTimer+=dt;
  if(constelTimer>8000&&constelTimer<18000){
    constel.classList.add('show');constel.style.left=rand(10,70)+'%';constel.style.top=rand(20,60)+'%';
  }else if(constelTimer>=20000){constel.classList.remove('show');if(constelTimer>25000)constelTimer=0}

  // Comet timer (works in all modes except word/paint/tunnel)
  cometTimer-=dt;
  if(cometTimer<=0){
    const scene=SCENE_MODES.find(m=>m.id===currentMode);
    if(scene?.id!=='word'&&scene?.id!=='paint')spawnComet();
    cometTimer=COMET_INTERVAL+rand(-1000,2000);
  }

  document.getElementById('starsC').textContent=STARS_CNT;
  requestAnimationFrame(loop);
}

// Start sequence moved to hermes.html inline script (runs after resize() inside try/catch)
