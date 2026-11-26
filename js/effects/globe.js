// Hero 3D globe (ported from demo/effects-demo.html, "Demo 1", approved as is).
// three.js is loaded lazily from the CDN only once the page is idle, so the text renders first.
// Fallback: when WebGL or the import is unavailable, `.no-webgl` is added to the hero (static CSS glow).
const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";

const R = 2; // globe radius
const CITIES = [[32, 34.8], [40.7, -74], [51.5, -0.1], [50.1, 8.7], [1.3, 103.8], [35.7, 139.7], [-33.9, 151.2], [37.8, -122.4], [19, 72.8], [-23.5, -46.6], [59.3, 18], [25.2, 55.3]];
const PAIRS = [[0, 2], [0, 3], [0, 11], [2, 1], [3, 10], [1, 7], [4, 5], [4, 8], [5, 6], [7, 5], [1, 9], [11, 8], [0, 4]];

let started = false; // guards against a second init creating a second render loop

function whenIdle() {
  return new Promise((resolve) => {
    const go = () => (window.requestIdleCallback ? requestIdleCallback(() => resolve(), { timeout: 2000 }) : setTimeout(resolve, 200));
    if (document.readyState === "complete") go();
    else addEventListener("load", go, { once: true });
  });
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

export async function initGlobe(canvas, env) {
  if (!canvas || started) return;
  started = true;
  const hero = canvas.closest(".hero");
  const fallback = (err) => {
    hero?.classList.add("no-webgl");
    if (err) console.warn("[globe] 3D disabled, using static fallback", err);
  };

  if (!hasWebGL()) return fallback();
  await whenIdle();

  let THREE, renderer;
  try {
    THREE = await import(THREE_URL);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !env.isMobile, alpha: true, powerPreference: "low-power" });
  } catch (err) {
    return fallback(err);
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, env.isMobile ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6.5);
  const globe = new THREE.Group();
  scene.add(globe);
  const ACCENT = new THREE.Color("#2dd4bf");

  // Dots on the sphere (fibonacci distribution)
  const N = env.isMobile ? 1200 : 2600;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    pos.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3);
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  globe.add(new THREE.Points(dotsGeo, new THREE.PointsMaterial({ color: 0x5eead4, size: 0.022, transparent: true, opacity: 0.55 })));

  // Inner glow sphere
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x062a27, transparent: true, opacity: 0.6 })));

  // "Server" nodes with halos (geometries shared between all nodes)
  const toVec = (lat, lon) => {
    const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th));
  };
  const nodes = CITIES.map(([a, b]) => toVec(a, b));
  const nodeGeo = new THREE.SphereGeometry(0.035, 12, 12);
  const haloGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: ACCENT });
  const haloMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.25 });
  nodes.forEach((v) => {
    const m = new THREE.Mesh(nodeGeo, nodeMat); m.position.copy(v); globe.add(m);
    const h = new THREE.Mesh(haloGeo, haloMat); h.position.copy(v); globe.add(h);
  });

  // Arcs between nodes, each with a travelling pulse
  const pulses = [];
  const arcMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.35 });
  const pulseGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  PAIRS.forEach(([a, b], i) => {
    const s = nodes[a], e = nodes[b];
    const mid = s.clone().add(e).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(R + s.distanceTo(e) * 0.45); // lift the arc above the surface
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), arcMat));
    const p = new THREE.Mesh(pulseGeo, pulseMat);
    globe.add(p);
    pulses.push({ curve, p, t: (i * 0.17) % 1, speed: 0.12 + (i % 4) * 0.03 });
  });
  pulses.forEach((o) => o.p.position.copy(o.curve.getPoint(o.t)));

  globe.rotation.set(0.35, -1.2, 0);

  const render = () => renderer.render(scene, camera);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Globe sits on the right on desktop. On narrow/portrait screens, pull the camera back so the
    // whole globe fits the width, and lift it into the upper part (content sits at the bottom).
    const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
    if (w > 720) {
      camera.position.z = 6.5;
      globe.position.set(1.8, 0, 0);
    } else {
      const z = Math.max(6.5, (R * 1.15) / (tanHalf * camera.aspect));
      camera.position.z = z;
      globe.position.set(0, tanHalf * z * 0.38, 0);
    }
    camera.updateProjectionMatrix();
  }
  resize();

  let resizeTimer = 0;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (env.reducedMotion) render(); }, 150);
  });

  // Reduced motion: one static frame, no loop, no pointer tracking.
  if (env.reducedMotion) {
    render();
    canvas.classList.add("is-ready");
    return;
  }

  let mx = 0, my = 0;
  addEventListener("pointermove", (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  // Single rAF loop, running only while the hero is in view and the tab is visible.
  const clock = new THREE.Clock();
  let rafId = 0, inView = true, lost = false;
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.1); // clamp so a resume doesn't jump
    globe.rotation.y += dt * 0.08 + mx * 0.6 * dt;
    globe.rotation.x += ((0.35 + my * 0.5) - globe.rotation.x) * 0.04;
    pulses.forEach((o) => { o.t = (o.t + dt * o.speed) % 1; o.p.position.copy(o.curve.getPoint(o.t)); });
    render();
    rafId = requestAnimationFrame(tick);
  }
  function update() {
    const shouldRun = inView && !lost && !document.hidden;
    if (shouldRun && !rafId) { clock.getDelta(); rafId = requestAnimationFrame(tick); }
    else if (!shouldRun && rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); }).observe(hero || canvas);
  }
  document.addEventListener("visibilitychange", update);
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; update(); });
  canvas.addEventListener("webglcontextrestored", () => { lost = false; update(); });

  render();
  canvas.classList.add("is-ready");
  update();
}
