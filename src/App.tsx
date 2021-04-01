import React from "react";
import { Options } from "openseadragon";
import {
  BrowserRouter as Router,
  HashRouter,
  Route,
  Switch,
} from "react-router-dom";

import FourOhFour from "./404";
import routeConfig from "../routes.json";
import Viewer, { RemoteDZISource } from "./components/viewer";

function parseCoordinate(x: string | undefined) {
  if (x === undefined) return x;
  let n = parseFloat(x);
  return isNaN(n) ? undefined : n;
}

function ZoomPanRouter(props: { imageToOpen: RemoteDZISource }) {
  return (
    <HashRouter>
      <Switch>
        <Route
          exact
          path={`/:x?/:y?/:level?`}
          render={({ match }) => {
            return (
              <Viewer
                {...props}
                navTo={{
                  x: parseCoordinate(match.params["x"]),
                  y: parseCoordinate(match.params["y"]),
                  level: parseCoordinate(match.params["level"]),
                }}
              />
            );
          }}
        ></Route>
        <Route path="*">
          <FourOhFour />
        </Route>
      </Switch>
    </HashRouter>
  );
}

export default function Index() {
  return (
    <Router>
      <Switch>
        {routeConfig.viewerAtIndex && (
          <Route exact path="/">
            <Viewer />
          </Route>
        )}
        {routeConfig.routes.map((route) => (
          <Route path={`/${route.name}`}>
            <ZoomPanRouter imageToOpen={route} />
          </Route>
        ))}
        <Route path="*">
          <FourOhFour />
        </Route>
      </Switch>
    </Router>
  );
}
