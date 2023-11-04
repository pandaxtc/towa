import React from "react";
import { useForm } from "react-hook-form";
import isURL from "validator/es/lib/isURL";

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
  const {
    register,
    formState: { errors },
    handleSubmit,
    formState,
  } = useForm<FormValues>({
    mode: "onBlur",
  });

  const onSubmit = handleSubmit((e) => {
    setImageCallback({
      dziURL: e.dziURL,
      filesURL: e.tileURL ? e.tileURL : undefined,
    });
    closeCallback();
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
          {...register("dziURL", {
            required: "required",
            validate: (url) => isURL(url) || "Not a URL!",
          })}
          id="dziURL"
          className={`${style.input} ${
            errors.dziURL ? style.invalidInput : ""
          }`}
          placeholder="https://towa.dev/pyramid.dzi"
        ></input>
        <div className={style.inputHeader}>
          <label className={style.inputLabel} htmlFor="tileURL">
            Tile URL
          </label>
          <span className={style.inputError}>{errors.tileURL?.message}</span>
        </div>
        <input
          id="tileURL"
          className={`${style.input} ${
            errors.tileURL ? style.invalidInput : ""
          }`}
          placeholder="https://towa.dev/pyramid_files/"
          {...register("tileURL", {
            validate: (url) =>
              url === undefined ||
              url.trim() === "" ||
              isURL(url) ||
              "Not a URL!",
          })}
        ></input>
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
            disabled={!formState.isValid || formState.isSubmitting}
          >
            Open
          </button>
        </div>
      </form>
    </div>
  );
}
