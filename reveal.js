/*
  Text coming in as you reach it, every time you reach it.
  Headings roll in letter by letter (or word by word when they are long),
  everything else just fades up. The hidden starting state only applies when
  the <html> tag has the "js" class, so the page still reads with scripts off.
*/
(function () {
  "use strict";

  var root = document.documentElement;

  var WAVES = "h1, .project-head h3, .tagline, .about-lede";
  var BLOCKS = ".eyebrow, .intro, .index li, .section-head, .project-head .num, " +
    ".project-head .kind, .project-text > *, .project-media, .lead, .pitch-side, " +
    ".inside, .gallery figure, .about-more, .contact li";

  // Rebuild a heading as spans so each letter (or word) can move on its own.
  // A hidden copy of the plain text stays in place for screen readers.
  function split(el) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    var byLetter = text.length <= 40;
    var words = text.split(" ");
    var index = 0;

    var plain = document.createElement("span");
    plain.className = "sr-only";
    plain.textContent = text;

    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");

    words.forEach(function (word, w) {
      var wordEl = document.createElement("span");
      wordEl.className = "w";
      if (byLetter) {
        word.split("").forEach(function (letter) {
          var ch = document.createElement("span");
          ch.className = "ch";
          ch.style.setProperty("--i", index++);
          ch.textContent = letter;
          wordEl.appendChild(ch);
        });
        index++; // the space takes a beat too
      } else {
        wordEl.className = "w ch";
        wordEl.style.setProperty("--i", index++);
        wordEl.textContent = word;
      }
      shown.appendChild(wordEl);
      if (w < words.length - 1) shown.appendChild(document.createTextNode(" "));
    });

    el.textContent = "";
    el.appendChild(plain);
    el.appendChild(shown);
    el.classList.add("wave");
    el.style.setProperty("--step", byLetter ? "32ms" : "60ms");
  }

  try {
    if (!("IntersectionObserver" in window)) {
      root.classList.remove("js");
      return;
    }

    var waves = Array.prototype.slice.call(document.querySelectorAll(WAVES));
    var blocks = Array.prototype.slice.call(document.querySelectorAll(BLOCKS));
    waves.forEach(split);
    blocks.forEach(function (el) { el.setAttribute("data-reveal", ""); });

    // Coming in: play once a bit of the element is on screen.
    var arriving = new IntersectionObserver(function (entries) {
      var order = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.target.classList.contains("is-in")) return;
        // things that arrive together come in one after another
        entry.target.style.setProperty("--d", (order++ * 70) + "ms");
        entry.target.classList.add("is-in");
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    // Going out: reset only once the element is completely off screen, so it
    // never blinks out while you can still see it, and plays again next time.
    var leaving = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) entry.target.classList.remove("is-in");
      });
    }, { threshold: 0 });

    waves.concat(blocks).forEach(function (el) {
      arriving.observe(el);
      leaving.observe(el);
    });
  } catch (err) {
    root.classList.remove("js"); // never leave the page hidden
  }
})();
