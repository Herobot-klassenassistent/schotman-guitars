/* ===== Schotman Guitars — blog (list + single post) =====
   Posts live in content/blog.json (edited by Robert in /admin → Blog).
   Includes a tiny, safe Markdown renderer so posts format nicely.
*/
(function () {
  "use strict";
  const listEl = document.getElementById("blogList");
  const postEl = document.getElementById("post");
  if (!listEl && !postEl) return;

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return d || ""; }
  };
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // minimal, safe markdown → html
  function md(src) {
    const lines = esc(src || "").replace(/\r/g, "").split("\n");
    let html = "", inList = false;
    const inline = (t) => t
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) { closeList(); continue; }
      let m;
      if ((m = line.match(/^###\s+(.*)/))) { closeList(); html += `<h3>${inline(m[1])}</h3>`; }
      else if ((m = line.match(/^##\s+(.*)/))) { closeList(); html += `<h2>${inline(m[1])}</h2>`; }
      else if ((m = line.match(/^#\s+(.*)/))) { closeList(); html += `<h2>${inline(m[1])}</h2>`; }
      else if ((m = line.match(/^[-*]\s+(.*)/))) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(m[1])}</li>`; }
      else { closeList(); html += `<p>${inline(line)}</p>`; }
    }
    closeList();
    return html;
  }

  fetch("content/blog.json").then(r => r.json()).then(data => {
    const posts = (data.posts || []).filter(p => p.published !== false)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    /* ---- list page ---- */
    if (listEl) {
      if (!posts.length) { listEl.innerHTML = '<p class="blog__empty">No posts yet — check back soon.</p>'; return; }
      listEl.innerHTML = posts.map(p => `
        <a class="bpost reveal" href="post.html?id=${encodeURIComponent(p.id)}">
          ${p.image ? `<div class="bpost__img"><img src="${p.image}" alt="${esc(p.title)}" loading="lazy"></div>` : ""}
          <div class="bpost__body">
            <p class="bpost__date">${fmtDate(p.date)}</p>
            <h2 class="bpost__title">${esc(p.title)}</h2>
            <p class="bpost__excerpt">${esc(p.excerpt || "")}</p>
            <span class="bpost__more">Read more →</span>
          </div>
        </a>`).join("");
      document.querySelectorAll && window.dispatchEvent(new Event("scroll"));
    }

    /* ---- single post ---- */
    if (postEl) {
      const id = new URLSearchParams(location.search).get("id");
      const p = posts.find(x => x.id === id) || posts[0];
      if (!p) { postEl.innerHTML = '<div class="gp__loading">Post not found. <a href="blog.html">Back to the blog →</a></div>'; return; }
      document.title = `${p.title} — Schotman Guitars`;
      postEl.innerHTML = `
        <a href="blog.html" class="gp__back">← All posts</a>
        <article class="article">
          <p class="article__date">${fmtDate(p.date)}</p>
          <h1 class="article__title">${esc(p.title)}</h1>
          ${p.image ? `<div class="article__hero"><img src="${p.image}" alt="${esc(p.title)}"></div>` : ""}
          <div class="article__body">${md(p.body)}</div>
          <a href="blog.html" class="btn btn--ghost" style="margin-top:2rem">← All posts</a>
        </article>`;
    }
  }).catch(err => {
    const t = listEl || postEl;
    if (t) t.innerHTML = '<div class="gp__loading">Could not load the blog.</div>';
    console.warn(err);
  });
})();
