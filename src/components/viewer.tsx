import "@szhsin/react-menu/dist/index.css";

import debounce from "lodash-es/debounce";
import OpenSeaDragon from "openseadragon";
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";

import FileMenu from "./file-menu";
import SquareButton from "./square-button";
import style from "./viewer.module.css";
import ZoomButton from "./zoom-button";

export interface LocalDZISource {
  dziHandle: FileSystemFileHandle;
  filesHandle: FileSystemDirectoryHandle;
}

export interface RemoteDZISource {
  dziURL: string;
  filesURL?: string;
  title?: string;
  description?: string;
}

interface XMLDZIObject {
  Image: {
    xmlns: string | null;
    Url?: string | null;
    Format: string | null;
    Overlap: number | null;
    TileSize: number | null;
    Size: {
      Height: number | null;
      Width: number | null;
    };
  };
}

interface NavCoordinates {
  x?: number;
  y?: number;
  level?: number;
}

const HOME_BUTTON_ID = "homeButton";
const ZOOM_IN_BUTTON_ID = "zoomInButton";
const ZOOM_OUT_BUTTON_ID = "zoomOutButton";
const FULLSCREEN_BUTTON_ID = "fullscreenButton";

const DEFAULT_OSD_SETTINGS: OpenSeaDragon.Options = {
  //homeFillsViewer: true,
  minZoomLevel: 0.65,
  zoomPerClick: 1.75,
  zoomPerSecond: 4,
  zoomPerScroll: 1.175,

  showNavigator: true,
  navigatorPosition: "TOP_RIGHT",
  navigatorBackground: "#fff",
  navigatorDisplayRegionColor: "#ff0000",
  navigatorSizeRatio: 0.15,
};

function getAttrOrDie(el: Element, attrName: string) {
  const res = el.getAttribute(attrName);
  if (res === null) throw new Error(`No such attribute ${attrName}`);
  return res;
}

function parseOrDie(numeric: string | undefined) {
  const res = Number(numeric);
  if (isNaN(res)) throw new Error(`"${numeric}" cannot be parsed as Number`);
  return res;
}

// parses XML-format dzi string, and translates it into an object
function parseXMLDziString(dziString: string): XMLDZIObject {
  const xml = new DOMParser().parseFromString(dziString, "text/xml");
  const imageTags = xml.getElementsByTagName("Image");
  const sizeTags = xml.getElementsByTagName("Size");

  if (imageTags.length < 1 || sizeTags.length < 1) {
    throw new Error("Bad XML schema");
  }

  const imageTag = imageTags[0];
  const sizeTag = sizeTags[0];

  return {
    Image: {
      xmlns: getAttrOrDie(imageTag, "xmlns"),
      Format: getAttrOrDie(imageTag, "Format"),
      Overlap: parseOrDie(getAttrOrDie(imageTag, "Overlap") ?? undefined),
      TileSize: parseOrDie(getAttrOrDie(imageTag, "TileSize") ?? undefined),
      Size: {
        Height: parseOrDie(getAttrOrDie(sizeTag, "Height") ?? undefined),
        Width: parseOrDie(getAttrOrDie(sizeTag, "Width") ?? undefined),
      },
    },
  };
}

