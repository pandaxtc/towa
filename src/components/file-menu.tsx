import Modal from "react-modal";
import React, { useEffect, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuHeader,
  MenuItem,
} from "@szhsin/react-menu";

import RemoteFileModal from "./file-modal-remote";
import buttonStyle from "./square-button.module.css";
import style from "./file-menu.module.css";
import { ReactComponent as FolderIcon } from "../icons/folder_open-24px.svg";
import { ReactComponent as LinkIcon } from "../icons/link-24px.svg";
import { LocalDZISource, RemoteDZISource } from "./viewer";
import { ReactComponent as MenuIcon } from "../icons/more_horiz-24px.svg";

Modal.setAppElement("#root");
Object.assign(Modal.defaultStyles.overlay, {
  backgroundColor: "rgba(0, 0, 0, 0.3)",
});
Modal.defaultStyles.content = {
  display: "flex",
  background: "none",
  border: "none",
  width: "494px",
};

enum ModalType {
  none,
  file,
  remote,
}

export default function FileMenu({
  className,
  setImageCallback,
}: {
  className: string;
  setImageCallback: (image: RemoteDZISource | LocalDZISource) => void;
}) {
  const [openModal, setOpenModal] = useState(ModalType.none);

  const closeCallback = () => {
    setOpenModal(ModalType.none);
  };

  const supportsFileSystemAccessAPI =
    "showOpenFilePicker" in window && "showDirectoryPicker" in window;

  return (
    <>
      <Modal
        isOpen={openModal === ModalType.remote}
        onRequestClose={() => setOpenModal(ModalType.none)}
        closeTimeoutMS={200}
      >
        <RemoteFileModal
          setImageCallback={setImageCallback}
          closeCallback={closeCallback}
        />
      </Modal>
      <Menu
        className={style.fileMenu}
        offsetY={16}
        menuButton={
          <MenuButton className={`${className} ${buttonStyle.squareButton}`}>
            <MenuIcon className={buttonStyle.buttonIcon} />
          </MenuButton>
        }
      >
        <MenuHeader className={style.menuHeader}>File</MenuHeader>
        <MenuItem
          className={style.menuItem}
          onClick={() => {
            setOpenModal(ModalType.remote);
            return false;
          }}
        >
          <LinkIcon className={style.menuIcon} />
          <p className={style.menuItemText}>Open from URL</p>
        </MenuItem>
        <MenuItem
          title={
            !supportsFileSystemAccessAPI
              ? "Only supported on Chrome version 86 and above."
              : undefined
          }
          disabled={!supportsFileSystemAccessAPI}
          className={style.menuItem}
        >
          <FolderIcon className={style.menuIcon} />
          <p className={style.menuItemText}>Open from file</p>
        </MenuItem>
      </Menu>
    </>
  );
}
