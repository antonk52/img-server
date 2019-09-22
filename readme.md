# Simple img server

Here is a simple http server for serving and resizing images. You can get the same functionality and more from AWS but isn't it just fun to learn the caveats while building such things?

## Setup

```sh
git clone
cd img-server
yarn
```

### Development

```sh
yarn run dev
```

In development besides the local server you also get:

- restart on change using `nodemon`
- home page with a form to submit new images

### Production

```sh
yarn start
```

## Usage

There are two main ways one can interact with this image server ie upload an image and request an image. If you are in development mode you can visit home page and submit your image, otherwise you you can upload one using `/api/add-img` endpoint. In response you get an object with image ID. You can use this ID to request the same image either the original by referring to it as `http://localhost:3000/<imageID>` or get a resized and modified image. Example `http://localhost:3000/<imageID>.jpg?width=300&quality=75&lossless=1`. Note the extension `.jpg` which is optional. Accepted values are `webp`, `png`, `jpg`, `jpeg`. If extension is not provided we look up the `Accept` header and if supported a `webp` image will be supplied otherwise it falls back to `jpg`.

Query parameters:

- `width` or `w` accepts a `Number`
- `height` or `h` accepts a `Number`
- `quality` or `q` accepts a `Number` between 1 and 100
- `progressive` or `prog` accepts a `Number` 0 or 1
- `lossless` accepts a `Number` 0 or 1 (only used for `webp` images)
