import React, { ChangeEvent, Component, ReactNode } from "react";
import request from "superagent";
import debounce from "lodash.debounce";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { OnRequestConfigUpdateCallback } from "@screencloud/apps-editor-sdk/lib/types";
import { ContentfulConfigResponse } from "../../types/ContentfulConfigResponse";
import { ScreenCloudPlayer } from "../../providers/ScreenCloudPlayerProvider";
import ContentLogo from "../../images/contentful-logo.png";

const DEBOUNCE_INPUT_TIME_MS = 3000;

interface Props {
  sc: ScreenCloudPlayer;
}

interface State {
  apiKey: string;
  spaceId: string;
  mapName: string;
  mapNameOptions: {
    displayText: string;
    value: string;
  }[];
  playlistIdOptions: ContentfulPlaylistIdsMappingObject;
  playlistId: string;
}

interface Config {
  apiKey: string;
  spaceId: string;
  mapName: string;
  playlistId: string;
}

interface ContentfulPlaylistIdsMappingObject {
  [key: string]: {
    displayText: string;
    value: string;
  }[];
}

interface ContentfulOptionsMappingObject {
  playlistOptionsMappings: ContentfulPlaylistIdsMappingObject;
  mapNameOptions: {
    displayText: string;
    value: string;
  }[];
}

const contentfulConfigMapper = (
  config: ContentfulConfigResponse
): ContentfulOptionsMappingObject => {
  const playlistIdOptions: ContentfulPlaylistIdsMappingObject = {};
  const mapNameOptions: {
    displayText: string;
    value: string;
  }[] = [];

  config.contentMappingCollection.items.forEach((c) => {
    if (c && c.name) {
      mapNameOptions.push({
        displayText: c.name,
        value: c.name,
      });
      playlistIdOptions[c.name] = c.linkedFrom.contentFeedCollection.items.map(
        (item) => {
          return {
            displayText: item.name,
            value: item.sys.id,
          };
        }
      );
    }
  });

  return {
    playlistOptionsMappings: playlistIdOptions,
    mapNameOptions,
  };
};

const getContentfulConfig = async (spaceId: string, apiKey: string) => {
  const response = await request
    .post(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}?access_token=${apiKey}`
    )
    .send({
      query: `{
  contentMappingCollection {
    items {
      name
      linkedFrom {
        contentFeedCollection {
          items {
            name
            sys {
              id
            }
          }
        }
      }
    }
  }
}`,
    });

  return response.body.data;
};

export class AppContainer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mapName: this.props.sc.config?.mapName,
      spaceId: this.props.sc.config?.spaceId,
      apiKey: this.props.sc.config?.apiKey,
      playlistId: this.props.sc.config?.playlistId,
      mapNameOptions: [],
      playlistIdOptions: {},
    };

    props.sc.onRequestConfigUpdate?.(this.onRequestConfigUpdate);
  }

  onRequestConfigUpdate: OnRequestConfigUpdateCallback = () => {
    const config: Config = {
      apiKey: this.state.apiKey,
      spaceId: this.state.spaceId,
      mapName: this.state.mapName,
      playlistId: this.state.playlistId,
    };
    return Promise.resolve({ config });
  };

  getAndSetContentfulConfig: () => void = async () => {
    if (this.state.spaceId && this.state.apiKey) {
      try {
        const response = await getContentfulConfig(
          this.state.spaceId,
          this.state.apiKey
        );
        const { mapNameOptions, playlistOptionsMappings } =
          contentfulConfigMapper(response);
        this.setState({
          mapNameOptions,
          playlistIdOptions: playlistOptionsMappings,
        });
      } catch (error) {
        console.log("Error fetching contentful config");
        this.setState({
          mapNameOptions: [],
        });
      }
    }
  };

  async componentDidMount(): Promise<void> {
    await this.getAndSetContentfulConfig();
  }

  onApiKeyInput: (event: ChangeEvent<HTMLInputElement>) => void = async (
    event
  ) => {
    this.setState({
      mapNameOptions: [],
    });
    const apiKey = event.target.value;
    this.setState({
      apiKey,
    });
    if (
      apiKey.length >= 40 &&
      this.state.spaceId &&
      this.state.spaceId.length >= 10
    ) {
      await this.debouncedGetandSetContentfulConfig();
    }
  };

  onSpaceIdInput: (event: ChangeEvent<HTMLInputElement>) => void = async (
    event
  ) => {
    this.setState({
      mapNameOptions: [],
    });
    const spaceId = event.target.value;
    this.setState({
      spaceId,
    });
    if (
      spaceId.length > 10 &&
      this.state.apiKey &&
      this.state.apiKey.length >= 40
    ) {
      await this.debouncedGetandSetContentfulConfig();
    }
  };

  onMapNameSelected: (mapName: string) => void = async (mapName) => {
    this.setState({
      mapName,
    });
    this.props.sc.emitConfigUpdateAvailable?.();
  };

  onPlaylistIdSelected: (playlistId: string) => void = async (playlistId) => {
    this.setState({
      playlistId,
    });
    this.props.sc.emitConfigUpdateAvailable?.();
  };

  debouncedGetandSetContentfulConfig = debounce(
    this.getAndSetContentfulConfig,
    DEBOUNCE_INPUT_TIME_MS
  );

  render(): ReactNode {
    return (
      <div className="app-container">
        <div className={"app-container_form"}>
          <div className={"app-container_form_title"}>
            <img src={ContentLogo} alt={"Contentful App"} />
          </div>
          <div className={"app-container_form_input"}>
            <TextField
              className="input"
              type="text"
              name="apiKey"
              placeholder="Api Key"
              value={this.state.apiKey}
              onChange={this.onApiKeyInput}
            />
          </div>
          <div className={"app-container_form_input"}>
            <TextField
              className="input"
              type="text"
              name="spaceId"
              placeholder="Space Id"
              value={this.state.spaceId}
              onChange={this.onSpaceIdInput}
            />
          </div>
          {!!this.state.mapNameOptions.length && (
            <div className={"app-container_form_dropdown"}>
              <Select
                placeholder={"Map Name"}
                value={this.state.mapName}
                onChange={(event: SelectChangeEvent) => {
                  this.onMapNameSelected(event.target.value);
                }}
              >
                {this.state.mapNameOptions.map((option) => {
                  return (
                    <MenuItem key={`${option.value}`} value={`${option.value}`}>
                      {option.displayText}
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
          )}
          {this.state.playlistIdOptions[this.state.mapName] &&
            !!this.state.playlistIdOptions[this.state.mapName].length && (
              <div className={"app-container_form_dropdown"}>
                <Select
                  placeholder={"Playlist Id"}
                  value={this.state.playlistId}
                  onChange={(event: SelectChangeEvent) => {
                    this.onPlaylistIdSelected(event.target.value);
                  }}
                >
                  {this.state.playlistIdOptions[this.state.mapName].map(
                    (option) => {
                      return (
                        <MenuItem
                          key={`${option.value}`}
                          value={`${option.value}`}
                        >
                          {option.displayText}
                        </MenuItem>
                      );
                    }
                  )}
                </Select>
              </div>
            )}
        </div>
      </div>
    );
  }
}
