import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { DDDLogo } from "./DDDLogo";

const meta: Meta<typeof DDDLogo> = {
  title: "Components/DDDLogo",
  component: DDDLogo,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DDDLogo>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const _canvas = within(canvasElement);
    expect(canvasElement.querySelector("[class*='spread']")).toBeInTheDocument();
  },
};
