// 3D tilt + cursor-following glow (agent B). Only for fine pointers with hover, and never under reduced motion.
const MAX_DEG = 7;

export function initTilt(root, env) {
  if (!env.canHover || env.reducedMotion) return;

  root.querySelectorAll("[data-tilt]").forEach((card) => {
    let frame = 0;
    let px = 0.5;
    let py = 0.5;

    const apply = () => {
      frame = 0;
      const rx = (0.5 - py) * 2 * MAX_DEG;
      const ry = (px - 0.5) * 2 * MAX_DEG;
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(6px)`;
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    };

    card.addEventListener("pointerenter", () => {
      card.style.transition = "transform .15s ease-out, box-shadow .3s ease, border-color .3s ease, opacity .8s ease";
    });

    card.addEventListener("pointermove", (e) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      px = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      py = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
      if (!frame) frame = requestAnimationFrame(apply);
    });

    card.addEventListener("pointerleave", () => {
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      card.style.transition = "transform .5s cubic-bezier(.2, .7, .2, 1), box-shadow .3s ease, border-color .3s ease, opacity .8s ease";
      card.style.transform = "";
    });
  });
}
