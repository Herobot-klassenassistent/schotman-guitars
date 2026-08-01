/* ===== Schotman Guitars — A/B sound comparison =====
   Generates two guitar tones in-browser so the tool works today:
     • "stock"    = fewer harmonics, quick decay, duller  → thin sound
     • "schotman" = rich harmonics, long sustain, brighter → alive & woody
   When Robert records real A/B takes, drop them at:
     assets/audio/stock.wav  and  assets/audio/schotman.wav
   The player auto-detects and uses the real files instead of the synth.
*/
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const canvas = $("#viz"); if (!canvas) return;
  const ctx2d = canvas.getContext("2d");

  const AC = window.AudioContext || window.webkitAudioContext;
  let audio, analyser, freqData, timeData, source, playing = false, current = "stock";
  const buffers = {};   // decoded/synth AudioBuffers keyed by variant

  const PROFILES = {
    stock:    { partials: [1, .35, .12, .04], decay: 3.4, bright: .55, rich: 38, sustain: 44, clarity: 56, label: "Stock guitar" },
    schotman: { partials: [1, .7, .5, .38, .28, .2, .13, .08], decay: 1.5, bright: 1, rich: 93, sustain: 89, clarity: 92, label: "Schotman" }
  };

  // riff: [freqHz, startSec, durSec]
  const E2=82.41, A2=110, B2=123.47, D3=146.83, E3=164.81, G3=196;
  const RIFF = [[E2,0,.5],[E2,.5,.25],[G3,.75,.25],[D3,1,.5],[A2,1.5,.25],[B2,1.75,.25],[E3,2,.9]];
  const DUR = 3.1;

  function synth(profile) {
    const sr = 44100, off = new OfflineAudioContext(1, Math.ceil(sr * DUR), sr);
    const master = off.createGain(); master.gain.value = .5;
    const tone = off.createBiquadFilter();
    tone.type = "lowpass"; tone.frequency.value = 1200 + profile.bright * 4200; tone.Q.value = .7;
    tone.connect(master); master.connect(off.destination);

    RIFF.forEach(([f, t, d]) => {
      profile.partials.forEach((amp, i) => {
        const o = off.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f * (i + 1) * (1 + (Math.random() - .5) * .004);
        const g = off.createGain();
        const peak = amp * .5;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + .01);
        g.gain.exponentialRampToValueAtTime(.0005, t + d * profile.decay);
        o.connect(g); g.connect(tone);
        o.start(t); o.stop(t + Math.min(d * profile.decay, DUR - t));
      });
    });
    return off.startRendering();
  }

  async function getBuffer(variant) {
    if (buffers[variant]) return buffers[variant];
    // try real .wav first
    try {
      const res = await fetch(`assets/audio/${variant}.wav`, { cache: "no-store" });
      if (res.ok) {
        const arr = await res.arrayBuffer();
        buffers[variant] = await audio.decodeAudioData(arr);
        $("#abNote").textContent = "Playing Robert's real studio recordings.";
        return buffers[variant];
      }
    } catch (e) { /* fall through to synth */ }
    buffers[variant] = await synth(PROFILES[variant]);
    return buffers[variant];
  }

  function setMeters(p) {
    const set = (id, v) => { const el = $(id); if (el) el.style.width = v + "%"; };
    set("#mRich", p.rich); set("#mSustain", p.sustain); set("#mClarity", p.clarity);
  }

  async function ensureAudio() {
    if (!audio) {
      audio = new AC();
      analyser = audio.createAnalyser();
      analyser.fftSize = 1024; analyser.smoothingTimeConstant = .8;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      timeData = new Uint8Array(analyser.fftSize);
      analyser.connect(audio.destination);
    }
    if (audio.state === "suspended") await audio.resume();
  }

  async function play() {
    await ensureAudio();
    stop();
    const buf = await getBuffer(current);
    source = audio.createBufferSource();
    source.buffer = buf; source.loop = true;
    source.connect(analyser);
    source.start();
    playing = true;
    $("#abPlay").classList.add("playing");
    $("#abPlay").innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    draw();
  }
  function stop() {
    if (source) { try { source.stop(); } catch (e) {} source.disconnect(); source = null; }
    playing = false;
    const b = $("#abPlay"); b.classList.remove("playing");
    b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  }

  /* ===== visualization ===== */
  function resize() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize); resize();

  function draw() {
    if (!playing) { idle(); return; }
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx2d.clearRect(0, 0, w, h);
    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);

    // frequency bars (bottom)
    const bars = 64, step = Math.floor(freqData.length / bars);
    const bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const v = freqData[i * step] / 255;
      const bh = v * h * .62;
      const g = ctx2d.createLinearGradient(0, h, 0, h - bh);
      g.addColorStop(0, "rgba(176,114,47,.9)"); g.addColorStop(1, "rgba(230,196,131,.95)");
      ctx2d.fillStyle = g;
      ctx2d.fillRect(i * bw + bw * .15, h - bh, bw * .7, bh);
    }
    // waveform (overlaid)
    ctx2d.beginPath();
    for (let i = 0; i < timeData.length; i++) {
      const x = (i / timeData.length) * w;
      const y = (timeData[i] / 255) * h;
      i ? ctx2d.lineTo(x, y) : ctx2d.moveTo(x, y);
    }
    ctx2d.strokeStyle = "rgba(236,231,223,.85)"; ctx2d.lineWidth = 1.6; ctx2d.stroke();
    requestAnimationFrame(draw);
  }

  function idle() {
    const w = canvas.clientWidth, h = canvas.clientHeight, t = Date.now() / 600;
    ctx2d.clearRect(0, 0, w, h);
    ctx2d.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = h / 2 + Math.sin(x / 40 + t) * 12 * Math.sin(t / 2);
      x ? ctx2d.lineTo(x, y) : ctx2d.moveTo(x, y);
    }
    ctx2d.strokeStyle = "rgba(200,161,90,.35)"; ctx2d.lineWidth = 1.4; ctx2d.stroke();
    if (!playing) requestAnimationFrame(idle);
  }
  idle();

  /* ===== controls ===== */
  $("#abPlay").addEventListener("click", () => playing ? stop() : play());
  document.querySelectorAll(".ab__btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".ab__btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      current = btn.dataset.src;
      const p = PROFILES[current];
      $("#nowLabel").textContent = p.label;
      setMeters(p);
      if (playing) await play(); // restart with new tone
    });
  });

  setMeters(PROFILES.stock);
})();
