/* HPV Wiki Editor — frontend */

const $ = (id) => document.getElementById(id);

// Public mount path the app is served under — derived from the <base href> the
// backend injects (e.g. "/chathpv/wiki/" behind nginx, or "/" at the root).
// Everything below builds URLs relative to this so the app works under any prefix.
const BASE = new URL(document.baseURI).pathname.replace(/\/*$/, "/");
const API = BASE.replace(/\/+$/, "") + "/api";

// Build an in-app URL under the mount path. appUrl("") → BASE; appUrl("a/b.md")
// → BASE + "a/b.md"; appUrl("?ask") → BASE + "?ask".
function appUrl(p) { return BASE + String(p).replace(/^\/+/, ""); }

// Turn a browser pathname into an internal wiki path (strip mount prefix + slashes).
function stripBase(pathname) {
  let p = decodeURIComponent(pathname || "");
  const base = decodeURIComponent(BASE);
  if (p.startsWith(base)) p = p.slice(base.length);
  return p.replace(/^\/+/, "").replace(/\/+$/, "");
}

const fileIndex = new Set();   // every file path in the tree
const dirIndex = new Map();    // dir path -> { setOpen(bool) }
const slugByPath = new Map();  // "conditions/warts" -> "conditions/warts.md"
const slugByBase = new Map();  // "warts" -> "conditions/warts.md" (Obsidian wikilinks)

const state = {
  token: localStorage.getItem("wiki_token") || null,
  name: localStorage.getItem("wiki_name") || "",
  file: null,        // open file path, or null
  saved: "",         // last-saved content
  dirty: false,
  asking: false,
};

function showUser() {
  $("user-name").textContent = state.name ? `Signed in as ${state.name}` : "";
}

/* ── API helper ──────────────────────────────────────────────────────────── */
async function api(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(API + path, {
    method, headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); throw new Error("Session expired — please sign in again."); }
  if (!res.ok) {
    const e = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(e.detail || res.statusText);
  }
  return res.json();
}

/* ── Auth ────────────────────────────────────────────────────────────────── */
function logout() {
  state.token = null;
  localStorage.removeItem("wiki_token");
  $("app").classList.add("hidden");
  $("login-overlay").classList.remove("hidden");
}

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("login-error");
  const btn = e.target.querySelector("button");
  err.classList.add("hidden");
  const name = $("name-input").value.trim();
  if (!name) {
    err.textContent = "Please enter your name.";
    err.classList.remove("hidden");
    $("name-input").focus();
    return;
  }
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: $("password-input").value, name }),
    });
    if (!res.ok) {
      err.textContent = res.status === 401 ? "Wrong password." : "Login failed.";
      err.classList.remove("hidden");
      $("password-input").select();
      return;
    }
    const data = await res.json();
    state.token = data.token;
    state.name = data.name || name;
    localStorage.setItem("wiki_token", state.token);
    localStorage.setItem("wiki_name", state.name);
    showUser();
    $("password-input").value = "";
    $("login-overlay").classList.add("hidden");
    $("app").classList.remove("hidden");
    init();
  } catch {
    err.textContent = "Network error.";
    err.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
});

$("logout-btn").addEventListener("click", () => {
  if (state.dirty && !confirm("You have unsaved changes. Log out anyway?")) return;
  logout();
});

/* ── Init ────────────────────────────────────────────────────────────────── */
async function init() {
  await loadTree();
  await routeFromUrl();
}

/* ── Views ───────────────────────────────────────────────────────────────── */
function setNav(which) {
  $("nav-home").classList.toggle("active", which === "home");
  $("nav-ask").classList.toggle("active", which === "ask");
}

function showHome({ push = true } = {}) {
  if (!guardUnsaved()) return;
  closeEditorState();
  $("editor-view").classList.add("hidden");
  $("ask-view").classList.add("hidden");
  $("home-view").classList.remove("hidden");
  setNav("home");
  highlightTree();
  if (push) navTo(appUrl(""));
}

