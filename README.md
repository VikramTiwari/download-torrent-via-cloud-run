# download-torrent-via-cloud-run

## NOTE: This is just a proof of concept. Use at your own risks.

## Setup

- Make sure to set concurrency to 1 on cloud run
- Set a max timeout limit for your cloud run instance to be low/high based on your need

## Build a container image

```sh
gcloud builds submit --tag gcr.io/PROJECT_ID/download-torrent-via-cloud-run
```

```sh
gcloud run deploy --image gcr.io/PROJECT_ID/download-torrent-via-cloud-run --platform managed
```

## Download via cURL

```sh
curl --location --request POST 'https://YOUR_APP_URL' --header 'Content-Type: application/json' --data-raw '{
    "magnet": "magnet:?xt"
}' --output ./result.zip
```
