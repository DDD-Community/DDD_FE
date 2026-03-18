import type { Preview } from "@storybook/react";
import "../global.css";
import "../tokens/colors.css.ts";
import "../tokens/typography.css.ts";
import "../tokens/spacing.css.ts";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
