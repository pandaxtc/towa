import React from "react";
import {
  BrowserRouter as Router,
  HashRouter,
  Route,
  Switch,
} from "react-router-dom";
import Viewer, { RemoteDZISpec } from "./components/viewer";
import routeConfig from "./routes.json";
import osdConfig from "./osd-config.json";
import FourOhFour from "./404";
import { Options } from "openseadragon";

function parseCoordinate(x: string | undefined) {
  if (x === undefined) return x;
  let n = parseFloat(x);
  return isNaN(n) ? undefined : n;
}

function ZoomPanRouter(props: {
  imageToOpen: RemoteDZISpec;
  osdConfig: Options;
}) {
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
            <Viewer osdOptions={osdConfig} />
          </Route>
        )}
        {routeConfig.routes.map((route) => (
          <Route path={`/${route.name}`}>
            <ZoomPanRouter imageToOpen={route} osdConfig={osdConfig} />
          </Route>
        ))}
        <Route path="*">
          <FourOhFour />
        </Route>
      </Switch>
    </Router>
  );
}
