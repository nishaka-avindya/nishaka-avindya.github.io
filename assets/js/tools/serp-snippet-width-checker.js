(function () {
  "use strict";

  var TITLE_LIMIT = 580;
  var DESC_LIMIT = 990;
  var TITLE_FONT = "20px Arial, sans-serif";
  var DESC_FONT = "14px Arial, sans-serif";

  var root = document.querySelector("[data-serp-tool]");
  if (!root) return;

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var el = {
    url: document.getElementById("t-url"),
    title: document.getElementById("t-title"),
    desc: document.getElementById("t-desc"),
    urlShown: document.getElementById("t-url-display"),
    titleShown: document.getElementById("t-title-shown"),
    descShown: document.getElementById("t-desc-shown"),
    titleChars: document.getElementById("t-title-chars"),
    titleWidth: document.getElementById("t-title-width"),
    titleBar: document.getElementById("t-title-bar"),
    titleNote: document.getElementById("t-title-note"),
    descChars: document.getElementById("t-desc-chars"),
    descWidth: document.getElementById("t-desc-width"),
    descBar: document.getElementById("t-desc-bar"),
    descNote: document.getElementById("t-desc-note")
  };

  function measure(text, font) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  function truncate(text, font, limit) {
    if (measure(text, font) <= limit) return text;
    var ellipsis = "…";
    var budget = limit - measure(ellipsis, font);
    var lo = 0;
    var hi = text.length;
    while (lo < hi) {
      var mid = Math.ceil((lo + hi) / 2);
      if (measure(text.slice(0, mid), font) <= budget) lo = mid;
      else hi = mid - 1;
    }
    var cut = text.slice(0, lo);
    var space = cut.lastIndexOf(" ");
    if (space > 0) cut = cut.slice(0, space);
    return cut.replace(/[\s–—\-,.;:]+$/, "") + ellipsis;
  }

  function formatUrl(value) {
    var raw = (value || "").trim();
    if (!raw) return "";
    if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
    try {
      var u = new URL(raw);
      var host = u.hostname.replace(/^www\./i, "");
      var parts = u.pathname.split("/").filter(Boolean).map(function (p) {
        return decodeURIComponent(p).replace(/[-_]+/g, " ");
      });
      return [host].concat(parts).join(" › ");
    } catch (err) {
      return raw;
    }
  }

  function applyMeter(width, limit, barEl, widthEl, noteEl, label) {
    var pct = Math.min(100, Math.round((width / limit) * 100));
    barEl.style.width = pct + "%";
    widthEl.textContent = Math.round(width) + " / " + limit + " px";

    var over = width > limit;
    var near = !over && width > limit * 0.9;
    barEl.classList.toggle("is-over", over);
    barEl.classList.toggle("is-near", near);
    noteEl.classList.toggle("is-over", over);
    noteEl.classList.toggle("is-near", near);

    if (over) {
      noteEl.textContent =
        Math.round(width - limit) + " px over — Google will cut this " + label + ".";
    } else if (near) {
      noteEl.textContent =
        Math.round(limit - width) + " px left. Close enough that a rendering difference could push it over.";
    } else {
      noteEl.textContent = Math.round(limit - width) + " px to spare.";
    }
  }

  function update() {
    var title = el.title.value;
    var desc = el.desc.value.replace(/\s+/g, " ").trim();

    var titleWidth = measure(title, TITLE_FONT);
    var descWidth = measure(desc, DESC_FONT);

    el.titleChars.textContent =
      title.length + (title.length === 1 ? " character" : " characters");
    el.descChars.textContent =
      desc.length + (desc.length === 1 ? " character" : " characters");

    applyMeter(titleWidth, TITLE_LIMIT, el.titleBar, el.titleWidth, el.titleNote, "title");
    applyMeter(descWidth, DESC_LIMIT, el.descBar, el.descWidth, el.descNote, "description");

    el.urlShown.textContent = formatUrl(el.url.value);
    el.titleShown.textContent = truncate(title, TITLE_FONT, TITLE_LIMIT);
    el.descShown.textContent = truncate(desc, DESC_FONT, DESC_LIMIT);
  }

  ["input", "change"].forEach(function (evt) {
    el.url.addEventListener(evt, update);
    el.title.addEventListener(evt, update);
    el.desc.addEventListener(evt, update);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(update);
  }
  update();
})();
