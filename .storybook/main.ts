import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    // react-docgen chokes on some upstream Flexprice files (e.g. ObjectMethod syntax in
    // ServiceAccounts.tsx). Our stories declare argTypes explicitly, so disabling the
    // auto-docgen plugin doesn't cost us anything in the production build.
    reactDocgen: false,
  },
};
export default config;