function showAsk({ push = true } = {}) {
  if (!guardUnsaved()) return;
  closeEditorState();
  $("home-view").classList.add("hidden");
  $("editor-view").classList.add("hidden");
  $("ask-view").classList.remove("hidden");
  setNav("ask");
  highlightTree();
  if (push) navTo(appUrl("?ask"));
}

function showEditor() {
  $("home-view").classList.add("hidden");
  $("ask-view").classList.add("hidden");
  $("editor-view").classList.remove("hidden");
  setNav(null);
}

$("nav-home").addEventListener("click", (e) => { e.preventDefault(); showHome(); });
$("nav-ask").addEventListener("click", (e) => { e.preventDefault(); showAsk(); });
$("home-link").addEventListener("click", (e) => { e.preventDefault(); showHome(); });

/* ── File tree ───────────────────────────────────────────────────────────── */
async function loadTree() {
  try {
    const tree = await api("GET", "/files");
    const root = $("file-tree");
    root.innerHTML = "";
    fileIndex.clear();
    dirIndex.clear();
    slugByPath.clear();
    slugByBase.clear();
    if (tree.children && tree.children.length) {
      tree.children.forEach((n) => root.appendChild(treeNode(n)));
    } else {
      root.innerHTML = '<p class="tree-empty">No files yet. Click ＋ to create one.</p>';
    }
    highlightTree();
  } catch {
    $("file-tree").innerHTML = '<p class="tree-empty">Could not load files.</p>';
  }
}

function treeNode(node) {
  const wrap = document.createElement("div");
  const row = document.createElement("a");        // anchors => real, copyable links
  row.className = "tree-row";
  row.dataset.path = node.path;
  row.dataset.type = node.type;
  row.href = appUrl(encPath(node.path) + (node.type === "dir" ? "/" : ""));

  if (node.type === "dir") {
    let open = false;                              // folders start collapsed
    const kids = document.createElement("div");
    kids.className = "tree-children";
    kids.style.display = "none";
    (node.children || []).forEach((c) => kids.appendChild(treeNode(c)));

    const twist = document.createElement("span");
    twist.className = "twist";
    twist.textContent = "▸";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = node.name;
    row.append(twist, label);

    const setOpen = (v) => {
      open = v;
      kids.style.display = v ? "" : "none";
      twist.textContent = v ? "▾" : "▸";
    };
    dirIndex.set(node.path, { setOpen });

    row.addEventListener("click", (e) => {
      if (modifiedClick(e)) return;              // let ctrl/cmd/middle-click open a tab
      e.preventDefault();
      setOpen(!open);
    });
    wrap.append(row, kids);
  } else {
    fileIndex.add(node.path);
    slugByPath.set(node.path.replace(/\.md$/, ""), node.path);
    const base = node.name.replace(/\.md$/, "");
    if (!slugByBase.has(base)) slugByBase.set(base, node.path);
    const spacer = document.createElement("span");
    spacer.className = "twist";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = node.name;
    row.append(spacer, label);
    row.addEventListener("click", (e) => {
      if (modifiedClick(e)) return;
      e.preventDefault();
      openFile(node.path);
    });
    wrap.append(row);
  }
  return wrap;
}

function modifiedClick(e) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1;
}

function highlightTree() {
  document.querySelectorAll(".tree-row").forEach((el) => {
    el.classList.toggle("active", el.dataset.type === "file" && el.dataset.path === state.file);
  });
}

/* ── Editor ──────────────────────────────────────────────────────────────── */
async function openFile(path, { push = true } = {}) {
  if (path === state.file) { showEditor(); return; }
  if (!guardUnsaved()) return;
  try {
    const { content } = await api("GET", `/files/${encPath(path)}`);
    state.file = path;
    state.saved = content;
    $("editor-path").textContent = `wiki/${path}`;
    const ta = $("editor-textarea");
    ta.value = content;
    setDirty(false);
    setStatus("");
    selectTab("write");
    showEditor();
    highlightTree();
    if (push) navTo(appUrl(encPath(path)));
  } catch (err) {
    alert(`Could not open file: ${err.message}`);
  }
}

function closeEditorState() {
  state.file = null;
  setDirty(false);
}

