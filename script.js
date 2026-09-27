(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Storm banner dismiss ---------- */
  var banner = document.getElementById("stormBanner");
  var bannerClose = document.getElementById("stormClose");
  var BANNER_KEY = "copperline-storm-dismissed";

  try {
    if (banner && localStorage.getItem(BANNER_KEY)) {
      banner.classList.add("is-hidden");
    }
  } catch (e) { /* localStorage unavailable, ignore */ }

  if (bannerClose && banner) {
    bannerClose.addEventListener("click", function () {
      banner.classList.add("is-hidden");
      try { localStorage.setItem(BANNER_KEY, "1"); } catch (e) {}
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Sticky header shrink on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var lastScroll = 0;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.style.boxShadow = y > 12 ? "0 8px 24px -12px rgba(0,0,0,0.5)" : "none";
    }
    lastScroll = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  var revealTargets = document.querySelectorAll(
    ".service-card, .course-row, .work-card, .reveal"
  );

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated stat counters ---------- */
  var statNums = document.querySelectorAll(".stat-num");

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && statNums.length) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNums.forEach(function (el) { statObserver.observe(el); });
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------- Review carousel dots ---------- */
  var track = document.getElementById("reviewTrack");
  var dotsWrap = document.getElementById("reviewDots");

  if (track && dotsWrap) {
    var cards = track.querySelectorAll(".review-card");
    cards.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Go to review " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () {
        var card = cards[i];
        track.scrollTo({ left: card.offsetLeft - 8, behavior: "smooth" });
      });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll("button");
    var scrollTimeout;
    track.addEventListener(
      "scroll",
      function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function () {
          var closestIndex = 0;
          var closestDist = Infinity;
          cards.forEach(function (card, i) {
            var dist = Math.abs(card.offsetLeft - track.scrollLeft);
            if (dist < closestDist) { closestDist = dist; closestIndex = i; }
          });
          dots.forEach(function (d, i) {
            d.classList.toggle("is-active", i === closestIndex);
          });
        }, 100);
      },
      { passive: true }
    );
  }

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");

  function validateField(field) {
    var wrap = field.closest(".field");
    if (!wrap) return true;
    var valid = field.checkValidity();
    wrap.classList.toggle("has-error", !valid);
    return valid;
  }

  if (form) {
    var requiredFields = form.querySelectorAll("[required]");

    requiredFields.forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
      field.addEventListener("input", function () {
        if (field.closest(".field").classList.contains("has-error")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = true;
      requiredFields.forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        if (formNote) {
          formNote.textContent = "Please fill in the highlighted fields.";
          formNote.style.color = "#E19A7C";
        }
        return;
      }

      var submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.textContent = "Sending…";
        submitBtn.disabled = true;
      }

      // Simulated submission — replace with a real endpoint when deploying.
      setTimeout(function () {
        if (formNote) {
          formNote.textContent = "Thanks — a crew lead will call you within one business day.";
          formNote.style.color = "#8FBFAE";
        }
        form.reset();
        if (submitBtn) {
          submitBtn.textContent = "Request my quote";
          submitBtn.disabled = false;
        }
      }, 900);
    });
  }
})();