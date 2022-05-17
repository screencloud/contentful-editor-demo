export interface ContentfulMappingConfig {
  name: string;
  contentType?: string;
  mapping?: {
    headline?: string;
    paragraph?: string;
    image?: string;
    slug?: string;
    brand?: string;
    type?: string;
    name?: string;
    price?: string;
    comparePrice?: string;
    author?: string;
    title?: string;
    pubDate?: string;
    productCategory?: string;
    priceSaving?: string;
    productImage?: string;
  };
}

export interface ContentfulConfigItem {
  sys?: {
    id: string;
  };
  name?: string;
  linkedFrom: {
    contentFeedCollection: {
      items: {
        name: string;
        sys: {
          id: string;
        };
      }[];
    };
  };
  contentType?: string;
  baseUrl?: string | null;
  mappingConfig?: ContentfulMappingConfig;
  constants?: {
    baseUrl: string;
  };
}

export interface ContentfulConfigResponse {
  contentMappingCollection: {
    items: ContentfulConfigItem[];
  };
}
