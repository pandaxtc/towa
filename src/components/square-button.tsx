import React from "react";
import FullscreenIcon from "../icons/fullscreen-24px.svg?react";
import ExitFullscreenIcon from "../icons/fullscreen_exit-24px.svg?react";
import HomeIcon from "../icons/home-24px.svg?react";
import style from "./square-button.module.css";

const BUTTON_ICONS: { [key: string]: any } = {
  home: HomeIcon,
  fullscreen: FullscreenIcon,
  exitFullscreen: ExitFullscreenIcon,
};

export default function SquareButton({
  icon,
  id,
  className,
  onClick,
}: {
  icon: string;
  id?: string;
  className?: string;
  onClick?: () => void;
}) {
  const Icon = BUTTON_ICONS[icon];
  return (
    <div className={className}>
      <button className={style.squareButton} onClick={onClick} id={id}>
        <Icon className={style.buttonIcon} />
      </button>
    </div>
  );
}
