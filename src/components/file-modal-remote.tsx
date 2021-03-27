import React, { useState } from "react";

import style from "./file-modal.module.css";
import { ReactComponent as ExitFullscreen } from "../icons/fullscreen_exit-24px.svg";
import { ReactComponent as Fullscreen } from "../icons/fullscreen-24px.svg";
import { ReactComponent as Home } from "../icons/home-24px.svg";
import { ReactComponent as Menu } from "../icons/more_horiz-24px.svg";
import { RemoteDZISource } from "./viewer";

export default function RemoteFileModal({
  closeCallback,
  setImageCallback,
}: {
  closeCallback?: () => void;
  setImageCallback: (image: RemoteDZISource) => void;
}) {
  const [dziURLField, setDziURLField] = useState<string>("");
  const [tileURLField, setTileURLField] = useState<string>("");

  const returnImageSource = () => {
    if (!dziURLField) return;
    setImageCallback({ dziURL: dziURLField, filesURL: tileURLField });
  };

  return (
    <div className={`${style.modal}`}>
      <h1 className={`${style.header}`}>Open from URL</h1>
      <h2>.dzi URL</h2>
      <input
        className={`${style.input}`}
        placeholder="https://towa.dev/pyramid.dzi"
        value={dziURLField}
        onChange={(e) => {
          setDziURLField(e.target.value);
        }}
      ></input>
      <h2>Tile URL (optional)</h2>
      <input
        className={`${style.input}`}
        placeholder="https://towa.dev/pyramid_files/"
        value={tileURLField}
        onChange={(e) => {
          setTileURLField(e.target.value);
        }}
      ></input>
      <div className={`${style.buttonRow}`}>
        <button className={`${style.button}`} onClick={closeCallback}>
          Cancel
        </button>
        <button className={`${style.button}`} onClick={returnImageSource}>
          Open
        </button>
      </div>
    </div>
  );
}
