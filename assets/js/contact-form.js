(function () {
  var form = document.querySelector(".contact-form");
  if (!form || !window.fetch) return;

  var next = form.querySelector('input[name="_next"]');
  var target = next && next.value ? next.value : "/";
  var button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", function (event) {
    if (!form.checkValidity()) return;
    event.preventDefault();

    if (button) {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
    }

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (!response.ok) throw new Error("submit failed");
        form.reset();
        window.location.replace(target);
      })
      .catch(function () {
        if (button) {
          button.disabled = false;
          button.removeAttribute("aria-busy");
        }
        form.submit();
      });
  });
})();
