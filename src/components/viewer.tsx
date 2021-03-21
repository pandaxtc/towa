import OpenSeaDragon from "openseadragon";
import React, { useEffect, useState } from "react";
import SquareButton from "../components/square-button";
import ZoomButton from "../components/zoom-button";
import * as style from "./viewer.module.css";

export interface DZISpec {
  dziURL: string;
  filesURL?: string;
  title?: string;
  description?: string;
}

export interface ViewerOptions {
  showInfoPanel?: boolean;
  showFilePanel?: boolean;
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

export default function Viewer({
  imageToOpen,
  osdOptions,
  viewerOptions,
}: {
  imageToOpen: DZISpec | null;
  osdOptions: OpenSeaDragon.Options | null;
  viewerOptions: ViewerOptions | null;
}) {
  const [viewer, setViewer] = useState<OpenSeaDragon.Viewer | null>(null);
  const [image, setImage] = useState<DZISpec | null>(imageToOpen);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const openRemoteImage = (viewer: OpenSeaDragon.Viewer, image: DZISpec) => {
    fetch(image.dziURL)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.text();
      })
      .then((res) => {
        // Assemble dzi XML into JSON object
        const xml = new DOMParser().parseFromString(res, "text/xml");
        const imageTag = xml.getElementsByTagName("Image")[0];
        const sizeTag = xml.getElementsByTagName("Size")[0];

        const filesURL =
          // If no "_files" URL specified, assume "name_files" for "name.dzi"
          image.filesURL ??
          (() => {
            let path = new URL(image.dziURL).pathname.split("/");
            let basename = path.pop()?.split(".")[0];
            return new URL(basename + "_files/", image.dziURL).href;
          })();

        const dzi = {
          Image: {
            xmlns: imageTag.getAttribute("xmlns"),
            Url: filesURL,
            Format: imageTag.getAttribute("Format"),
            Overlap: imageTag.getAttribute("Overlap"),
            TileSize: imageTag.getAttribute("TileSize"),
            Size: {
              Height: sizeTag.getAttribute("Height"),
              Width: sizeTag.getAttribute("Width"),
            },
          },
        };

        console.log(`opening image with dzi spec ${JSON.stringify(dzi)}`);

        viewer.open(dzi);
      })
      .catch((err) => {
        console.error(`Error: ${err.message}`);
      });
  };

  useEffect(() => {
    if (image && viewer) {
      openRemoteImage(viewer, image);
    }
  }, [image, viewer]);

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
  };

  useEffect(() => {
    InitOpenSeaDragon();

    let fullscreenListener = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", fullscreenListener);

    return () => {
      viewer?.destroy();
      document.removeEventListener("fullscreenchange", fullscreenListener);
    };
  }, []);

  // TODO: add info panel component
  return (
    <div className={style.osdViewer} id="osd-viewer">
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
      <SquareButton
        className={style.menuButton}
        id={MENU_BUTTON_ID}
        icon="menu"
      />
      <SquareButton
        className={style.fullscreenButton}
        id={FULLSCREEN_BUTTON_ID}
        icon={!isFullscreen ? "fullscreen" : "exitFullscreen"}
      />
    </div>
  );
}
