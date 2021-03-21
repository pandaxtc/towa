import React from "react";
import { graphql } from "gatsby";
import Viewer from "../components/viewer";

// TODO: fix the typing errors on this component
export default function Index({ pageContext, data }) {
  return <Viewer imageToOpen={data.mosaicsJson} />;
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
