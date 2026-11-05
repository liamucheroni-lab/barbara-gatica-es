(function () {
  "use strict";

  /* ---------- mobile menu ---------- */
  var menuToggleBtn = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  function setMenu(open) {
    mobileMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    if (menuToggleBtn) {
      menuToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggleBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }
  }
  function closeMenu() { setMenu(false); }
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("is-open"));
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });
  Array.prototype.forEach.call(document.querySelectorAll(".mobile-menu__link"), function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- scroll progress bar + hero parallax ---------- */
  var bar = document.getElementById("bg-progress");
  var heroLayer = document.getElementById("bg-hero-layer");
  var heroTitle = document.getElementById("bg-hero-title");
  var raf = null;

  function applyScroll() {
    raf = null;
    var y = window.scrollY || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (bar) bar.style.transform = "scaleX(" + Math.min(1, y / max) + ")";
    if (heroLayer) heroLayer.style.transform = "translate3d(0," + (y * 0.16) + "px,0)";
    if (heroTitle) {
      heroTitle.style.transform = "translate3d(0," + (y * -0.05) + "px,0)";
      heroTitle.style.opacity = String(Math.max(0.15, 1 - y / 900));
    }
  }
  window.addEventListener("scroll", function () {
    if (raf) return;
    raf = requestAnimationFrame(applyScroll);
  }, { passive: true });
  applyScroll();

  /* ---------- reveal on scroll ---------- */
  (function setupReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    els.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(34px)";
      el.style.transition = "opacity .75s ease, transform .85s cubic-bezier(.2,.7,.2,1)";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var d = Number(el.getAttribute("data-reveal")) || 0;
        el.style.transitionDelay = (d * 110) + "ms";
        el.style.opacity = "1";
        el.style.transform = "none";
        io.unobserve(el);
        // terminada a entrada, devolve o elemento ao CSS: os estilos inline
        // ficariam por cima das transições e transforms de hover da folha
        setTimeout(function () {
          el.style.transition = "";
          el.style.transitionDelay = "";
          el.style.transform = "";
          el.style.opacity = "";
        }, d * 110 + 950);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- timeline carousel (desktop/tablet) ---------- */
  (function setupTimeline() {
    var track = document.getElementById("timeline");
    var prev = document.getElementById("tl-prev");
    var next = document.getElementById("tl-next");
    var controls = document.querySelector(".tl-controls");
    if (!track || !prev || !next || !controls) return;
    var items = Array.prototype.slice.call(track.querySelectorAll(".row-timeline"));
    var index = 0;

    function render() {
      // no celular as setas somem e a linha vira vertical: nada a deslocar
      if (getComputedStyle(controls).display === "none") {
        track.style.transform = "";
        items.forEach(function (it) { it.classList.remove("is-dim"); });
        return;
      }
      var visible = parseInt(getComputedStyle(track).getPropertyValue("--tl-visible"), 10) || 3;
      var max = Math.max(0, items.length - visible);
      index = Math.min(Math.max(index, 0), max);
      // a distância entre duas datas já inclui o espaço entre elas
      var step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 0;
      track.style.transform = "translateX(" + (-index * step) + "px)";
      items.forEach(function (it, i) { it.classList.toggle("is-dim", i < index || i >= index + visible); });
      prev.disabled = index === 0;
      next.disabled = index >= max;
    }

    prev.addEventListener("click", function () { index -= 1; render(); });
    next.addEventListener("click", function () { index += 1; render(); });
    window.addEventListener("resize", render);
    render();
  })();

  /* ---------- footer year ---------- */
  var footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* ---------- YouTube facade on the documentary still ---------- */
  // Fotos, textos e links já chegam prontos do servidor (api/midiakit.js);
  // aqui só o vídeo, que entra no lugar da foto ao clicar no play.
  var docPlay = document.getElementById("doc-play");

  function extractYoutubeId(value) {
    if (!value) return null;
    var v = String(value).trim();
    var m =
      v.match(/^[a-zA-Z0-9_-]{11}$/) ||
      v.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
      v.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
      v.match(/youtube\.com\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/);
    if (!m) return null;
    return m[1] || m[0];
  }

  if (docPlay) {
    var youtubeId = extractYoutubeId(docPlay.getAttribute("data-youtube"));
    if (!youtubeId) docPlay.setAttribute("aria-disabled", "true");
    docPlay.addEventListener("click", function (e) {
      e.preventDefault();
      if (!youtubeId || docPlay.classList.contains("is-playing")) return;
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + youtubeId + "?autoplay=1&rel=0";
      iframe.title = "Vídeo de Barbara Gatica";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      docPlay.appendChild(iframe);
      docPlay.classList.add("is-playing");
    });
  }
})();
