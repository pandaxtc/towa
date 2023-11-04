import React, { SyntheticEvent, useState } from "react";

import style from "./file-modal.module.css";
import { LocalDZISource } from "./viewer";

type FormErrors = { dziFile?: boolean; tileDir?: boolean };

export default function LocalFileModal({
  closeCallback,
  setImageCallback,
}: {
  closeCallback: () => void;
  setImageCallback: (image: LocalDZISource) => void;
}) {
  const [dziFile, setDziFile] = useState<FileSystemFileHandle | undefined>(
    undefined,
  );
  const [tileDir, setTileDir] = useState<FileSystemDirectoryHandle | undefined>(
    undefined,
  );

  const [errors, setErrors] = useState<FormErrors>();

  const openDziFile = async () => {
    try {
      const dziFile = (
        await window.showOpenFilePicker({
          multiple: false,
          excludeAcceptAllOption: true,
          types: [
            {
              description: "DeepZoom Image",
              accept: { "text/xml": [".dzi"] },
            },
          ],
        })
      )[0];
      setDziFile(dziFile);
      setErrors((errors) => {
        return { ...errors, dziFile: false };
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(`Error opening file: ${err.message}`);
      }
      setErrors((errors) => {
        return { ...errors, dziFile: true };
      });
    }
  };

  const openTileDir = async () => {
    try {
      setTileDir(await window.showDirectoryPicker());
      setErrors((errors) => {
        return { ...errors, tileDir: false };
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log(`Error opening directory: ${err.message}`);
      }
      setErrors((errors) => {
        return { ...errors, tileDir: true };
      });
    }
  };

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!dziFile || !tileDir) return;
    setImageCallback({ dziHandle: dziFile, filesHandle: tileDir });
    closeCallback();
  };

  return (
    <div className={style.modal}>
      <h1 className={style.header}>
        Open from file <small>(experimental)</small>
      </h1>
      <form className={style.form} onSubmit={onSubmit}>
        <div className={style.inputHeader}>
          <label className={style.inputLabel} htmlFor="dziFile">
            .dzi File*
          </label>
          {errors?.dziFile && (
            <span className={style.inputError}>Error opening file!</span>
          )}
        </div>
        <button
          type="button"
          id="dziFile"
          className={style.button}
          onClick={openDziFile}
        >
          <span className={style.buttonLabel}>
            {dziFile ? dziFile.name : "Choose File"}
          </span>
        </button>
        <div className={style.inputHeader}>
          <label className={style.inputLabel} htmlFor="tileDir">
            Tile Directory*
          </label>
          {errors?.tileDir && (
            <span className={style.inputError}>Error opening directory!</span>
          )}
        </div>
        <button
          type="button"
          id="tileDir"
          className={style.button}
          onClick={openTileDir}
        >
          <span className={style.buttonLabel}>
            {tileDir ? tileDir.name : "Choose Directory"}
          </span>
        </button>
        <div className={style.buttonRow}>
          <button
            type="button"
            className={`${style.button} ${style.submitButton}`}
            onClick={closeCallback}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${style.button} ${style.submitButton}`}
            disabled={!dziFile || !tileDir}
          >
            Open
          </button>
        </div>
      </form>
    </div>
  );
}
