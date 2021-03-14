# download-torrent-via-cloud-run

## NOTE: This is just a proof of concept. Use at your own risks.

## How it works

- Get magnet URL for the torrent that you want to download
- Encode the URL with `encodeURIComponent`. This can be done in browser console.

```js
encodeURIComponent("magnet:?xt...");
```

- Send a cURL request with encoded `magnet` in query parameter

```sh
curl --location --request GET 'https://YOUR_APP_URL?magnet=magnet=magnet%3A%3Fxt%3...' --output ./result.zip
```

- The server will use `decodeURIComponent` to get the proper magnet
- It will then use `webtorrent-cli` to start a download
- The files will be downloaded in `downloads` directory
- Once all the files are downloaded, they will be zipped into a single file `result.zip`
- This file will be returned as response stream. Remember to use `--output` parameter in curl

### Benefits

- The traffic detected by your ISP/firewalls is normal network traffic and not torrent traffic
- Once deployed, you can use it from a simple command line, no need for any torrent clients
- When used on cloud run or similar serverless environments, the instances are deleted after use, so no long running VMs and their upkeep/pricing.

### Limitations

- You can't use this for seeing torrents
- You shouldn't use this to download illegal or pirated content
- You shouldn't use this for long running or heavy download jobs

## Setup

This project will work on any server/serverless environment that supports

- streaming responses
- a filesystem or simulation of filesystem (using RAM)
- deploying code directly or via docker like containers

The goal of this repo is to serve as a proof of concept for Google Cloud's Cloud Run.

Instructions specific for Cloud Run:

- Choose the RAM and CPU size carefully. You need it to store your downloaded file as well as provide enough space to zip that file. Choosing 4G RAM and 1vCPU should be good for most use cases.
- Make sure to set concurrency to 1 on cloud run. We want each container to handle only 1 request from downloading and zipping to responding back with the zipped file
- Set a max timeout limit for your cloud run instance to be low/high based on your need. Remember that max is 1 hour and good torrents should download fairly quickly

### Build a container image

```sh
gcloud builds submit --tag gcr.io/PROJECT_ID/download-torrent-via-cloud-run
```

### Deploy on Cloud Run

```sh
gcloud run deploy --image gcr.io/PROJECT_ID/download-torrent-via-cloud-run --platform managed
```
