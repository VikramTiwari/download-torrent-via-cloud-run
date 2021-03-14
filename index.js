const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const archiver = require("archiver");

const dir = path.join(__dirname, `./downloads/`);
const zip = path.join(__dirname, "./result.zip");

function zipDirectory(source, out) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
}

// delete existing folder and files
if (fs.existsSync(dir)) {
  fs.rmSync(dir, { recursive: true });
}
if (fs.existsSync(zip)) {
  fs.rmSync(zip);
}

// create new dir
fs.mkdirSync(dir);

// add request handling via express
const app = express();
app.use(bodyParser.json({ type: "application/json" }));

app.get("/", async (req, res) => {
  if (!req.query.magnet) {
    res.send({ error: `req.query.magnet not present` });
  } else {
    try {
      const magnet = decodeURIComponent(req.query.magnet);
      console.log(`Adding ${magnet}`);
      await new Promise((resolve) => {
        const command = `webtorrent --out ${dir} download ${magnet}`;
        console.log(`Command: ${command}`);
        exec(command, async (error, stdout, stderr) => {
          if (error) {
            console.log(`Error downloading ${magnet}`, stderr);
          }
          await zipDirectory(dir, zip);
          console.log(`Download and zip completed`);
          resolve();
        });
      });
      fs.createReadStream(zip).pipe(res);
    } catch (error) {
      console.log(error);
      res.send({ error: `Error while downloading ${magnet}: ${error}` });
    }
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Listening on port", port);
});
