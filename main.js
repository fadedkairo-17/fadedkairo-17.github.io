(function () {
  "use strict";

  var S = window.SITE || {};
  var untitled = S.untitled || {};
  var combo = S.combo || {};

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ── Name, handle, year ──────────────────────────────
  $$("[data-site]").forEach(function (el) {
    var value = S[el.getAttribute("data-site")];
    if (value) el.textContent = value;
  });
  if (S.name) document.title = S.name + " — Developer";
  $("#year").textContent = new Date().getFullYear();

  // ── Links: anything left blank in config.js is hidden ─
  var links = {
    "github": S.github ? "https://github.com/" + S.github : "",
    "contact": S.contact || "",
    "untitled-video": untitled.videoId ? "https://www.youtube.com/watch?v=" + untitled.videoId : "",
    "untitled-site": untitled.site || "",
    "combo-download": combo.download || "",
    "combo-discord": combo.discord || ""
  };
  var labels = {
    "github": S.github ? "github.com/" + S.github : "",
    "contact": (S.contact || "").replace(/^https?:\/\//, "").replace(/\/$/, "")
  };

  $$("[data-link]").forEach(function (el) {
    var url = links[el.getAttribute("data-link")];
    if (url) {
      el.href = url;
    } else {
      (el.parentElement.tagName === "LI" ? el.parentElement : el).hidden = true;
    }
  });
  $$("[data-link-label]").forEach(function (el) {
    var text = labels[el.getAttribute("data-link-label")];
    if (text) el.textContent = text;
  });

  var cta = $("#combo-cta");
  if (cta && !$$("a:not([hidden])", cta).length) cta.hidden = true;

  // ── Untitled video: swap the screenshot for the player on click ─
  var play = $("#untitled-play");
  var media = $("#untitled-media");
  if (play && media && untitled.videoId) {
    play.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + untitled.videoId + "?autoplay=1&rel=0";
      frame.title = "Untitled Menu showcase";
      frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      media.classList.add("is-playing");
      media.replaceChildren(frame);
    });
  } else if (play) {
    play.hidden = true;
  }

  // ── Combo Client: lead image, gallery, viewer ───────
  var shots = [];

  var leadImg = $("#combo-lead");
  if (leadImg) {
    var lead = combo.lead || {};
    if (lead.src) leadImg.src = lead.src;
    if (lead.alt) leadImg.alt = lead.alt;
    if (lead.caption) $("#combo-lead-caption").textContent = lead.caption;
    shots.push({ src: leadImg.getAttribute("src"), alt: leadImg.alt, caption: $("#combo-lead-caption").textContent });
  }

  var gallery = $("#combo-gallery");
  (combo.gallery || []).forEach(function (item) {
    var index = shots.push(item) - 1;

    var figure = document.createElement("figure");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "shot";
    button.setAttribute("data-shot", index);
    button.setAttribute("aria-label", "Open image: " + (item.caption || ""));

    var img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = "lazy";
    if (item.focus) img.style.objectPosition = item.focus;

    button.appendChild(img);
    figure.appendChild(button);
    if (item.caption) {
      var caption = document.createElement("figcaption");
      caption.textContent = item.caption;
      figure.appendChild(caption);
    }
    gallery.appendChild(figure);
  });

  var box = $("#lightbox");
  var boxImg = $("#lightbox-img");
  var current = 0;

  function show(index) {
    current = (index + shots.length) % shots.length;
    var shot = shots[current];
    boxImg.src = shot.src;
    boxImg.alt = shot.alt || "";
    $("#lightbox-caption").textContent = shot.caption || "";
    $("#lightbox-count").textContent = (current + 1) + " / " + shots.length;
  }

  if (box && typeof box.showModal === "function") {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-shot]");
      if (!trigger) return;
      show(Number(trigger.getAttribute("data-shot")));
      box.showModal();
    });
    $("#lightbox-close").addEventListener("click", function () { box.close(); });
    $("#lightbox-prev").addEventListener("click", function () { show(current - 1); });
    $("#lightbox-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (event) { if (event.target === box) box.close(); });
    box.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") show(current - 1);
      if (event.key === "ArrowRight") show(current + 1);
    });
  }
})();
