/* ===== Schotman Guitars — Custom Build configurator =====
   Data-driven, Halo-style dropdown logic, organised into Schotman "chapters".
   To add real component photos later: give any option a `thumb: "assets/uploads/xyz.png"`
   and it shows next to the dropdown automatically. To change prices/options,
   just edit the CONFIG array below — nothing else needs to change.
*/
(function () {
  "use strict";
  const mount = document.getElementById("builderGroups");
  if (!mount) return;
  const $ = (s) => document.querySelector(s);

  const BASE = 1599; // starting handbuilt body-in-white

  // opt = [label, priceDelta, extras?]  extras: {img, tint, thumb, base}
  const CONFIG = [
    { chapter: "The Body", key: "body", groups: [
      { key: "shape", label: "Body shape", opts: [
        ["8141 S — Superstrat", 0, { img: "assets/guitars/8141s-green.png" }],
        ["MT — Single-cut", 450, { img: "assets/guitars/mt-cot.png" }],
        ["8141 P — Classic", 200, { img: "assets/guitars/8141p-classic.png" }],
      ]},
      { key: "bodywood", label: "Body wood", opts: [
        ["Mahogany", 0], ["Swamp Ash", 120], ["Alder", 80], ["Korina (limited)", 190],
      ]},
      { key: "top", label: "Top wood", opts: [
        ["Solid — no cap", 0], ["Flamed Maple", 350], ["Quilted Maple", 450],
        ["Poplar Burl", 400], ["Buckeye Burl (one-off)", 550],
      ]},
      { key: "chamber", label: "Chambering", opts: [["Solid body", 0], ["Chambered — lighter, airier", 150]] },
    ]},

    { chapter: "The Neck", key: "neck", groups: [
      { key: "neckwood", label: "Neck wood", opts: [
        ["Roasted Maple", 0], ["Hard Maple", 0], ["Wenge", 150], ["5-piece Maple / Walnut", 220],
      ]},
      { key: "construction", label: "Neck joint", opts: [
        ["Bolt-on", 0], ["Set-neck", 150], ["Neck-through", 300],
      ]},
      { key: "profile", label: "Neck profile", opts: [["Modern C", 0], ["Thin D", 0], ["Full C", 0]] },
      { key: "fretboard", label: "Fretboard", opts: [
        ["Ebony", 0], ["Roasted Maple", 0], ["Pau Ferro", 30], ["Indian Rosewood", 40],
      ]},
      { key: "frets", label: "Frets", opts: [
        ["22 · Jumbo Nickel", 0], ["24 · Jumbo Nickel", 30], ["24 · Stainless Steel", 120],
      ]},
      { key: "inlays", label: "Inlays", opts: [
        ["Side dots only", 0], ["Schotman clover (12th)", 120], ["Offset blocks", 90], ["Custom — discuss", 250],
      ]},
    ]},

    { chapter: "The Voice", key: "voice", groups: [
      { key: "config", label: "Pickup layout", opts: [["HH — two humbuckers", 0], ["HSS", 60], ["HSH", 90]] },
      { key: "bridgepu", label: "Bridge pickup", opts: [
        ["Railhammer Hyper Vintage", 0], ["EMG 81 (active)", 140], ["Seymour Duncan JB", 130], ["Bare Knuckle Aftermath", 230],
      ]},
      { key: "neckpu", label: "Neck pickup", opts: [
        ["Railhammer Hyper Vintage", 0], ["EMG 60 (active)", 140], ["Seymour Duncan '59", 130], ["Bare Knuckle Aftermath", 230],
      ]},
      { key: "controls", label: "Controls", opts: [
        ["1 Volume · 1 Tone", 0], ["1 Volume (master)", 0], ["Vol / Tone + coil-split", 40], ["Vol / Tone + kill switch", 30],
      ]},
    ]},

    { chapter: "The Hardware", key: "hardware", groups: [
      { key: "bridge", label: "Bridge", opts: [
        ["Schaller fixed / hardtail", 0], ["Floyd Rose 1000", 250], ["Kahler 2300 tremolo", 290], ["Evertune", 320],
      ]},
      { key: "tuners", label: "Tuners", opts: [["Schaller locking", 0], ["Schaller standard", 0]] },
      { key: "hwcolor", label: "Hardware colour", opts: [
        ["Black", 0], ["Chrome", 0], ["Cosmo Black", 40], ["Gold", 60],
      ]},
    ]},

    { chapter: "The Finish", key: "finish", groups: [
      { key: "color", label: "Colour", opts: [
        ["Satin Black", 0, { tint: "#141414" }],
        ["Transparent Natural", 450, { tint: "#b98a4b" }],
        ["Green Burl", 600, { tint: "#2f5d3a" }],
        ["Ocean Blue Burl", 600, { tint: "#1f4a63" }],
        ["Wine Red", 350, { tint: "#5c1a22" }],
        ["Bone White — hand art", 800, { tint: "#e9e4d8" }],
      ]},
      { key: "finishtype", label: "Finish type", opts: [["Gloss", 0], ["Satin", 0], ["Open-pore satin", 40]] },
      { key: "binding", label: "Body binding", opts: [["None", 0], ["Cream", 60], ["Natural maple", 60]] },
    ]},

    { chapter: "The Signature", key: "signature", groups: [
      { key: "headstock", label: "Headstock", opts: [["Schotman logo", 0], ["+ your name / signature", 90]] },
      { key: "case", label: "Case", opts: [["Padded gig bag", 0], ["Schotman ABS hard case", 180]] },
    ]},
  ];

  const state = {};   // flatKey -> {label, price, extras}
  const groupEls = {};

  const eur = (n) => new Intl.NumberFormat("nl-NL",
    { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const priceTag = (d) => d > 0 ? ` (+${eur(d)})` : "";

  // build DOM
  CONFIG.forEach(chap => {
    const sec = document.createElement("div");
    sec.className = "bld-chapter reveal";
    sec.innerHTML = `<h3 class="bld-chapter__title"><span>${String(CONFIG.indexOf(chap)+1).padStart(2,"0")}</span>${chap.chapter}</h3>`;
    const grid = document.createElement("div");
    grid.className = "bld-grid";

    chap.groups.forEach(g => {
      const flat = `${chap.key}.${g.key}`;
      const wrap = document.createElement("label");
      wrap.className = "bld-field";
      const sel = document.createElement("select");
      sel.dataset.flat = flat;
      g.opts.forEach((o, i) => {
        const [label, delta] = o;
        const op = document.createElement("option");
        op.value = i;
        op.textContent = label + priceTag(delta);
        sel.appendChild(op);
      });
      wrap.innerHTML = `<span>${g.label}</span>`;
      wrap.appendChild(sel);
      grid.appendChild(wrap);

      // init state to first option
      const [label, delta, extras] = g.opts[0];
      state[flat] = { group: g.label, label, price: delta, extras: extras || {} };
      groupEls[flat] = { def: g, sel };

      sel.addEventListener("change", () => {
        const [l, d, ex] = g.opts[+sel.value];
        state[flat] = { group: g.label, label: l, price: d, extras: ex || {} };
        render();
      });
    });

    sec.appendChild(grid);
    mount.appendChild(sec);
  });

  const img = $("#cfgImg"), tint = $("#cfgTint"), priceEl = $("#cfgPrice"), sheet = $("#buildSheet");

  function render() {
    let total = BASE;
    Object.values(state).forEach(o => total += o.price);
    priceEl.textContent = eur(total);

    if (state["body.shape"]?.extras.img) img.src = state["body.shape"].extras.img;
    if (state["finish.color"]?.extras.tint) tint.style.background = state["finish.color"].extras.tint;

    // build sheet grouped by chapter
    sheet.innerHTML = CONFIG.map(chap => {
      const rows = chap.groups.map(g => {
        const s = state[`${chap.key}.${g.key}`];
        return `<div class="bs-row"><span>${g.label}</span><b>${s.label}${s.price>0?` · +${eur(s.price)}`:""}</b></div>`;
      }).join("");
      return `<div class="bs-chap"><h4>${chap.chapter}</h4>${rows}</div>`;
    }).join("");
    return total;
  }
  render();

  // reveal newly-added chapters
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }), { threshold: .08 });
    document.querySelectorAll(".bld-chapter").forEach(el => io.observe(el));
  }

  // send spec to contact form
  $("#cfgRequest")?.addEventListener("click", () => {
    const total = render();
    const lines = CONFIG.map(chap => {
      const rows = chap.groups.map(g => `  • ${g.label}: ${state[`${chap.key}.${g.key}`].label}`).join("\n");
      return `${chap.chapter}\n${rows}`;
    }).join("\n\n");
    const msg = document.getElementById("contactMsg");
    if (msg) msg.value = `Hi Robert, here's the Schotman I designed:\n\n${lines}\n\nEstimated total: ${eur(total)}\n\nCan we make it real?`;
    const sub = document.querySelector('select[name="subject"]');
    if (sub) sub.value = "A custom build";
  });
})();
