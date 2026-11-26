// Word-by-word slide-up reveal for [data-word-reveal] elements (ported from the demo's `.rise`).
// Each word becomes <span class="wr-word"><span>word</span></span>; the inner span slides up
// out of the mask. Stagger is 90ms per word, starting at data-delay (ms).
// Accessibility: the visible word spans are aria-hidden and the original text is kept once in a
// visually hidden span, so screen readers read the sentence normally (aria-label alone is ignored
// on <p> elements by most screen readers, so a hidden text copy is the reliable option).
const STAGGER_MS = 90;

export function initWordReveal(root, env) {
  if (!root || env.reducedMotion) return;

  root.querySelectorAll("[data-word-reveal]").forEach((el) => {
    if (el.dataset.wordRevealDone) return; // never split twice
    const text = el.textContent.trim().replace(/\s+/g, " ");
    if (!text) return;
    const base = Number(el.dataset.delay) || 0;

    const srText = document.createElement("span");
    srText.className = "sr-only";
    srText.textContent = text;

    const visual = document.createElement("span");
    visual.className = "wr-line";
    visual.setAttribute("aria-hidden", "true");

    text.split(" ").forEach((word, i) => {
      const mask = document.createElement("span");
      mask.className = "wr-word";
      const inner = document.createElement("span");
      inner.textContent = word;
      inner.style.animationDelay = `${base + i * STAGGER_MS}ms`;
      mask.append(inner);
      if (i > 0) visual.append(document.createTextNode(" "));
      visual.append(mask);
    });

    el.replaceChildren(srText, visual);
    el.classList.add("is-word-reveal");
    el.dataset.wordRevealDone = "1";
  });
}
