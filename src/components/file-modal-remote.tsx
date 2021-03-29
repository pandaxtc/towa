import isURL from "validator/es/lib/isURL";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import style from "./file-modal.module.css";
import { RemoteDZISource } from "./viewer";

type FormValues = {
  dziURL: string;
  tileURL?: string;
};

export default function RemoteFileModal({
  closeCallback,
  setImageCallback,
}: {
  closeCallback: () => void;
  setImageCallback: (image: RemoteDZISource) => void;
}) {
  const { register, errors, handleSubmit, formState } = useForm<FormValues>({
    mode: "onBlur",
  });

  const onSubmit = handleSubmit((e) => {
    setImageCallback({ dziURL: e.dziURL, filesURL: e.tileURL });
  });

  return (
    <div className={style.modal}>
      <h1 className={style.header}>Open from URL</h1>
      <form className={style.form} onSubmit={onSubmit}>
        <div className={style.inputHeader}>
          <label className={style.inputLabel} htmlFor="dziURL">
            .dzi URL*
          </label>
          <span className={style.inputError}>{errors.dziURL?.message}</span>
        </div>
        <input
          name="dziURL"
          id="dziURL"
          className={`${style.input}  ${
            errors.dziURL ? style.invalidInput : ""
          }`}
          placeholder="https://towa.dev/pyramid.dzi"
          ref={register({
            required: "required",
            validate: (url) => isURL(url) || "Not a URL!",
          })}
        ></input>
        <div className={style.inputHeader}>
          <label className={style.inputLabel} htmlFor="dziURL">
            Tile URL
          </label>
          <span className={style.inputError}>{errors.tileURL?.message}</span>
        </div>
        <input
          name="tileURL"
          id="tileURL"
          className={`${style.input} ${
            errors.tileURL ? style.invalidInput : ""
          }`}
          placeholder="https://towa.dev/pyramid_files/"
          ref={register({
            validate: (url) => url.trim() === "" || isURL(url) || "Not a URL!",
          })}
        ></input>
        <div className={style.buttonRow}>
          <button
            type="button"
            className={style.button}
            onClick={closeCallback}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={style.button}
            disabled={!formState.isValid || formState.isSubmitting}
          >
            Open
          </button>
        </div>
      </form>
    </div>
  );
}