$("editor-textarea").addEventListener("input", () => {
  setDirty($("editor-textarea").value !== state.saved);
});

function setDirty(v) {
  state.dirty = v;
  if (v) setStatus("Unsaved changes", "dirty");
}

function setStatus(text, cls = "") {
  const el = $("save-status");
  el.textContent = text;
  el.className = `save-status ${cls}`;
}

/* tabs */
$("tab-write").addEventListener("click", () => selectTab("write"));
$("tab-preview").addEventListener("click", () => selectTab("preview"));

function selectTab(which) {
  const write = which === "write";
  $("tab-write").classList.toggle("active", write);
  $("tab-preview").classList.toggle("active", !write);
  $("editor-textarea").classList.toggle("hidden", !write);
  $("editor-preview").classList.toggle("hidden", write);
  if (!write) $("editor-preview").innerHTML = renderMD($("editor-textarea").value || "");
}

/* save */
$("save-btn").addEventListener("click", async () => {
  if (!state.file) return;
  const content = $("editor-textarea").value;
  const btn = $("save-btn");
  btn.disabled = true;
  setStatus("Saving…");
  try {
    await api("PUT", `/files/${encPath(state.file)}`, { content });
    state.saved = content;
    setDirty(false);
    setStatus("Saved.", "ok");
  } catch (err) {
    setStatus(err.message, "err");
  } finally {
    btn.disabled = false;
  }
});

/* delete */
$("delete-btn").addEventListener("click", async () => {
  if (!state.file) return;
  if (!confirm(`Delete wiki/${state.file}?\n\nThis removes the file from the wiki immediately.`)) return;
  try {
    await api("DELETE", `/files/${encPath(state.file)}`);
    closeEditorState();
    await loadTree();
    showHome();
  } catch (err) {
    alert(`Delete failed: ${err.message}`);
  }
});

/* ── New file ────────────────────────────────────────────────────────────── */
$("new-file-btn").addEventListener("click", () => {
  $("new-path").value = "";
  $("new-modal").classList.remove("hidden");
  $("new-path").focus();
});
$("new-cancel").addEventListener("click", () => $("new-modal").classList.add("hidden"));
$("new-modal").addEventListener("click", (e) => {
  if (e.target === $("new-modal")) $("new-modal").classList.add("hidden");
});

$("new-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  let path = $("new-path").value.trim().replace(/^\/+/, "");
  if (!path) return;
  if (!path.endsWith(".md")) path += ".md";
  try {
    await api("POST", "/files", { path, content: template(path) });
    $("new-modal").classList.add("hidden");
    await loadTree();
    state.dirty = false;
    await openFile(path);
  } catch (err) {
    alert(`Could not create: ${err.message}`);
  }
});

function template(path) {
  const today = new Date().toISOString().split("T")[0];
  const title = path.split("/").pop().replace(/\.md$/, "").replace(/-/g, " ");
  return `---
entity_type: topic
tags: [hpv]
last_updated: ${today}
source_count: 0
evidence_tier_high: T1
evidence_tier_low: T4
contributors: [uscacelab]
status: draft
---

# ${title}

> [!warning] Not medical advice — synthesis of sources, not a substitute for clinical care. See [[overview]].

`;
}

$("refresh-btn").addEventListener("click", loadTree);

/* ── Ask (query) ─────────────────────────────────────────────────────────── */
$("ask-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (state.asking) return;
  const input = $("ask-input").value.trim();
  if (!input) return;

  const out = $("ask-output");
  const btn = $("ask-btn");
  out.classList.remove("hidden");
  out.innerHTML = '<p class="thinking">Thinking…</p>';
  state.asking = true;
  btn.disabled = true;
  btn.textContent = "Asking…";

  let raw = "";
  let done = false;
  try {
    const res = await fetch(`${API}/claude/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.token}` },
      body: JSON.stringify({ command: "query", input }),
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      out.innerHTML = `<p class="error">Error: ${escHtml(err.detail || res.statusText)}</p>`;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (!done) {
      const { done: end, value } = await reader.read();
      if (end) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") { done = true; break; }
        try {
          const { text, error } = JSON.parse(payload);
          if (error) raw += `\n\n**Error:** ${error}`;
          else if (text) raw += text;
          out.innerHTML = renderMD(raw || "");
        } catch { /* ignore */ }
      }
    }
    out.innerHTML = raw.trim() ? renderMD(raw) : '<p class="muted">No answer returned.</p>';
  } catch (err) {
    out.innerHTML = `<p class="error">Network error: ${escHtml(err.message)}</p>`;
  } finally {
    state.asking = false;
    btn.disabled = false;
    btn.textContent = "Ask";
  }
});

