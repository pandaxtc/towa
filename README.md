# towa (WIP)
> A web-based viewer for DeepZoom (`.dzi`) images.

[![Netlify Status](https://api.netlify.com/api/v1/badges/a084f2f2-dab8-4e34-8c8f-f4873ff44086/deploy-status)](https://app.netlify.com/sites/towa-dzi/deploys)

The tool itself is located in an incomplete form at [towa.dev](https://towa.dev).

towa is built using [Vite](https://vitejs.dev/) and a fork of [OpenSeaDragon](https://github.com/pandaxtc/openseadragon).

## Installation

```
npm install
```

## Usage

The site comes with configurable routes. To add a route, add an object with config values to the `routes` array in `routes.json`.

```
[
  {
    "name": "duomo",
    "dziURL": "https://openseadragon.github.io/example-images/duomo/duomo.dzi",
    "filesURL": "https://openseadragon.github.io/example-images/duomo/duomo_files",
    "title": "Duomo",
    "description": "An italian cathedral."
  }
]
```

* `name` - specifies the name and route of the mosaic. It must be unique.
* `dziURL` - specifies the URL to the `.dzi` file. This can be a URL in `static/`.
* `filesURL` (optional) - specifies the URL to the `_files` directory. If omitted, the URL of the `.dzi` file will be implictly used (i.e. `static/duomo.dzi -> static/duomo_files/`).
* `title` (optional) - specifies the title of the image. This value will be used as the title of the site.
* `description` (optional) - gives a description of the image.

towa can only open remote `.dzi` files. The ability to open local files is planned.

By default, the index of the site routes to the viewer tool. You can disable this using `viewerAtIndex` in `routes.json`.

## License
[MIT](https://choosealicense.com/licenses/mit/)