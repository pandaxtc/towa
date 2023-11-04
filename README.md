# towa (WIP)
> A web-based viewer for DeepZoom (`.dzi`) images.

[![Deploy to Pages](https://github.com/pandaxtc/towa/actions/workflows/deploy.yml/badge.svg)](https://github.com/pandaxtc/towa/actions/workflows/deploy.yml)

towa is a web-based [DeepZoom](https://en.wikipedia.org/wiki/Deep_Zoom) image viewer built using [Vite](https://vitejs.dev/) and a [fork of OpenSeaDragon](https://github.com/pandaxtc/openseadragon) that implements support for viewing on-disk DeepZoom pyramids in browsers that support the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API).

Routes can be defined in `routes.json` to use towa to serve and display predefined DeepZoom pyramids for various purposes.

The tool itself is located at [towa.dev](https://towa.dev).

## Installation

Clone the repo, then

```
npm install
```

To build the site,

```
npm run build
```

and the site files will be available in `dist/`.

## Usage

The site comes with configurable routes that can serve predefined DeepZoom pyramids. To create a route, add an object with configuration values to the `routes` array in `routes.json`.

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
* `dziURL` - specifies the URL to the `.dzi` file. This can be a URL in `public/`. Note that the contents of `public/` will be available in the root directory of the site after it is built (i.e. `public/mosaics/duomo.dzi -> /mosaics/duomo.dzi`).
* `filesURL` -  (optional) specifies the URL to the `_files` directory. If omitted, the URL of the `.dzi` file will be implictly used (i.e. `duomo.dzi -> duomo_files/`).
* `title` - (optional) specifies the title of the image. This value will be used as the title of the site.
* `description` - (optional) gives a description of the image.

By default, the index of the site routes to the viewer tool. You can disable this by setting `viewerAtIndex` to `false` in `routes.json`.

### URL Parameters

When viewing a predefined route, the viewer will update the URL with hash parameters containing the current focus and zoom. This can be used to link to specific locations in an image. For example, [this link](https://towa.dev/duomo#/0.5972/0.2309/10.6333)

```
https://towa.dev/duomo#/0.5972/0.2309/10.6333
```

will take you to focus `(0.5972, 0.2309)` and zoom level `10.6333` in the `duomo` image.


## License
[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgements

Inspired by [osd-dzi-viewer](https://github.com/davidmcclure/osd-dzi-viewer/).
