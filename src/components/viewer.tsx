import React from "react";
import { Link } from "gatsby";

export default function Viewer(props) {
  return (
    <div>
      <Link to="/hey/check/this/out">Click me.</Link>
      {props.params.key}
    </div>
  );
};

// TODO:
// render viewer component using createPage
// pass urls and such as pageContext prop