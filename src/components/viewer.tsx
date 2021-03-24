import OpenSeaDragon from "openseadragon";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import SquareButton from "../components/square-button";
import ZoomButton from "../components/zoom-button";
import FileMenu from "../components/file-menu";
import * as style from "./viewer.module.css";
import fileMenuStyle from "./file-menu.module.css";

interface LocalDZISource {}

export interface RemoteDZISpec {
  dziURL: string;
  filesURL?: string;
  title?: string;
  description?: string;
}

export interface ViewerOptions {
  showInfoPanel?: boolean;
  showFilePanel?: boolean;
}

interface XMLDZIObject {
  Image: {
    xmlns: string | null;
    Url?: string | null;
    Format: string | null;
    Overlap: string | number | null;
    TileSize: string | number | null;
    Size: {
      Height: string | number | null;
      Width: string | number | null;
    };
  };
}

const HOME_BUTTON_ID = "homeButton";
const ZOOM_IN_BUTTON_ID = "zoomInButton";
const ZOOM_OUT_BUTTON_ID = "zoomOutButton";
const MENU_BUTTON_ID = "menuButton";
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

// parses XML-format dzi string, and translates it into an object
function parseXMLDziString(dziString: string): XMLDZIObject {
  const xml = new DOMParser().parseFromString(dziString, "text/xml");
  const imageTag = xml.getElementsByTagName("Image")[0];
  const sizeTag = xml.getElementsByTagName("Size")[0];

  return {
    Image: {
      xmlns: imageTag.getAttribute("xmlns"),
      Format: imageTag.getAttribute("Format"),
      Overlap: imageTag.getAttribute("Overlap"),
      TileSize: imageTag.getAttribute("TileSize"),
      Size: {
        Height: sizeTag.getAttribute("Height"),
        Width: sizeTag.getAttribute("Width"),
      },
    },
  };
}

export default function Viewer({
  imageToOpen,
  osdOptions,
  viewerOptions,
}: {
  imageToOpen: RemoteDZISpec | null;
  osdOptions: OpenSeaDragon.Options | null;
  viewerOptions: ViewerOptions | null;
}) {
  const [viewer, setViewer] = useState<OpenSeaDragon.Viewer | null>(null);
  const [image, setImage] = useState<RemoteDZISpec | null>(imageToOpen);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // open image by URL
  const openRemoteImage = (
    viewer: OpenSeaDragon.Viewer,
    image: RemoteDZISpec
  ) => {
    fetch(image.dziURL)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.text();
      })
      .then((res) => {
        const filesURL =
          // If no "_files" URL specified, assume "name_files" for "name.dzi"
          image.filesURL ??
          (() => {
            let path = new URL(image.dziURL).pathname.split("/");
            let basename = path.pop()?.split(".")[0];
            return new URL(basename + "_files/", image.dziURL).href;
          })();

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
  const openLocalImage = async (viewer: OpenSeaDragon.Viewer) => {
    const [dziHandle] = await window.showOpenFilePicker();
    const filesHandle = await window.showDirectoryPicker();

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

  const InitOpenSeaDragon = () => {
    viewer?.destroy();
    setViewer(
      OpenSeaDragon({
        id: "osd-viewer",
        homeButton: HOME_BUTTON_ID,
        zoomInButton: ZOOM_IN_BUTTON_ID,
        zoomOutButton: ZOOM_OUT_BUTTON_ID,
        fullPageButton: FULLSCREEN_BUTTON_ID,
        ...DEFAULT_OSD_SETTINGS,
        ...osdOptions,
      })
    );
    OpenSeaDragon.setImageFormatsSupported({ webp: true });
  };

  useEffect(() => {
    InitOpenSeaDragon();

    // toggle fullscreen button appearance when fullscreen
    let fullscreenListener = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", fullscreenListener);

    return () => {
      viewer?.destroy();
      document.removeEventListener("fullscreenchange", fullscreenListener);
    };
  }, []);

  // open remote image when image is changed
  useEffect(() => {
    if (image && viewer) {
      openRemoteImage(viewer, image);
    }
  }, [image, viewer]);

  // TODO: add info panel component
  // [Panel animation]
  // Step 1: swap button for menudiv
  return (
    <div className={style.osdViewer} id="osd-viewer">
      <Helmet>
        {imageToOpen?.title && <title>{imageToOpen.title}</title>}
      </Helmet>
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
      {true && (
        <>
          <SquareButton
            className={style.menuButton}
            id={MENU_BUTTON_ID}
            icon="menu"
            onClick={() => setIsMenuOpen(val => !val)}
          />
          <FileMenu className={style.menu} isOpen={isMenuOpen}/>
        </>
      )}
      <SquareButton
        className={style.fullscreenButton}
        id={FULLSCREEN_BUTTON_ID}
        icon={!isFullscreen ? "fullscreen" : "exitFullscreen"}
      />
    </div>
  );
}
