// Terminal easter egg. The dialog is built here with createElement + textContent only:
// user input and command texts are never parsed as HTML.
import { PROMPT, TITLE, WELCOME, CONTACT_LINKS, commands, HIDDEN_COMMANDS, NOT_FOUND } from "../data/terminal.js";

const COMMAND_NAMES = Object.keys(commands);
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Append text to `parent`, turning **...** into <b> elements (textContent only).
function appendMarked(parent, text) {
  for (const part of text.split(/(\*\*[^*]+\*\*)/)) {
    if (!part) continue;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      parent.append(el("b", null, part.slice(2, -2)));
    } else {
      parent.append(document.createTextNode(part));
    }
  }
}

function isTypingTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])"));
}

export function initTerminal(root, env = {}) {
  const doc = root.ownerDocument || root;
  const body = doc.body;
  if (!body) return;

  // ---- Build DOM ----
  const overlay = el("div", "term-overlay");
  overlay.hidden = true;
  if (env.reducedMotion) overlay.classList.add("term-no-motion");

  const panel = el("div", "term-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "term-title");
  panel.tabIndex = -1; // clicks on non-focusable parts keep focus inside the dialog (so Esc still works)

  const bar = el("div", "term-bar");
  const dots = el("span", "term-dots");
  dots.setAttribute("aria-hidden", "true");
  for (const kind of ["red", "yellow", "green"]) dots.append(el("span", `term-dot term-dot-${kind}`));
  const title = el("h2", "term-title", TITLE);
  title.id = "term-title";
  const closeBtn = el("button", "term-close", "×");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close terminal");
  bar.append(dots, title, closeBtn);

  const log = el("div", "term-log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");
  log.setAttribute("aria-label", "Terminal output");
  log.tabIndex = 0;

  const form = el("form", "term-form");
  form.setAttribute("autocomplete", "off");
  const label = el("label", "term-ps");
  label.htmlFor = "term-input";
  const psText = el("span", null, PROMPT);
  psText.setAttribute("aria-hidden", "true");
  label.append(psText, el("span", "sr-only", "Terminal command"));
  const input = el("input", "term-input");
  input.id = "term-input";
  input.type = "text";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("enterkeyhint", "go");
  form.append(label, input);

  panel.append(bar, log, form);
  overlay.append(panel);
  body.append(overlay);

  // ---- Output ----
  function scrollToEnd() { log.scrollTop = log.scrollHeight; }

  function print(text) {
    const line = el("div", "term-out");
    appendMarked(line, text);
    log.append(line);
    scrollToEnd();
  }

  function echo(raw) {
    const line = el("div", "term-echo");
    line.append(el("span", "term-echo-ps", PROMPT + " "), document.createTextNode(raw));
    log.append(line);
  }

  function printLinks(links) {
    const block = el("div", "term-out");
    for (const link of links) {
      const row = el("div", "term-link-row");
      row.append(el("b", null, (link.name + ":").padEnd(10, " ")));
      const a = el("a", "term-link", link.label);
      a.href = typeof link.href === "function" ? link.href() : link.href;
      if (link.external) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      row.append(a);
      block.append(row);
    }
    log.append(block);
    scrollToEnd();
  }

  // ---- Commands ----
  const history = [];
  let historyIndex = 0;
  let draft = "";

  function run(rawInput) {
    const raw = rawInput.trim();
    echo(raw);
    if (raw) {
      if (history[history.length - 1] !== raw) history.push(raw);
    }
    historyIndex = history.length;
    draft = "";
    const cmd = raw.toLowerCase().replace(/\s+/g, " ");
    if (!cmd) { scrollToEnd(); return; }
    if (cmd === "clear") { log.replaceChildren(); return; }
    if (cmd === "exit") { close(); return; }
    if (Object.hasOwn(HIDDEN_COMMANDS, cmd)) { print(HIDDEN_COMMANDS[cmd]); return; }
    if (cmd === "contact") { printLinks(CONTACT_LINKS); return; }
    if (Object.hasOwn(commands, cmd) && typeof commands[cmd] === "string") { print(commands[cmd]); return; }
    const line = el("div", "term-out");
    line.append(document.createTextNode(NOT_FOUND.before + raw));
    appendMarked(line, NOT_FOUND.after);
    log.append(line);
    scrollToEnd();
  }

  function setInput(value) {
    input.value = value;
    const end = value.length;
    // Defer so the caret lands at the end after the browser's default arrow handling.
    requestAnimationFrame(() => input.setSelectionRange(end, end));
  }

  function complete() {
    const prefix = input.value.trim().toLowerCase();
    if (!prefix) return false;
    const matches = COMMAND_NAMES.filter((name) => name.startsWith(prefix));
    if (matches.length === 1) {
      setInput(matches[0]);
    } else if (matches.length > 1) {
      echo(input.value);
      print(matches.join("  "));
    }
    return true; // handled (even with no match), so focus stays in the input
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    run(value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      historyIndex = Math.max(0, historyIndex - 1);
      setInput(history[historyIndex]);
    } else if (e.key === "ArrowDown") {
      if (historyIndex >= history.length) return;
      e.preventDefault();
      historyIndex += 1;
      setInput(historyIndex === history.length ? draft : history[historyIndex]);
    } else if (e.key === "Tab" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      // With text typed, Tab completes; with an empty input it moves focus (handled by the trap).
      if (complete()) { e.preventDefault(); e.stopPropagation(); }
    }
  });

  // ---- Open / close ----
  let opener = null;
  let inerted = [];
  let savedOverflow = null;
  const vv = window.visualViewport;

  function fitToViewport() {
    // Keep the dialog above the on-screen keyboard (iOS / Android) by tracking the visual viewport.
    if (!vv) return;
    overlay.style.height = `${vv.height}px`;
    overlay.style.top = `${vv.offsetTop}px`;
  }

  function lockPage() {
    const scrollbar = window.innerWidth - doc.documentElement.clientWidth;
    savedOverflow = {
      htmlOverflow: doc.documentElement.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPadding: body.style.paddingRight,
    };
    doc.documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    inerted = [];
    for (const child of body.children) {
      if (child === overlay || child.inert) continue;
      child.inert = true;
      inerted.push(child);
    }
  }

  function unlockPage() {
    if (savedOverflow) {
      doc.documentElement.style.overflow = savedOverflow.htmlOverflow;
      body.style.overflow = savedOverflow.bodyOverflow;
      body.style.paddingRight = savedOverflow.bodyPadding;
      savedOverflow = null;
    }
    for (const child of inerted) child.inert = false;
    inerted = [];
  }

  function isOpen() { return !overlay.hidden; }

  function open(from) {
    if (isOpen()) return;
    opener = from instanceof HTMLElement ? from : doc.activeElement;
    lockPage();
    overlay.hidden = false;
    if (!log.childElementCount) print(WELCOME);
    fitToViewport();
    if (vv) {
      vv.addEventListener("resize", fitToViewport);
      vv.addEventListener("scroll", fitToViewport);
    }
    input.focus({ preventScroll: true });
    scrollToEnd();
  }

  function close() {
    if (!isOpen()) return;
    overlay.hidden = true;
    input.value = "";
    if (vv) {
      vv.removeEventListener("resize", fitToViewport);
      vv.removeEventListener("scroll", fitToViewport);
    }
    overlay.style.height = "";
    overlay.style.top = "";
    unlockPage();
    const target = opener && opener.isConnected ? opener : null;
    opener = null;
    if (target && typeof target.focus === "function") target.focus({ preventScroll: true });
  }

  // Backtick opens the terminal when the user is not typing somewhere.
  doc.addEventListener("keydown", (e) => {
    if (e.key !== "`" || isOpen() || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    if (isTypingTarget(e.target)) return;
    e.preventDefault();
    open(doc.activeElement);
  });

  // Any [data-terminal-open] button opens it (delegated, so buttons added later work too).
  doc.addEventListener("click", (e) => {
    const trigger = e.target instanceof Element ? e.target.closest("[data-terminal-open]") : null;
    if (!trigger) return;
    e.preventDefault();
    open(trigger);
  });

  closeBtn.addEventListener("click", () => close());

  // Backdrop click closes; only when both press and release happen on the backdrop (no drag-select close).
  let downOnBackdrop = false;
  overlay.addEventListener("pointerdown", (e) => { downOnBackdrop = e.target === overlay; });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && downOnBackdrop) close();
    downOnBackdrop = false;
  });

  // Esc closes; Tab / Shift+Tab cycle focus inside the dialog.
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter((n) => n.getClientRects().length > 0);
    if (!items.length) { e.preventDefault(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    const active = doc.activeElement;
    if (e.shiftKey && (active === first || !panel.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  });

  // Clicking inside the log (not on a link or while selecting text) returns focus to the input.
  log.addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest("a")) return;
    const sel = doc.getSelection();
    if (sel && !sel.isCollapsed) return;
    input.focus({ preventScroll: true });
  });

  return { open, close };
}
