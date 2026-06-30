const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "crm.json");
const MAIL_DB_FILE = path.join(DATA_DIR, "viral-mail-db.json");
const SESSION_FILE = path.join(DATA_DIR, "user-session.json");

const stages = ["clarifier", "relancer", "en_cours", "bloque", "fait"];

const demoContacts = [
  {
    id: "demo-street-launch",
    name: "Lancement street campaign",
    company: "Kroma Demo",
    email: "",
    phone: "",
    stage: "en_cours",
    value: 2500,
    nextAction: "Valider le plan de diffusion et les formats prioritaires.",
    nextActionDate: "2026-06-30",
    owner: "Mathis",
    source: "Demo local",
    projectType: "Street marketing",
    sensitivity: "Priorite haute : garder une execution simple, visible, mesurable.",
    messageDraft: "Je te propose qu'on valide aujourd'hui les formats prioritaires, puis je verrouille le planning de diffusion.",
    notes: [
      {
        id: "demo-note-1",
        text: "Objectif : transformer l'energie DA en actions claires.",
        createdAt: "2026-06-29T09:00:00.000Z"
      }
    ],
    createdAt: "2026-06-29T09:00:00.000Z",
    updatedAt: "2026-06-29T09:00:00.000Z"
  },
  {
    id: "demo-shoot-plan",
    name: "Tournage capsule brand",
    company: "Studio Demo",
    email: "",
    phone: "",
    stage: "relancer",
    value: 900,
    nextAction: "Confirmer le lieu, les participants et la checklist matos.",
    nextActionDate: "2026-07-02",
    owner: "Mathis",
    source: "Demo local",
    projectType: "Tournage",
    sensitivity: "Cadrer le deroule avant de bloquer l'equipe.",
    messageDraft: "Je veux verrouiller le lieu, les horaires et la checklist avant le tournage.",
    notes: [],
    createdAt: "2026-06-29T10:00:00.000Z",
    updatedAt: "2026-06-29T10:00:00.000Z"
  }
];
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await writeContacts(demoContacts);
  }
}

async function readContacts() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

function emptyMailDatabase() {
  return {
    version: 1,
    updatedAt: null,
    source: "Gmail missions",
    watchQuery: "from:sender@example.com (subject:(tâches OR taches OR tournage OR invitation) OR tournage OR tasks)",
    processedMessageIds: [],
    imports: [],
    tasks: [],
    shoots: [],
    weeklyRecaps: []
  };
}

function defaultSession() {
  return {
    version: 1,
    updatedAt: null,
    profile: {
      name: "Mathis",
      handle: "Kroma",
      role: "Chef de projet créatif",
      email: "",
      avatarText: "MD",
      avatarImage: "",
      bio: "Piloter Kroma, garder les deadlines propres, transformer les mails en missions actionnables."
    },
    workspace: {
      name: "Kroma HQ",
      tagline: "Street-Verse ops",
      weekLabel: "29 juin - 5 juillet",
      commandLabel: "Console Jarvis"
    },
    preferences: {
      accentColor: "#7a2cff",
      hotColor: "#ff1744",
      cyanColor: "#00f7ff",
      magentaColor: "#ff2bd6",
      density: "comfortable",
      motion: "on",
      visualIntensity: 82,
      defaultOwner: "Mathis",
      startRoute: "dashboard",
      jarvisDefaultOpen: false
    }
  };
}

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

