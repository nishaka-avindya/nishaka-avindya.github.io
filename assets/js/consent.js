(function(){
  "use strict";

  var CHOICE_KEY = "consentChoice";

  function gtagUpdate(granted){
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      "analytics_storage": granted ? "granted" : "denied"
    });
  }

  function hasGPC(){
    return navigator.globalPrivacyControl === true;
  }

  function getStored(key){
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function setStored(key, value){
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function injectStyles(){
    var css = ""
      + ".consent-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;"
      + "background:#fffdf9;border-top:1px solid #e6e0d4;padding:20px 56px 20px 24px;"
      + "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"
      + "display:flex;flex-wrap:wrap;gap:14px 24px;align-items:center;justify-content:space-between;"
      + "box-shadow:0 -1px 6px rgba(28,27,25,.08);}"
      + ".consent-bar h2{margin:0 0 4px;font-size:15px;font-weight:700;color:#1c1b19;}"
      + ".consent-bar p{margin:0;font-size:13.5px;color:#4a473f;max-width:620px;line-height:1.45;}"
      + ".consent-actions{display:flex;gap:8px;flex-shrink:0;}"
      + ".consent-actions button{font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;"
      + "border-radius:6px;padding:10px 18px;border:1px solid transparent;white-space:nowrap;}"
      + ".consent-accept{background:#1f6f5c;color:#fff;}"
      + ".consent-reject{background:transparent;color:#1c1b19;border-color:#e6e0d4;}"
      + ".consent-close{position:absolute;top:14px;right:16px;background:none;border:none;"
      + "cursor:pointer;font-size:18px;line-height:1;color:#4a473f;padding:4px;}"
      + "@media (max-width:520px){.consent-bar{flex-direction:column;align-items:stretch;"
      + "padding:20px 44px 20px 20px;}.consent-actions{justify-content:flex-end;}}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showBanner(){
    var bar = document.createElement("div");
    bar.className = "consent-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Cookie consent");
    bar.innerHTML =
      "<button type=\"button\" class=\"consent-close\" aria-label=\"Close\">&times;</button>"
      + "<div>"
      + "<h2>This website uses cookies</h2>"
      + "<p>Used only for analytics, to understand traffic and improve the website.</p>"
      + "</div>"
      + "<div class=\"consent-actions\">"
      + "<button type=\"button\" class=\"consent-reject\">Deny</button>"
      + "<button type=\"button\" class=\"consent-accept\">Allow</button>"
      + "</div>";
    document.body.appendChild(bar);

    function decide(granted){
      gtagUpdate(granted);
      setStored(CHOICE_KEY, granted ? "granted" : "denied");
      bar.remove();
    }

    bar.querySelector(".consent-accept").addEventListener("click", function(){ decide(true); });
    bar.querySelector(".consent-reject").addEventListener("click", function(){ decide(false); });
    // Closing without a choice defaults to the safe option: denied.
    bar.querySelector(".consent-close").addEventListener("click", function(){ decide(false); });
  }

  function init(){
    injectStyles();

    // Global Privacy Control: a recognized, binding opt-out signal.
    // Honor it immediately, no banner needed.
    if (hasGPC()) {
      gtagUpdate(false);
      setStored(CHOICE_KEY, "denied");
      return;
    }

    var existingChoice = getStored(CHOICE_KEY);
    if (existingChoice) {
      gtagUpdate(existingChoice === "granted");
      return;
    }

    showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
