import React from "react";
import Plus from "../icons/add-24px.svg";
import Minus from "../icons/remove-24px.svg";
import * as style from "./zoom-button.module.css";

export default function ZoomButton({
  idZoomIn,
  idZoomOut,
  className,
}: {
  idZoomIn: string;
  idZoomOut: string;
  className: string;
}) {
  return (
    <div className={`${style.zoomButtonDiv} ${className}`}>
      <button
        className={`${style.zoomButton} ${style.zoomInButton}`}
        id={idZoomIn}
      >
        <Plus
          className={`${style.zoomButtonIcon} ${style.zoomInButtonIcon}`}
        />
      </button>
      <hr className={style.line} />
      <button
        className={`${style.zoomButton} ${style.zoomOutButton}`}
        id={idZoomOut}
      >
        <Minus
          className={`${style.zoomButtonIcon} ${style.zoomOutButtonIcon}`}
        />
      </button>
    </div>
  );
}
