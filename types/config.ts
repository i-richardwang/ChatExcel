export type Theme =
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "";

export interface ConfigProps {
  appName: string;
  appDescription: string;
  domainName: string;
  crisp: {
    id: string;
    onlyShowOnRoutes: string[];
  };
  stripe: {
    plans: {
      priceId: string;
      name: string;
      description?: string;
      price: number;
      yearlyPrice?: number;
      priceAnchor?: number;
      yearlyPriceAnchor?: number;
      isFeatured?: boolean;
      features: {
        name: string;
      }[];
    }[];
  };
  aws: {
    bucket: string;
    bucketUrl: string;
    cdn: string;
  };
  resend: {
    fromNoReply: string;
    fromAdmin: string;
    supportEmail: string;
  };
  colors: {
    theme: string;
    main: string;
  };
  auth: {
    loginUrl: string;
    callbackUrl: string;
  };
}
