// Contact helpers (agent B). Builds mailto links from data attributes so the address is not in the static HTML,
// and keeps the footer year current.
export function initContact(root, env) {
  root.querySelectorAll("a[data-email]").forEach((a) => {
    const user = a.dataset.user;
    const domain = a.dataset.domain;
    if (user && domain) a.href = `mailto:${user}@${domain}`;
  });

  const year = String(new Date().getFullYear());
  root.querySelectorAll("[data-year]").forEach((el) => { el.textContent = year; });
}
