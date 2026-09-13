(function () {
  "use strict";

  var btn = document.getElementById("theme-toggle");
  if (!btn) return;

  var root = document.documentElement;

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    btn.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }

  apply(current());

  btn.addEventListener("click", function () {
    apply(current() === "dark" ? "light" : "dark");
  });
})();