function sanitizeSession(input = {}, existing = defaultSession()) {
  const base = { ...defaultSession(), ...existing };
  const profile = { ...base.profile, ...(input.profile || {}) };
  const workspace = { ...base.workspace, ...(input.workspace || {}) };
  const preferences = { ...base.preferences, ...(input.preferences || {}) };
  const safeColor = (value, fallback) => isHexColor(value) ? value : fallback;

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    profile: {
      name: String(profile.name || "Mathis").trim().slice(0, 80),
      handle: String(profile.handle || "Kroma").trim().slice(0, 40),
      role: String(profile.role || "Chef de projet créatif").trim().slice(0, 100),
      email: String(profile.email || "").trim().slice(0, 120),
      avatarText: String(profile.avatarText || "MD").trim().slice(0, 3).toUpperCase(),
      avatarImage: String(profile.avatarImage || "").startsWith("data:image/") ? String(profile.avatarImage).slice(0, 2_500_000) : "",
      bio: String(profile.bio || "").trim().slice(0, 320)
    },
    workspace: {
      name: String(workspace.name || "Kroma HQ").trim().slice(0, 80),
      tagline: String(workspace.tagline || "Street-Verse ops").trim().slice(0, 80),
      weekLabel: String(workspace.weekLabel || "29 juin - 5 juillet").trim().slice(0, 80),
      commandLabel: String(workspace.commandLabel || "Console Jarvis").trim().slice(0, 80)
    },
    preferences: {
      accentColor: safeColor(preferences.accentColor, "#7a2cff"),
      hotColor: safeColor(preferences.hotColor, "#ff1744"),
      cyanColor: safeColor(preferences.cyanColor, "#00f7ff"),
      magentaColor: safeColor(preferences.magentaColor, "#ff2bd6"),
      density: ["compact", "comfortable", "spacious"].includes(preferences.density) ? preferences.density : "comfortable",
      motion: ["on", "reduced"].includes(preferences.motion) ? preferences.motion : "on",
      visualIntensity: Math.max(20, Math.min(100, Number(preferences.visualIntensity) || 82)),
      defaultOwner: String(preferences.defaultOwner || profile.name || "Mathis").trim().slice(0, 80),
      startRoute: ["dashboard", "pipeline", "agenda", "contacts", "database", "assistant", "brand", "profile"].includes(preferences.startRoute)
        ? preferences.startRoute
        : "dashboard",
      jarvisDefaultOpen: Boolean(preferences.jarvisDefaultOpen)
    }
  };
}

async function readMailDatabase() {
  try {
    const raw = await fs.readFile(MAIL_DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return emptyMailDatabase();
    throw error;
  }
}

async function readSession() {
  try {
    const raw = await fs.readFile(SESSION_FILE, "utf8");
    return sanitizeSession(JSON.parse(raw));
  } catch (error) {
    if (error.code === "ENOENT") return defaultSession();
    throw error;
  }
}

async function writeSession(session) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SESSION_FILE, `${JSON.stringify(session, null, 2)}\n`);
}

async function writeContacts(contacts) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("JSON invalide.");
    error.status = 400;
    throw error;
  }
}

function sanitizeContact(input, existing = {}) {
  const now = new Date().toISOString();
  const name = String(input.name || existing.name || "").trim();
  const company = String(input.company || existing.company || "").trim();

  if (!name) {
    const error = new Error("Le nom est obligatoire.");
    error.status = 400;
    throw error;
  }

  if (!company) {
    const error = new Error("L'entreprise est obligatoire.");
    error.status = 400;
    throw error;
  }

  const stage = stages.includes(input.stage) ? input.stage : existing.stage || "clarifier";

  return {
    id: existing.id || crypto.randomUUID(),
    name,
    company,
    email: String(input.email ?? existing.email ?? "").trim(),
    phone: String(input.phone ?? existing.phone ?? "").trim(),
    stage,
    value: Number(input.value ?? existing.value ?? 0) || 0,
    nextAction: String(input.nextAction ?? existing.nextAction ?? "").trim(),
    nextActionDate: String(input.nextActionDate ?? existing.nextActionDate ?? "").trim(),
    owner: String(input.owner ?? existing.owner ?? "Mathis").trim(),
    source: String(input.source ?? existing.source ?? "").trim(),
    projectType: String(input.projectType ?? existing.projectType ?? "").trim(),
    sensitivity: String(input.sensitivity ?? existing.sensitivity ?? "").trim(),
    messageDraft: String(input.messageDraft ?? existing.messageDraft ?? "").trim(),
    notes: Array.isArray(existing.notes) ? existing.notes : [],
    createdAt: existing.createdAt || now,
    updatedAt: now
  };
}

