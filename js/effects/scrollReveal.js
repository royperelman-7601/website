// Scroll reveal (agent B). Adds .is-in once to each [data-reveal] when it enters the viewport,
// with a small stagger for elements revealed in the same batch. Also toggles .is-scrolled on [data-nav].
const STAGGER_MS = 80;
const MAX_DELAY_MS = 240;

export function initScrollReveal(root, env) {
  initNav(root);

  const items = Array.from(root.querySelectorAll("[data-reveal]"));
  if (!items.length) return;

  if (env.reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      visible.forEach((en, i) => {
        const el = en.target;
        io.unobserve(el);
        const delay = Math.min(i * STAGGER_MS, MAX_DELAY_MS);
        if (delay) {
          el.style.transitionDelay = `${delay}ms`;
          // Clear the delay afterwards so later transitions (hover, tilt) are not delayed.
          window.setTimeout(() => { el.style.transitionDelay = ""; }, delay + 1000);
        }
        el.classList.add("is-in");
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((el) => io.observe(el));
}

function initNav(root) {
  const nav = root.querySelector("[data-nav]");
  if (!nav) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}
