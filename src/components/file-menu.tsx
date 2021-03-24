import React from "react";
import File from "../icons/folder_open-24px.svg";
import Link from "../icons/link-24px.svg";
import * as style from "./file-menu.module.css";

export default function FileMenu({
  className,
  isOpen,
}: {
  className: string;
  isOpen: boolean;
}) {
  return (
    <div
      className={`${style.fileMenu} ${
        isOpen ? style.fileMenuOpen : ""
      } ${className}`}
    >
      <div className={style.menuSection}>
        <div className={style.menuHeader}>FILE</div>
        <div className={style.menuList}>
          <button className={style.menuItem}>
            <Link className={style.menuIcon} />
            <span className={style.menuItemText}>Open from URL</span>
          </button>
          <button className={style.menuItem}>
            <File className={style.menuIcon} />
            <span className={style.menuItemText}>Open from file</span>
          </button>
        </div>
      </div>
    </div>
  );
}
