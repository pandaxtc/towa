import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Viewer from "./components/viewer";
import routeConfig from "./routes.json";
import osdConfig from "./osd-config.json";
import FourOhFour from "./404";

function parseCoordinate(x: string | undefined) {
  if (x === undefined) return x;
  let n = parseInt(x);
  return isNaN(n) ? undefined : n;
}

export default function Index() {
  return (
    <HashRouter hashType="noslash">
      <Switch>
        {routeConfig.viewerAtIndex && (
          <Route exact path="/">
            <Viewer osdOptions={osdConfig} />
          </Route>
        )}
        {routeConfig.routes.map((route) => (
          <Route
            exact
            path={`/${route.name}/:x?/:y?/:level?`}
            render={({ match }) => {
              return (
                <Viewer
                  imageToOpen={route}
                  osdOptions={osdConfig}
                  navTo={{
                    x: parseCoordinate(match.params["x"]),
                    y: parseCoordinate(match.params["y"]),
                    level: parseCoordinate(match.params["level"]),
                  }}
                />
              );
            }}
          ></Route>
        ))}
        <Route path="*">
          <FourOhFour />
        </Route>
      </Switch>
    </HashRouter>
  );
}
