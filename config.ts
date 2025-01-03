import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "ChatExcel",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "AI-powered Excel automation tool that processes your data privately in your browser. Transform complex Excel tasks into simple conversations.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "chatexcel.org",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QZDyWBZOyB4SFLpDR0sSfz0"
            : "price_456",
        yearlyPriceId:
          process.env.NODE_ENV === "development"
            ? "price_1QZDyoBZOyB4SFLpX7VR2aQV"  // This should be your actual yearly price ID
            : "price_457",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Basic",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Perfect for individual users",
        // The price you want to display, the one user will be charged on Stripe.
        price: 9.9,
        yearlyPrice: 99,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 19.9,
        yearlyPriceAnchor: 199,
        features: [
          { name: "500 advanced AI operations/mo" },
          { name: "Browser-based processing" },
          { name: "Complete data privacy" },
          { name: "All Excel operations supported" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QZmX1BZOyB4SFLp7i58ehho"
            : "price_456",
        yearlyPriceId:
          process.env.NODE_ENV === "development"
            ? "price_1QZmXNBZOyB4SFLpiHbMrYxA"  // This should be your actual yearly price ID
            : "price_458",
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: "Pro",
        description: "For power users and teams",
        price: 19.9,
        yearlyPrice: 199,
        priceAnchor: 29.9,
        yearlyPriceAnchor: 299,
        features: [
          { name: "1,000 advanced AI operations/mo" },
          { 
            name: "100 multi-step Agent operations",
            tooltip: "Better for complex tasks like data cleaning, multi-sheet analysis, and custom visualizations"
          },
          { name: "Browser-based processing" },
          { name: "Complete data privacy" },
          { name: "All Excel operations supported" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp7iftKnrrpw"
            : "price_456",
        // No yearly price ID needed for lifetime plan since it's a one-time payment
        name: "Lifetime",
        description: "Limited to first 500 early supporters",
        price: 499,
        yearlyPrice: 499,
        priceAnchor: 999,
        yearlyPriceAnchor: 999,
        features: [
          { name: "All Pro features included" },
          { name: "Lifetime access" },
          { name: "Never pay again" },
          { name: "Early supporter benefits" },
          { name: "Limited to 500 seats" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "",
    bucketUrl: ``,
    cdn: "",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `ChatExcel <noreply@chatexcel.org>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `ChatExcel Support <support@chatexcel.org>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@chatexcel.org",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