export default function Viewer({
  imageToOpen, // navTo,
}: {
  imageToOpen?: RemoteDZISource;
  // navTo?: NavCoordinates;
}) {
  console.log(`RERENDER!!!!!!!!!!!!!!!!!!! ${JSON.stringify(imageToOpen)}`);

  const viewerRef = useRef<OpenSeaDragon.Viewer | undefined>(undefined);

  const [image, setImage] = useState<
    RemoteDZISource | LocalDZISource | undefined
  >(undefined);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // set initial viewport
  let initialNav: NavCoordinates | null = null;

  // open image by URL
  const openRemoteImage = async (
    viewer: OpenSeaDragon.Viewer,
    image: RemoteDZISource,
  ) => {
    const res = await fetch(image.dziURL);
    if (!res.ok)
      throw new Error(
        `Error ${res.status} requesting .dzi file: ${res.statusText}`,
      );
    const xml = await res.text();

    let filesURL =
      // If no "_files" URL specified, assume "name_files" for "name.dzi"
      image.filesURL?.trim() ??
      (() => {
        if (!image.dziURL.match(/\.dzi\/?\s*$/i)) {
          throw new Error("Cannot infer tile URL from .dzi URL!");
        }
        return image.dziURL.replace(/\.dzi\/?\s*$/i, "_files/");
      })();

    if (!filesURL.endsWith("/")) {
      filesURL += "/";
    }

    let dzi = parseXMLDziString(xml);
    dzi.Image.Url = filesURL;

    console.log(`opening remote image with dzi spec ${JSON.stringify(dzi)}`);

    viewer.open(dzi);
  };

  // Only available on Chrome because of FileSystem Access API support.
  const openLocalImage = async (
    viewer: OpenSeaDragon.Viewer,
    { dziHandle, filesHandle }: LocalDZISource,
  ) => {
    const dziFile: File = await dziHandle.getFile();
    const dziObject = parseXMLDziString(await dziFile.text());

    const tileSource = {
      fileHandle: filesHandle,
      height: dziObject.Image.Size.Height,
      width: dziObject.Image.Size.Width,
      tileSize: dziObject.Image.TileSize,
      tileOverlap: dziObject.Image.Overlap,
      getTileUrl: function (level: number, x: number, y: number) {
        return `${level}/${x}_${y}.${dziObject.Image.Format}`;
      },
    };

    console.log(
      `opening local image with dzi spec ${JSON.stringify(tileSource)}`,
    );

    viewer.open(tileSource);
  };

  // setup and teardown
  useEffect(() => {
    console.log("setup 1.");

    // toggle fullscreen button appearance when fullscreen
    let fullscreenListener = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", fullscreenListener);

    return () => {
      console.log("cleaning up.");
      document.removeEventListener("fullscreenchange", fullscreenListener);
    };
  }, []);

  useEffect(() => {
    // Create the viewer on initial render.
    if (viewerRef.current === undefined) {
      // @ts-ignore
      OpenSeaDragon.setImageFormatsSupported({ webp: true });

      console.log("creating viewer.");

      // only one viewer object is used throughout.
      const viewer = OpenSeaDragon({
        id: "osd-viewer",
        homeButton: HOME_BUTTON_ID,
        zoomInButton: ZOOM_IN_BUTTON_ID,
        zoomOutButton: ZOOM_OUT_BUTTON_ID,
        fullPageButton: FULLSCREEN_BUTTON_ID,
        ...DEFAULT_OSD_SETTINGS,
      });

      // nav to initial coordinates once.
      viewer.addOnceHandler("open", () => {
        let navTo: NavCoordinates | undefined = undefined;
        if (window.location.hash.length > 0) {
          const coords = window.location.hash.substring(2).split("/");

          if (coords.length === 3) {
            navTo = {
              x: parseOrDie(coords[0]),
              y: parseOrDie(coords[1]),
              level: parseOrDie(coords[2]),
            };
          }
        }

        console.log(`initial navto ${JSON.stringify(navTo)}`);

        if (navTo?.x !== undefined && navTo?.y !== undefined) {
          console.log(`panning to ${JSON.stringify(navTo)}`);
          viewerRef.current?.viewport.panTo(
            new OpenSeaDragon.Point(navTo.x, navTo.y),
            true,
          );
        }
        if (navTo?.level !== undefined) {
          viewerRef.current?.viewport.zoomTo(navTo.level, undefined, true);
        }
      });

      // updates route with image coordinates
      const updateHashRoute = debounce(() => {
        console.log("updating coords.");
        const center = viewer.viewport.getCenter();
        const zoom = viewer.viewport.getZoom();

        const navHash =
          "/" +
          center.x.toFixed(4) +
          "/" +
          center.y.toFixed(4) +
          "/" +
          zoom.toFixed(4);

        // prevent navigation loop, or updating when no image
        if (navHash !== window.location.hash.substring(1) && viewer.isOpen()) {
          window.location.hash = navHash;
        }
      }, 500);

      viewer.addHandler("pan", updateHashRoute);
      viewer.addHandler("zoom", updateHashRoute);

      viewerRef.current = viewer;
    }

    setImage(imageToOpen);
  }, []);

  // update image state when prop is updated
  // never actually used in this application, I think?
  useEffect(() => {
    setImage(imageToOpen);
  }, [imageToOpen]);

  // open image when state is changed
  useEffect(() => {
    console.log("running image effect.");
    const viewer = viewerRef.current;
    if (image && viewer) {
      console.log("opening image.");
      if ("dziURL" in image) openRemoteImage(viewer, image);
      else openLocalImage(viewer, image);
    } else {
      viewer?.close();
    }
  }, [image]);

  // TODO: add info panel component
  // TODO: handle errors when user gives bad dzi input
  return (
    <div className={style.osdViewer} id="osd-viewer">
      {imageToOpen && (
        <Helmet>
          <title>{imageToOpen.title ?? imageToOpen.dziURL}</title>
        </Helmet>
      )}
      <SquareButton
        className={style.homeButton}
        id={HOME_BUTTON_ID}
        icon="home"
      />
      <ZoomButton
        idZoomIn={ZOOM_IN_BUTTON_ID}
        idZoomOut={ZOOM_OUT_BUTTON_ID}
        className={style.zoomButton}
      />
      {!imageToOpen && (
        <FileMenu setImageCallback={setImage} className={style.menuButton} />
      )}
      <SquareButton
        className={style.fullscreenButton}
        id={FULLSCREEN_BUTTON_ID}
        icon={!isFullscreen ? "fullscreen" : "exitFullscreen"}
      />
    </div>
  );
}
