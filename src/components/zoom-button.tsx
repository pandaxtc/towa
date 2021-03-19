import React from "react";
import plus from "../icons/add-24px.svg";
import minus from "../icons/remove-24px.svg";
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
        className={`${style.zoomInButton} ${style.zoomButton} ${style.interiorButton}`}
        id={idZoomIn}
      >
        <img src={plus}></img>
      </button>
      <hr className={style.line} />
      <button
        className={`${style.zoomOutButton} ${style.zoomButton} ${style.interiorButton}`}
        id={idZoomOut}
      >
        <img src={minus}></img>
      </button>
    </div>
  );
}
