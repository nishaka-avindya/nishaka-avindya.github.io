(function(){
  "use strict";

  var STORAGE_KEY = "consentChoice";
  var GEO_ENDPOINT = "https://ipapi.co/json/";

  var REGULATED_COUNTRIES = [
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

  function storedChoice(){
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === "granted" || v === "denied" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function storeChoice(value){
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function injectStyles(){
    var css = ""
      + ".consent-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;"
      + "background:#fffdf9;border-top:1px solid #e6e0d4;padding:16px 20px;"
      + "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"
      + "display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;"
      + "box-shadow:0 -1px 6px rgba(28,27,25,.08);}"
      + ".consent-bar p{margin:0;font-size:13.5px;color:#1c1b19;max-width:640px;line-height:1.45;}"
      + ".consent-bar a{color:#1f6f5c;text-decoration:underline;}"
      + ".consent-actions{display:flex;gap:8px;flex-shrink:0;}"
      + ".consent-actions button{font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;"
      + "border-radius:6px;padding:9px 16px;border:1px solid transparent;}"
      + ".consent-accept{background:#1f6f5c;color:#fff;}"
      + ".consent-reject{background:transparent;color:#1c1b19;border-color:#e6e0d4;}"
      + "@media (max-width:520px){.consent-bar{flex-direction:column;align-items:stretch;}"
      + ".consent-actions{justify-content:flex-end;}}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showBanner(){
    injectStyles();
    var bar = document.createElement("div");
    bar.className = "consent-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Cookie consent");
    bar.innerHTML =
      "<p>This site uses analytics cookies to understand traffic. "
      + "See how in the <a href=\"/about/\">about page</a>.</p>"
      + "<div class=\"consent-actions\">"
      + "<button type=\"button\" class=\"consent-reject\">Decline</button>"
      + "<button type=\"button\" class=\"consent-accept\">Accept</button>"
      + "</div>";
    document.body.appendChild(bar);

    bar.querySelector(".consent-accept").addEventListener("click", function(){
      gtagUpdate(true);
      storeChoice("granted");
      bar.remove();
    });
    bar.querySelector(".consent-reject").addEventListener("click", function(){
      gtagUpdate(false);
      storeChoice("denied");
      bar.remove();
    });
  }

  function init(){
    var existing = storedChoice();
    if (existing) {
      gtagUpdate(existing === "granted");
      return;
    }

    fetch(GEO_ENDPOINT, { cache: "no-store" })
      .then(function(res){
        if (!res.ok) throw new Error("geo lookup failed");
        return res.json();
      })
      .then(function(data){
        var country = data && data.country_code;
        if (country && REGULATED_COUNTRIES.indexOf(country) === -1) {
          gtagUpdate(true);
        } else {
          showBanner();
        }
      })
      .catch(function(){
        showBanner();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
