import React from "react";
import menu from "../icons/more_horiz-24px.svg";
import home from "../icons/home-24px.svg";
import fullscreen from "../icons/fullscreen-24px.svg";
import * as style from "./square-button.module.css";

const BUTTON_ICONS: { [key: string]: string } = {
  menu,
  home,
  fullscreen,
};

export default function SquareButton({
  icon,
  id,
  className,
}: {
  icon: string;
  id: string;
  className: string;
}) {
  return (
    <div className={`${className} ${style.squareButton}`}>
      <button className={style.interiorButton} id={id}>
        <img src={BUTTON_ICONS[icon]}></img>
      </button>
    </div>
  );
}
