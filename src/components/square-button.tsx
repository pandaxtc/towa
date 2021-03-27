import React from "react";
import {ReactComponent as Menu} from "../icons/more_horiz-24px.svg";
import {ReactComponent as Home} from "../icons/home-24px.svg";
import {ReactComponent as Fullscreen} from "../icons/fullscreen-24px.svg";
import {ReactComponent as ExitFullscreen} from "../icons/fullscreen_exit-24px.svg"
import style from "./square-button.module.css";

const BUTTON_ICONS: { [key: string]: any } = {
  menu: Menu,
  home: Home,
  fullscreen: Fullscreen,
  exitFullscreen: ExitFullscreen
};

export default function SquareButton({
  icon,
  id,
  className,
  onClick
}: {
  icon: string;
  id: string;
  className: string;
  onClick?: () => void;
}) {
  const Icon = BUTTON_ICONS[icon]
  return (
    <div className={className}>
      <button className={style.squareButton} onClick={onClick} id={id}>
        <Icon className={style.buttonIcon}/>
      </button>
    </div>
  );
}
