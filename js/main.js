// Entry point: starts every effect. Each effect is isolated, so one failure never breaks the others.
// To add a new effect: create js/effects/<name>.js exporting an init function, then add it to the list below.
import { initWordReveal } from "./effects/wordReveal.js";
import { initScrollReveal } from "./effects/scrollReveal.js";
import { initTilt } from "./effects/tilt.js";
import { initContact } from "./effects/contact.js";
import { initTerminal } from "./effects/terminal.js";
import { initGlobe } from "./effects/globe.js";

document.documentElement.classList.add("js");

const env = Object.freeze({
  reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  isMobile: matchMedia("(max-width: 720px)").matches,
  canHover: matchMedia("(hover: hover) and (pointer: fine)").matches,
});

const effects = [
  ["wordReveal", () => initWordReveal(document, env)],
  ["scrollReveal", () => initScrollReveal(document, env)],
  ["tilt", () => initTilt(document, env)],
  ["contact", () => initContact(document, env)],
  ["terminal", () => initTerminal(document, env)],
  // Globe last: it lazy-loads three.js from the CDN after the content is on screen.
  ["globe", () => initGlobe(document.querySelector("[data-globe]"), env)],
];

for (const [name, start] of effects) {
  try {
    const result = start();
    if (result && typeof result.catch === "function") {
      result.catch((err) => console.warn(`[effect:${name}] failed`, err));
    }
  } catch (err) {
    console.warn(`[effect:${name}] failed`, err);
  }
}
