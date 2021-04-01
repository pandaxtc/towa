import "@szhsin/react-menu/dist/index.css";

import OpenSeaDragon from "openseadragon";
import debounce from "lodash-es/debounce";
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router";

import FileMenu from "./file-menu";
import SquareButton from "./square-button";
import ZoomButton from "./zoom-button";
import style from "./viewer.module.css";

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
  imageToOpen,
  osdOptions,
  navTo,
}: {
  imageToOpen?: RemoteDZISource;
  osdOptions?: OpenSeaDragon.Options;
  navTo?: NavCoordinates;
}) {
  const [viewer, setViewer] = useState<OpenSeaDragon.Viewer | undefined>(
    undefined
  );
  const viewerRef = useRef<OpenSeaDragon.Viewer | undefined>();

  const [image, setImage] = useState<
    RemoteDZISource | LocalDZISource | undefined
  >(imageToOpen);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // ref to options, because changing the prop shouldn't do anything
  // we can't re-initialize the viewer :(
  const osdOptionRef = useRef(osdOptions);

  // used to set initial viewport
  const initialNavRef = useRef(navTo);

  // history is mutable, so this probably doesn't update...?
  const history = useHistory();

  // open image by URL
  const openRemoteImage = (
    viewer: OpenSeaDragon.Viewer,
    image: RemoteDZISource
  ) => {
    fetch(image.dziURL)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.text();
      })
      .then((res) => {
        let filesURL =
          // If no "_files" URL specified, assume "name_files" for "name.dzi"
          image.filesURL?.trim() ??
          (() => {
            let path = new URL(image.dziURL).pathname.split("/");
            let basename = path.pop()?.split(".")[0];
            return new URL(basename + "_files/", image.dziURL).href;
          })();

        if (!filesURL.endsWith("/")) {
          filesURL += "/";
        }

        let dzi = parseXMLDziString(res);
        dzi.Image.Url = filesURL;

        console.log(`opening image with dzi spec ${JSON.stringify(dzi)}`);

        viewer.open(dzi);
      })
      .catch((err) => {
        console.error(`Error: ${err.message}`);
      });
  };

  // Only available on Chrome because of FileSystem Access API support.
  const openLocalImage = async (
    viewer: OpenSeaDragon.Viewer,
    { dziHandle, filesHandle }: LocalDZISource
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

    viewer.open(tileSource);
  };

  // setup and teardown
  useEffect(() => {
    // @ts-ignore
    OpenSeaDragon.setImageFormatsSupported({ webp: true });

    const viewer = OpenSeaDragon({
      id: "osd-viewer",
      homeButton: HOME_BUTTON_ID,
      zoomInButton: ZOOM_IN_BUTTON_ID,
      zoomOutButton: ZOOM_OUT_BUTTON_ID,
      fullPageButton: FULLSCREEN_BUTTON_ID,
      ...DEFAULT_OSD_SETTINGS,
      ...osdOptionRef.current,
    });
    setViewer(viewer);

    viewer.addOnceHandler("open", () => {
      const navTo = initialNavRef.current;
      if (navTo?.x !== undefined && navTo?.y !== undefined) {
        viewer.viewport.panTo(new OpenSeaDragon.Point(navTo?.x, navTo?.y));
      }
      if (navTo?.level !== undefined) {
        viewer.viewport.zoomTo(navTo.level);
      }
    });

    // toggle fullscreen button appearance when fullscreen
    let fullscreenListener = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", fullscreenListener);

    return () => {
      console.log("cleaning up.");
      viewerRef.current?.destroy();
      document.removeEventListener("fullscreenchange", fullscreenListener);
    };
  }, []);

  // add pan/zoom listeners
  // add if imageToOpen, remove otherwise
  useEffect(() => {
    if (imageToOpen && viewer) {
      // updates route with image coordinates
      const updateHashRoute = debounce(() => {
        const center = viewer.viewport.getCenter();
        const zoom = viewer.viewport.getZoom();

        const navHash =
          "/" +
          center.x.toFixed(4) +
          "/" +
          center.y.toFixed(4) +
          "/" +
          zoom.toFixed(4);

        // prevent navigation loop...
        if (navHash !== window.location.hash.substr(1)) {
          history.replace(navHash);
        }
      }, 500);

      viewer.addHandler("pan", updateHashRoute);
      viewer.addHandler("zoom", updateHashRoute);

      return () => {
        viewer.removeHandler("pan", updateHashRoute);
        viewer.removeHandler("zoom", updateHashRoute);
      };
    }
  }, [imageToOpen, viewer, history]);

  // update image state when prop is updated
  // never actually used, I think?
  useEffect(() => {
    setImage(imageToOpen);
  }, [imageToOpen]);

  // keep viewer ref updated for cleanup on component unmount
  useEffect(() => {
    viewerRef.current = viewer;
  }, [viewer]);

  // open image when state is changed
  useEffect(() => {
    if (image && viewer) {
      if ("dziURL" in image) openRemoteImage(viewer, image);
      else openLocalImage(viewer, image);
    } else {
      viewer?.close();
    }
  }, [image, viewer]);

  // pan to new location when navTo updated
  useEffect(() => {
    if (navTo && viewer) {
      const center = viewer.viewport.getCenter();
      const zoom = viewer.viewport.getZoom();
      if (
        navTo.x !== undefined &&
        navTo.y !== undefined &&
        (navTo.x !== +center.x.toFixed(4) || navTo.y !== +center.y.toFixed(4))
      ) {
        viewer.viewport.panTo(new OpenSeaDragon.Point(navTo.x, navTo.y));
      }
      if (navTo.level !== undefined && navTo.level !== +zoom.toFixed(4)) {
        viewer.viewport.zoomTo(navTo.level);
      }
    }
  }, [navTo, image, viewer]);

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
