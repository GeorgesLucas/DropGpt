const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
const RPC_URL = "https://api.dropboxapi.com/2";
const CONTENT_URL = "https://content.dropboxapi.com/2";

// --- utils: nettoyage des chemins ---
function sanitizePath(p) {
  if (typeof p !== "string") return p;
  // Remplace les espaces insécables par des espaces classiques
  let s = p.replace(/\u00A0/g, " ");
  // Supprime les espaces juste avant un point (ex: "test .txt" -> "test.txt")
  s = s.replace(/\s+(?=\.)/g, "");
  // Trim début/fin (sans toucher aux espaces internes)
  s = s.trim();
  return s;
}

// Lister un dossier
app.post("/list", async (req, res) => {
  try {
    const path = sanitizePath(req.body.path || "");
    const response = await axios.post(
      `${RPC_URL}/files/list_folder`,
      { path, recursive: false },
      { headers: { Authorization: `Bearer ${DROPBOX_TOKEN}` } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// Continuer la pagination
app.post("/list/continue", async (req, res) => {
  try {
    const cursor = req.body.cursor;
    const response = await axios.post(
      `${RPC_URL}/files/list_folder/continue`,
      { cursor },
      { headers: { Authorization: `Bearer ${DROPBOX_TOKEN}` } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// Télécharger un fichier
app.post("/download", async (req, res) => {
  try {
    const path = sanitizePath(req.body.path);
    const response = await axios.post(
      `${CONTENT_URL}/files/download`,
      null, // body vide
      {
        headers: {
          Authorization: `Bearer ${DROPBOX_TOKEN}`,
          "Dropbox-API-Arg": JSON.stringify({ path })
        },
        responseType: "arraybuffer"
      }
    );
    res.json({ content: Buffer.from(response.data).toString("base64") });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// Uploader un fichier
app.post("/upload", async (req, res) => {
  try {
    const path = sanitizePath(req.body.path);
    const binary = Buffer.from(req.body.content, "base64");
    const response = await axios.post(`${CONTENT_URL}/files/upload`, binary, {
      headers: {
        Authorization: `Bearer ${DROPBOX_TOKEN}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode: "overwrite",
          autorename: false
        })
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Middleware listening on port ${port}`);
});
