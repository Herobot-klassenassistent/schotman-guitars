/* ===== Schotman Guitars — Workshop process =====
   Edit PROCESS below to change the build-journey chart. Each step:
   { stage, title, body, tags:[...], hand:"the by-hand line" }
   (Later this can be moved into Decap CMS so Robert edits it himself.)
*/
(function () {
  "use strict";
  const PROCESS = [
    { stage: "Step 01 · It starts with you",
      title: "Consultation & Design",
      body: "Every build begins with a conversation. Your playing, your body, your sound. Robert turns it into sketches and a full CAD design — scale length, ergonomics, weight and balance dialled in before a single chip of wood is cut.",
      tags: ["Interview", "Sketching", "CAD design", "Ergonomics"],
      hand: "Robert designs every guitar himself." },
    { stage: "Step 02 · The raw material",
      title: "Wood Selection",
      body: "Tonewoods are chosen and matched by hand from seasoned stock — mahogany, roasted maple, ash, and figured or burl tops selected for both grain and voice. The wood decides half the sound; nothing is picked from a bin.",
      tags: ["Hand-picked tonewoods", "Book-matched tops", "Moisture-checked"],
      hand: "Each top is chosen by eye, one at a time." },
    { stage: "Step 03 · Precision meets craft",
      title: "CNC & Body Shaping",
      body: "Modern CNC brings pinpoint accuracy to cavities, neck pockets and outlines. Then the machine steps back: contours, carves and the feel in your ribs and forearm are shaped and sanded by hand.",
      tags: ["CNC precision", "Hand-carved contours", "Chambering"],
      hand: "CNC for accuracy, hands for the feel." },
    { stage: "Step 04 · The playing field",
      title: "Neck & Fretboard",
      body: "The neck is carved to your chosen profile, the fretboard slotted and radiused, then fretted, levelled, crowned and polished. Inlays — right up to the Schotman clover — are cut and set here.",
      tags: ["Neck carving", "Fretwork", "Inlays", "Stainless option"],
      hand: "Fret level & crown done by hand, fret by fret." },
    { stage: "Step 05 · The Schotman signature",
      title: "Custom Paint & Finish",
      body: "This is where a guitar becomes yours. In his own booth Robert sprays bursts, transparents and burls, and paints one-off artwork by hand — like the Crown of Thorns built for Marko Tervonen. Gloss, satin or open-pore, wet-sanded and buffed.",
      tags: ["Bursts & transparents", "Hand-painted art", "Wet-sand & buff"],
      hand: "Custom artwork painted by Robert's own hand." },
    { stage: "Step 06 · The voice",
      title: "Electronics & Components",
      body: "Pickups, pots, switching and shielding are installed and wired to spec — Railhammer, EMG, Seymour Duncan or Bare Knuckle, with clean, quiet, hand-soldered wiring. Your controls, your coil-splits, your kill switch.",
      tags: ["Hand-wired", "Shielded cavities", "Pickup of choice"],
      hand: "Every joint hand-soldered and tested." },
    { stage: "Step 07 · Coming together",
      title: "Assembly & Hardware",
      body: "Bridge, tuners and hardware — Schaller, Floyd Rose, Kahler or Evertune — are fitted and aligned. Neck meets body, string-through geometry checked, everything torqued and true.",
      tags: ["Schaller · Floyd Rose · Kahler", "Neck fit", "Alignment"],
      hand: "Fitted and aligned by hand for perfect geometry." },
    { stage: "Step 08 · Made to play",
      title: "Setup & Intonation",
      body: "The nut is cut, action set, neck relief tuned and intonation perfected so the guitar plays exactly the way you asked for. Fast and low, or tall and singing — your call.",
      tags: ["Nut cutting", "Action & relief", "Intonation"],
      hand: "Personally set up to your preference." },
    { stage: "Step 09 · The last look",
      title: "Final QC & Delivery",
      body: "A full inspection, a final clean, studio photos for the archive, and into its case. Then your one-of-one Schotman ships — with the story of how it was made.",
      tags: ["Inspection", "Archive photos", "Cased & shipped"],
      hand: "Signed off personally before it leaves Heino." },
  ];

  const tl = document.getElementById("wsTimeline");
  if (!tl) return;

  const progress = document.createElement("div");
  progress.className = "ws-progress";
  tl.appendChild(progress);

  PROCESS.forEach((s, i) => {
    const el = document.createElement("article");
    el.className = "wstep";
    el.innerHTML = `
      <div class="wstep__node">${String(i + 1).padStart(2, "0")}</div>
      <div class="wstep__card">
        <p class="wstep__stage">${s.stage}</p>
        <h2 class="wstep__title">${s.title}</h2>
        <p class="wstep__body">${s.body}</p>
        <div class="wstep__tags">${s.tags.map(t => `<span>${t}</span>`).join("")}</div>
        <p class="wstep__hand">${s.hand}</p>
      </div>`;
    tl.appendChild(el);
  });

  const steps = [...tl.querySelectorAll(".wstep")];

  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.25 });
  steps.forEach(s => io.observe(s));

  // progress spine + active state
  function onScroll() {
    const r = tl.getBoundingClientRect();
    const vh = window.innerHeight;
    const filled = Math.min(Math.max(vh * 0.5 - r.top, 0), r.height);
    progress.style.height = filled + "px";
    let active = 0;
    steps.forEach((s, i) => {
      const sr = s.getBoundingClientRect();
      if (sr.top < vh * 0.55) active = i;
    });
    steps.forEach((s, i) => s.classList.toggle("active", i === active));
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();
