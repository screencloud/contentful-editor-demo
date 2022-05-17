import React, { useContext, ReactNode, Component } from "react";
import { connectScreenCloud } from "@screencloud/apps-editor-sdk";
import {
  AppConfig,
  EmitConfigUpdateAvailable,
  OnRequestConfigUpdate,
} from "../apps-editor-sdk/lib/types";

export interface ScreenCloudPlayer {
  config?: AppConfig;
  onRequestConfigUpdate?: OnRequestConfigUpdate;
  emitConfigUpdateAvailable?: EmitConfigUpdateAvailable;
}

interface State {
  config?: AppConfig;
}

interface Props {
  children: ReactNode;
  testData: any;
}

const initialState = {
  config: undefined,
  onRequestConfigUpdate: undefined,
  emitConfigUpdateAvailable: undefined,
};

export const ScreenCloudPlayerContext =
  React.createContext<ScreenCloudPlayer>(initialState);

export class ScreenCloudPlayerProvider extends Component<Props, State> {
  onRequestConfigUpdate?: OnRequestConfigUpdate;
  emitConfigUpdateAvailable?: EmitConfigUpdateAvailable;

  constructor(props: Props) {
    super(props);
    this.state = {
      config: undefined,
    };
  }

  async componentDidMount() {
    let testData;
    if (process.env.NODE_ENV === "development") {
      testData = this.props.testData;
    }

    const sc = await connectScreenCloud(testData);

    const config = sc.getConfig();

    this.onRequestConfigUpdate = sc.onRequestConfigUpdate;
    this.emitConfigUpdateAvailable = sc.emitConfigUpdateAvailable;

    this.setState({
      config,
    });
  }

  render() {
    const props = {
      config: this.state.config,
      onRequestConfigUpdate: this.onRequestConfigUpdate,
      emitConfigUpdateAvailable: this.emitConfigUpdateAvailable,
    };

    return (
      <ScreenCloudPlayerContext.Provider value={props}>
        {this.state.config && this.props.children}
      </ScreenCloudPlayerContext.Provider>
    );
  }
}

export const useScreenCloudPlayer = (): ScreenCloudPlayer =>
  useContext(ScreenCloudPlayerContext);
