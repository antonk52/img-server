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
