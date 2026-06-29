const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "crm.json");

const stages = ["clarifier", "relancer", "en_cours", "bloque", "fait"];

const demoContacts = [
  {
    id: "viral-scott",
    name: "Scott - validation plan édito",
    company: "Client Scott",
    email: "",
    phone: "",
    stage: "relancer",
    value: 2500,
    nextAction: "Confirmer la version finale du plan édito avec Adam avant le call.",
    nextActionDate: "2026-06-30",
    owner: "Mathis",
    source: "Récap Viral Media 29/06-05/07",
    projectType: "Suivi client",
    sensitivity: "Call mardi 30 juin 2026, 10h-11h. Objectif indiqué : validation du plan éditorial et paiement de 2 500 euros.",
    messageDraft: "Les gars, pour le call Scott, je veux juste me mettre à jour avant demain.\nAdam, tu peux me confirmer que la dernière version du plan édito est prête ?\nAnis, tu veux qu'on parte sur quel angle au moment de la validation client ?",
    notes: [
      {
        id: "note-scott-1",
        text: "Point à ne pas laisser dormir : vérifier que le plan édito final est prêt avant le call.",
        createdAt: "2026-06-29T09:00:00.000Z"
      }
    ],
    createdAt: "2026-06-29T09:00:00.000Z",
    updatedAt: "2026-06-29T09:00:00.000Z"
  },
  {
    id: "viral-vibes",
    name: "Vibes - plan éditorial",
    company: "Vibes",
    email: "",
    phone: "",
    stage: "relancer",
    value: 0,
    nextAction: "Récupérer la dernière version auprès d'Adam et confirmer ce qui part au client.",
    nextActionDate: "2026-06-30",
    owner: "Mathis",
    source: "Récap Viral Media 29/06-05/07",
    projectType: "Suivi client",
    sensitivity: "Deadline du plan éditorial mardi 30 juin. Sujet utile pour montrer ta capacité à suivre un client.",
    messageDraft: "Point Vibes : je veux juste confirmer où on en est sur le plan édito.\nAdam, tu peux m'envoyer la dernière version ?\nAnis, dis-moi si tu veux que je prenne le relais pour cadrer le retour client si t'es pris.",
    notes: [
      {
        id: "note-vibes-1",
        text: "Plan édito à finaliser pour mardi 30 juin.",
        createdAt: "2026-06-29T09:05:00.000Z"
      }
    ],
    createdAt: "2026-06-29T09:05:00.000Z",
    updatedAt: "2026-06-29T09:05:00.000Z"
  },
  {
    id: "viral-studio",
    name: "Studio Ronnie / Jordan",
    company: "Need For School",
    email: "",
    phone: "",
    stage: "relancer",
    value: 0,
    nextAction: "Envoyer 3-4 créneaux possibles pour ne pas bloquer le shoot.",
    nextActionDate: "2026-06-29",
    owner: "Mathis",
    source: "Récap Viral Media 29/06-05/07",
    projectType: "Suivi presta",
    sensitivity: "Need For School attend des créneaux précis avant de pouvoir répondre.",
    messageDraft: "Bonjour Alana,\nMerci pour votre retour.\nJe peux vous proposer plusieurs créneaux pour le shooting :\n- mardi après-midi\n- mercredi matin ou après-midi\n- jeudi matin\nL'idée serait de réserver le studio sur une demi-journée.\nPouvez-vous me dire ce qui serait possible de votre côté, ainsi que les modalités de réservation/caution ?\nMerci à vous,\nMathis Delassus",
    notes: [
      {
        id: "note-studio-1",
        text: "Sujet à garder vivant : studio Ronnie / validation des disponibilités Jordan.",
        createdAt: "2026-06-29T09:10:00.000Z"
      }
    ],
    createdAt: "2026-06-29T09:10:00.000Z",
    updatedAt: "2026-06-29T09:10:00.000Z"
  },
  {
    id: "viral-montages",
    name: "Priorité des montages",
    company: "Viral Media / Anis",
    email: "",
    phone: "",
    stage: "clarifier",
    value: 0,
    nextAction: "Demander à Anis l'ordre de priorité avant d'avancer.",
    nextActionDate: "2026-06-29",
    owner: "Mathis",
    source: "Récap Viral Media 29/06-05/07",
    projectType: "Production",
    sensitivity: "Trop de contenus à monter sans ordre clair : Barça Ronnie, Afterwork, backstages Vibes/Seth Gueko/Ovnie.",
    messageDraft: "Anis, tu veux que je priorise quel montage en premier cette semaine ?\nJ'ai Barça Ronnie, Afterwork et les backstages Vibes/Seth Gueko/Ovnie.\nJe préfère te demander avant d'avancer dans le mauvais ordre.",
    notes: [
      {
        id: "note-montages-1",
        text: "Éviter d'avancer dans le mauvais sens : obtenir la priorité avant montage.",
        createdAt: "2026-06-29T09:15:00.000Z"
      }
    ],
    createdAt: "2026-06-29T09:15:00.000Z",
    updatedAt: "2026-06-29T09:15:00.000Z"
  },
  {
    id: "viral-fiche-poste",
    name: "Fiche de poste signée",
    company: "Viral Media / Anis",
    email: "",
    phone: "",
    stage: "clarifier",
    value: 0,
    nextAction: "Renvoyer la fiche de poste signée quand elle est prête.",
    nextActionDate: "2026-07-02",
    owner: "Mathis",
    source: "Récap Viral Media 29/06-05/07",
    projectType: "Admin",
    sensitivity: "Simple mais important pour cadrer ton rôle.",
    messageDraft: "",
    notes: [
      {
        id: "note-fiche-1",
        text: "Anis attend la fiche de poste signée.",
        createdAt: "2026-06-29T09:20:00.000Z"
      }
    ],
    createdAt: "2026-06-29T09:20:00.000Z",
    updatedAt: "2026-06-29T09:20:00.000Z"
  },
  {
    id: "viral-0107",
    name: "Date 01/07 à confirmer",
    company: "Concert / format Imprévu",
    email: "",
    phone: "",
    stage: "bloque",
    value: 0,
    nextAction: "Confirmer l'événement et le vrai jour dans le groupe.",
    nextActionDate: "2026-06-29",
    owner: "Mathis",
    source: "Récap Viral Media 29/06-05/07",
    projectType: "Planning tournage",
    sensitivity: "Le mail mentionne Mar 01/07, alors que le 1er juillet 2026 tombe un mercredi.",
    messageDraft: "Juste pour éviter une erreur de planning : le mail indique \"Mar 01/07\" pour le concert / tournage Imprévu à 19h.\nOn confirme bien la date exacte et le jour ?",
    notes: [
      {
        id: "note-0107-1",
        text: "Incohérence jour/date à lever avant planning.",
        createdAt: "2026-06-29T09:25:00.000Z"
      }
    ],
    createdAt: "2026-06-29T09:25:00.000Z",
    updatedAt: "2026-06-29T09:25:00.000Z"
  },
  {
    id: "viral-moussa",
    name: "Format Qui veut boxer Moussa",
    company: "Moussa / Viral Media",
    email: "",
    phone: "",
    stage: "en_cours",
    value: 0,
    nextAction: "Suivre la validation du partenariat avant de caler le format.",
    nextActionDate: "2026-07-03",
    owner: "Mathis",
    source: "Récap Viral Media 29/06-05/07",
    projectType: "Suivi talents",
    sensitivity: "Sujet dépendant de la validation du partenariat.",
    messageDraft: "",
    notes: [
      {
        id: "note-moussa-1",
        text: "Garder le sujet vivant sans forcer : dépend de la validation partenariat.",
        createdAt: "2026-06-29T09:30:00.000Z"
      }
    ],
    createdAt: "2026-06-29T09:30:00.000Z",
    updatedAt: "2026-06-29T09:30:00.000Z"
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
