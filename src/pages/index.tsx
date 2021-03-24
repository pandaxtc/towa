import React from "react";
import { graphql } from "gatsby";
import { Helmet } from "react-helmet";
import Viewer from "../components/viewer";

// TODO: fix the typing errors on this component
export default function Index({ pageContext, data }) {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <html lang="en" />
        <title>towa</title>
        <meta
          name="description"
          content="towa is a web-based viewer and static site generator for DeepZoom (.dzi) images."
        ></meta>
      </Helmet>
      <Viewer imageToOpen={"name" in pageContext ? data.mosaicsJson : null} />
    </>
  );
}

export const query = graphql`
  query MosaicQuery($name: String) {
    mosaicsJson(name: { eq: $name }) {
      title
      name
      filesURL
      dziURL
      description
    }
  }
`;
