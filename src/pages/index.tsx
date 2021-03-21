import React from "react";
import { graphql } from "gatsby";
import Viewer from "../components/viewer";

// TODO: fix the typing errors on this component
export default function Index({ pageContext, data }) {
  return (
    <Viewer imageToOpen={"name" in pageContext ? data.mosaicsJson : null} />
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