function rankContacts(contacts) {
  const stageOrder = Object.fromEntries(stages.map((stage, index) => [stage, index]));
  return [...contacts].sort((a, b) => {
    const stageDiff = stageOrder[a.stage] - stageOrder[b.stage];
    if (stageDiff !== 0) return stageDiff;
    return String(a.nextActionDate || "9999-12-31").localeCompare(String(b.nextActionDate || "9999-12-31"));
  });
}

async function handleApi(req, res, url) {
  const contacts = await readContacts();
  const contactMatch = url.pathname.match(/^\/api\/contacts\/([^/]+)$/);
  const notesMatch = url.pathname.match(/^\/api\/contacts\/([^/]+)\/notes$/);

  if (req.method === "GET" && url.pathname === "/api/contacts") {
    sendJson(res, 200, { contacts: rankContacts(contacts), stages });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/mail-database") {
    sendJson(res, 200, await readMailDatabase());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/session") {
    sendJson(res, 200, { session: await readSession() });
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/session") {
    const current = await readSession();
    const session = sanitizeSession(await readBody(req), current);
    await writeSession(session);
    sendJson(res, 200, { session });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/contacts") {
    const body = await readBody(req);
    const contact = sanitizeContact(body);
    contacts.push(contact);
    await writeContacts(contacts);
    sendJson(res, 201, { contact });
    return;
  }

  if (contactMatch && req.method === "PUT") {
    const id = decodeURIComponent(contactMatch[1]);
    const index = contacts.findIndex((contact) => contact.id === id);
    if (index === -1) {
      sendError(res, 404, "Contact introuvable.");
      return;
    }
    const body = await readBody(req);
    const updated = sanitizeContact(body, contacts[index]);
    contacts[index] = updated;
    await writeContacts(contacts);
    sendJson(res, 200, { contact: updated });
    return;
  }

  if (contactMatch && req.method === "DELETE") {
    const id = decodeURIComponent(contactMatch[1]);
    const nextContacts = contacts.filter((contact) => contact.id !== id);
    if (nextContacts.length === contacts.length) {
      sendError(res, 404, "Contact introuvable.");
      return;
    }
    await writeContacts(nextContacts);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (notesMatch && req.method === "POST") {
    const id = decodeURIComponent(notesMatch[1]);
    const index = contacts.findIndex((contact) => contact.id === id);
    if (index === -1) {
      sendError(res, 404, "Contact introuvable.");
      return;
    }
    const body = await readBody(req);
    const text = String(body.text || "").trim();
    if (!text) {
      sendError(res, 400, "La note ne peut pas etre vide.");
      return;
    }
    const note = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString()
    };
    contacts[index].notes = [note, ...(contacts[index].notes || [])];
    contacts[index].updatedAt = note.createdAt;
    await writeContacts(contacts);
    sendJson(res, 201, { note, contact: contacts[index] });
    return;
  }

  sendError(res, 404, "Route API introuvable.");
}

async function serveStatic(req, res, url) {
  let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
  filePath = decodeURIComponent(filePath);
  const resolved = path.normalize(path.join(PUBLIC_DIR, filePath));

  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(resolved);
    if (stat.isDirectory()) {
      res.writeHead(302, { Location: "/" });
      res.end();
      return;
    }
    const ext = path.extname(resolved).toLowerCase();
    const content = await fs.readFile(resolved);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(content);
  } catch {
    const index = await fs.readFile(path.join(PUBLIC_DIR, "index.html"));
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache"
    });
    res.end(index);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendError(res, error.status || 500, error.message || "Erreur serveur.");
  }
});

ensureDataFile()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Mini CRM lance sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Impossible de preparer le CRM:", error);
    process.exit(1);
  });
