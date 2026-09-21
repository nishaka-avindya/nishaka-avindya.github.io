(function(){
  "use strict";

  var CHOICE_KEY = "consentChoice";
  var COUNTRY_KEY = "consentCountry";
  var GEO_ENDPOINT = "https://ipapi.co/json/";

  var OPT_IN_COUNTRIES = [
    "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
    "IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
    "IS","LI","NO",
    "GB","CH","BR"
  ];

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
      + ".consent-bar a{color:#1f6f5c;text-decoration:underline;}"
      + ".consent-actions{display:flex;gap:8px;flex-shrink:0;}"
      + ".consent-actions button{font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;"
      + "border-radius:6px;padding:10px 18px;border:1px solid transparent;white-space:nowrap;}"
      + ".consent-accept{background:#1f6f5c;color:#fff;}"
      + ".consent-reject{background:transparent;color:#1c1b19;border-color:#e6e0d4;}"
      + ".consent-close{position:absolute;top:14px;right:16px;background:none;border:none;"
      + "cursor:pointer;font-size:18px;line-height:1;color:#4a473f;padding:4px;}"
      + "@media (max-width:520px){.consent-bar{flex-direction:column;align-items:stretch;"
      + "padding:20px 44px 20px 20px;}.consent-actions{justify-content:flex-end;}}"
      + ".privacy-choices-link{position:fixed;left:12px;bottom:12px;z-index:9998;"
      + "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"
      + "font-size:12px;color:#4a473f;background:#fffdf9;border:1px solid #e6e0d4;"
      + "border-radius:100px;padding:6px 12px;text-decoration:underline;cursor:pointer;}"
      + ".privacy-choices-panel{position:fixed;left:12px;bottom:48px;z-index:9999;"
      + "background:#fffdf9;border:1px solid #e6e0d4;border-radius:10px;padding:16px;"
      + "max-width:280px;box-shadow:0 1px 6px rgba(28,27,25,.1);"
      + "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}"
      + ".privacy-choices-panel p{margin:0 0 10px;font-size:12.5px;color:#1c1b19;line-height:1.45;}"
      + ".privacy-choices-panel button{font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;"
      + "border-radius:6px;padding:7px 12px;border:1px solid #e6e0d4;background:#faf7f2;width:100%;}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showOptInBanner(){
    var bar = document.createElement("div");
    bar.className = "consent-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Cookie consent");
    bar.innerHTML =
      "<button type=\"button\" class=\"consent-close\" aria-label=\"Close\">&times;</button>"
      + "<div>"
      + "<h2>This website uses cookies</h2>"
      + "<p>Used only for analytics, to understand traffic. See how in the "
      + "<a href=\"/about/\">about page</a>.</p>"
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

  function showOptOutLink(){
    var link = document.createElement("button");
    link.type = "button";
    link.className = "privacy-choices-link";
    link.textContent = "Your Privacy Choices";
    document.body.appendChild(link);

    link.addEventListener("click", function(){
      var existingPanel = document.querySelector(".privacy-choices-panel");
      if (existingPanel) { existingPanel.remove(); return; }

      var currentlyGranted = getStored(CHOICE_KEY) !== "denied";
      var panel = document.createElement("div");
      panel.className = "privacy-choices-panel";
      panel.innerHTML =
        "<p>This site uses analytics cookies. You can opt out of the sale/sharing "
        + "of your data for analytics at any time.</p>"
        + "<button type=\"button\">" + (currentlyGranted ? "Opt out of analytics" : "Opt back in") + "</button>";
      document.body.appendChild(panel);

      panel.querySelector("button").addEventListener("click", function(){
        var nowGranted = getStored(CHOICE_KEY) === "denied";
        gtagUpdate(nowGranted);
        setStored(CHOICE_KEY, nowGranted ? "granted" : "denied");
        panel.remove();
      });
    });
  }

  function handleCountry(country){
    setStored(COUNTRY_KEY, country || "");

    if (country && OPT_IN_COUNTRIES.indexOf(country) !== -1) {
      // GDPR / UK-GDPR / Swiss FADP / LGPD style: opt-in, blocked until consent.
      showOptInBanner();
      return;
    }

    // Everyone else (including US): opt-out model, or no specific regime.
    // Analytics is allowed by default; US visitors get a persistent,
    // always-available opt-out control per CCPA/CPRA-style "Do Not Sell
    // or Share" requirements. This applies to all US visitors, not a
    // curated state list, since state privacy laws are added often and
    // a stale list would under-cover new states.
    gtagUpdate(true);
    if (country === "US") {
      showOptOutLink();
    }
  }

  function init(){
    injectStyles();

    // Global Privacy Control: a recognized, binding opt-out signal
    // (CCPA/CPRA and several other US states). Honor it immediately,
    // wherever the visitor is, no banner needed either way.
    if (hasGPC()) {
      gtagUpdate(false);
      setStored(CHOICE_KEY, "denied");
      return;
    }

    var existingChoice = getStored(CHOICE_KEY);
    var cachedCountry = getStored(COUNTRY_KEY);

    if (existingChoice) {
      gtagUpdate(existingChoice === "granted");
      if (cachedCountry === "US") showOptOutLink();
      return;
    }

    if (cachedCountry) {
      handleCountry(cachedCountry);
      return;
    }

    fetch(GEO_ENDPOINT, { cache: "no-store" })
      .then(function(res){
        if (!res.ok) throw new Error("geo lookup failed");
        return res.json();
      })
      .then(function(data){
        handleCountry(data && data.country_code);
      })
      .catch(function(){
        // Fail safe: treat unknown location as opt-in-required.
        showOptInBanner();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
