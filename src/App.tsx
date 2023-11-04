import React from "react";
import {Route, Switch} from "wouter";

import FourOhFour from "./404";
import routeConfig from "../routes.json";
import Viewer, { RemoteDZISource } from "./components/viewer";

function parseCoordinate(x: string | undefined) {
  if (x === undefined) return x;
  let n = parseFloat(x);
  return isNaN(n) ? undefined : n;
}

// function ZoomPanRouter(props: { imageToOpen: RemoteDZISource }) {
//   return (
//     <HashRouter>
//       <Routes>
//         <Route path={`/:x?/:y?/:level?`}>
//           <ViewerRouterShim {...props} />
//         </Route>
//         <Route path="*">
//           <FourOhFour />
//         </Route>
//       </Routes>
//     </HashRouter>
//   );
// }

export default function Index() {
  return (
    <Switch>
      {routeConfig.viewerAtIndex && (
        <Route key="/" path="/">
          <Viewer />
        </Route>
      )}
      {routeConfig.routes.map((route) => (
        <Route key={`${route.name}`} path={`/${route.name}`}>
          <Viewer imageToOpen={route} />
        </Route>
      ))}
      <Route key="*" path="*">
        <FourOhFour />
      </Route>
    </Switch>
  );
}
