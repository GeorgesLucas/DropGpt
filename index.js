const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
const RPC_URL = "https://api.dropboxapi.com/2";
const CONTENT_URL = "https://content.dropboxapi.com/2";

// Lister un dossier
app.post("/list", async (req, res) => {
  try {
    const response = await axios.post(
      `${RPC_URL}/files/list_folder`,
      { path: req.body.path || "", recursive: false },
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
    const response = await axios.post(
      `${CONTENT_URL}/files/download`,
      { path: req.body.path },
      {
        headers: {
          Authorization: `Bearer ${DROPBOX_TOKEN}`,
          "Dropbox-API-Arg": JSON.stringify({ path: req.body.path })
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
    const binary = Buffer.from(req.body.content, "base64");
    const response = await axios.post(
      `${CONTENT_URL}/files/upload`,
      binary,
      {
        headers: {
          Authorization: `Bearer ${DROPBOX_TOKEN}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": JSON.stringify({
            path: req.body.path,
            mode: "overwrite",
            autorename: false
          })
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Middleware listening on port ${port}`);
});