$("ask-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    $("ask-form").requestSubmit();
  }
});

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function encPath(p) { return p.split("/").map(encodeURIComponent).join("/"); }
function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;"); }

/* ── URL routing ─────────────────────────────────────────────────────────── */
function navTo(url) {
  if (location.pathname + location.search !== url) history.pushState({}, "", url);
}

function currentPath() {
  return stripBase(location.pathname);
}

/* ── Markdown + wiki links ───────────────────────────────────────────────── */
// Resolve a link target (slug, path, or Obsidian wikilink) to a real file path.
function resolveTarget(t) {
  if (!t) return null;
  t = t.trim().replace(/^\.?\//, "").replace(/[#?].*$/, "");
  if (!t) return null;
  if (fileIndex.has(t)) return t;
  if (fileIndex.has(t + ".md")) return t + ".md";
  if (slugByPath.has(t)) return slugByPath.get(t);
  const base = t.split("/").pop();
  if (slugByBase.has(base)) return slugByBase.get(base);
  return null;
}

// Turn [[target]] / [[target|alias]] into real markdown links before rendering.
function preprocessWikilinks(md) {
  return (md || "").replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    const [target, alias] = inner.split("|");
    const text = (alias || target).trim();
    const path = resolveTarget(target);
    return path ? `[${text}](${appUrl(encPath(path))})` : text;
  });
}

function renderMD(md) {
  return marked.parse(preprocessWikilinks(md));
}

function expandTo(path) {
  const parts = path.split("/");
  parts.pop();                 // drop the file (or dir) itself; expand ancestors
  let acc = "";
  for (const p of parts) {
    acc = acc ? `${acc}/${p}` : p;
    const ctl = dirIndex.get(acc);
    if (ctl) ctl.setOpen(true);
  }
}

async function routeFromUrl() {
  const path = currentPath();
  if (new URLSearchParams(location.search).has("ask")) { showAsk({ push: false }); return; }
  if (!path) { await showHome({ push: false }); return; }
  if (fileIndex.has(path)) {
    expandTo(path);
    await openFile(path, { push: false });
  } else if (dirIndex.has(path)) {
    expandTo(path);
    dirIndex.get(path).setOpen(true);
    await showHome({ push: false });
  } else {
    await showHome({ push: false });   // unknown path → home
  }
}

window.addEventListener("popstate", () => { routeFromUrl(); });

// Make file links inside rendered markdown (ask answers + preview) navigate in-app.
function interceptWikiLinks(container) {
  container.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || modifiedClick(e)) return;
    let url;
    try { url = new URL(a.href, location.origin); } catch { return; }
    if (url.origin !== location.origin) return;
    const raw = stripBase(url.pathname);
    const path = resolveTarget(raw);
    if (path) {
      e.preventDefault();
      expandTo(path);
      openFile(path);
    }
  });
}
interceptWikiLinks($("ask-output"));
interceptWikiLinks($("editor-preview"));

function guardUnsaved() {
  if (!state.dirty) return true;
  return confirm("You have unsaved changes. Discard them?");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $("new-modal").classList.add("hidden");
});
window.addEventListener("beforeunload", (e) => {
  if (state.dirty) { e.preventDefault(); e.returnValue = ""; }
});

/* ── Boot ────────────────────────────────────────────────────────────────── */
if (state.name) $("name-input").value = state.name;  // prefill for returning users
if (state.token) {
  showUser();
  $("login-overlay").classList.add("hidden");
  $("app").classList.remove("hidden");
  init();
}
