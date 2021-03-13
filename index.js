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

app.post("/", async (req, res) => {
	const magnet = req.body.magnet;
	if (magnet) {
		try {
			console.log(`Adding ${magnet}`);
			await new Promise((resolve) => {
				const command = `webtorrent --out ${dir} download ${req.body.magnet}`;
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
			res.sendFile(zip);
		} catch (error) {
			console.log(error);
			res.send({ error: `Error while downloading ${magnet}: ${error}` });
		}
	} else {
		res.send({ error: `req.body.magnet not present` });
	}
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("Torrent to gs listening on port", port);
});
