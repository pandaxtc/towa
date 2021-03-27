import Modal from "react-modal";
import React, { useEffect, useState } from "react";

import RemoteFileModal from "./file-modal-remote";
import style from "./file-menu.module.css";
import { ReactComponent as File } from "../icons/folder_open-24px.svg";
import { ReactComponent as Link } from "../icons/link-24px.svg";
import { LocalDZISource, RemoteDZISource } from "./viewer";

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
  isOpen,
  setImageCallback,
}: {
  className: string;
  isOpen: boolean;
  setImageCallback: (image: RemoteDZISource | LocalDZISource) => void;
}) {
  const [openModal, setOpenModal] = useState(ModalType.none);

  const closeCallback = () => {
    setOpenModal(ModalType.none);
  };

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
      <div
        className={`${style.fileMenu} ${
          isOpen ? style.fileMenuOpen : ""
        } ${className}`}
      >
        <div className={style.menuSection}>
          <h2 className={style.menuHeader}>File</h2>
          <button
            className={style.menuItem}
            onClick={() => setOpenModal(ModalType.remote)}
          >
            <Link className={style.menuIcon} />
            <p className={style.menuItemText}>Open from URL</p>
          </button>
          <button
            className={style.menuItem}
            onClick={() => setOpenModal(ModalType.file)}
          >
            <File className={style.menuIcon} />
            <p className={style.menuItemText}>Open from file</p>
          </button>
        </div>
      </div>
    </>
  );
}
