import "normalize.css";
import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "./containers/AppContainer/AppContainer";
import {
  ScreenCloudPlayerProvider,
  ScreenCloudPlayerContext,
} from "./providers/ScreenCloudPlayerProvider";
import { config as devConfig } from "./config.development";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <ScreenCloudPlayerProvider testData={devConfig}>
      <ScreenCloudPlayerContext.Consumer>
        {(sc) => (
          <div className="app-container">
            <AppContainer sc={sc} />
          </div>
        )}
      </ScreenCloudPlayerContext.Consumer>
    </ScreenCloudPlayerProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
