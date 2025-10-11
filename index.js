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
          Authorization: `Bearer ${sl.u.AGDk4zqErm-hoxhaaSVzuajfMecT2x8hj6E7eilN5hcDib9dmD_Sv6kz8Ps56HyhW74GRaGkwCDCTK2RlqmkaH94Vwi_6bkxU2K2i5mUL4utn0egpLOFyMqCjqryA-W01fY343DtUM-Ypkrr_Uvlwdk1oKS_BBTkk-CVFgBpiEk2KEAxDtYuiE7UC7xhiyIMqVBfankLyfTPEFJfcGQHx0tKirIay-EfphgNf8BiDDyS2eNBkXTUP1on3frpxeZle6RGwSjdub0Kjp4flNo4LLQH5AAMwQKUKQR0Io2Ttl93RNfVTgLb2n9KYRI7ZPX0CB3ZQdxT36T0hCz4e8b1YFi3ZNexRkuKFZjlLTdo_SOsC5FPD24WvYAHHlDnmJqQLoJI8KYLOMYUpSOK8iDoUpGGDHEzFlK_A2aF9bNfmrQ4cYSdJMzlS2EpaFUZV7hAzLyK8XKLVqV3IdQGv5aslb68zSPu1dn7-jzz-Ud659ON21Wc5AW4dIXmIxSmUSd6STFT3S3MfIFhEujTvr_J5K2A4QLWHhPyDVwvrYZtIJq02kKb43ukZITsIgXbUK5_DvYQJJ-d_TeFJ7egDOrStBKud386EgCgCG2LHW5x2HTzgrit_m9_6JxiR_p27B0x8Ut-XaPMUZ6Hyk8nHrCZoyRu-28W-Ksci_qmtHHL3qS6s7lO1O59Iq886Xgoqi8h-qvL3Y9cdcC-YNp5Ox40g5l6xvL8LQg1tumL4MWBc-7DkZDoD-bJ8UjmmrWOHETJrZbWLRPtusHrewolX48M0fvNk7Qqz8XFzxnMF3FL7rGJkyw6OXt9xGcRi5HNFGHVuhwOmARtgMZ3nO1EoIycrRhGCG_kT1A7y-0xCjBn12VtzRjO0Jpvzzh3AO2_iHvQJ8IZ8Y_5OngN7i9SpdmJq7mG4UQqJj6GK04aJX7HzdkEII22TJeKr4QMFANctxVxFFF1Vc5JAGWnOyaYtL7tZIYVSc8FltXMEs6PV_0uKDIPADqPzRq2qgir16NCA4PgOb9pVYhPWAlB1yElVJ0N1E9gVIcfaAbs0aO3Ur5OIxcBtoQ12lH-HjVYhjFM2d-Ud0b8SNpBv_fFH4yPXdJbbnONDOzh04eNW1iDZnMXqHIaKnl5CqipvkqhhQL77k6YYqBqV3JilanqJuMuI2T5PTyopsmzGdoRI5nOM83ExwfuHbLLs_-utYAZuHLBqo9djQucLyAjwFBPDxjps9DEM0ORNZF0vMSK_DEsWlPu02NLcJTfGerNDzvc-zJwAkXTQ0bXzNCuauWKt98vIuiOgclA
}`,
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
