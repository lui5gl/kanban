import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

export const ZincPreset = definePreset(Aura, {
  primitive: {
    zinc: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#9f9fa9",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },
  },
  semantic: {
    primary: {
      50: "{zinc.50}",
      100: "{zinc.100}",
      200: "{zinc.200}",
      300: "{zinc.300}",
      400: "{zinc.400}",
      500: "{zinc.500}",
      600: "{zinc.600}",
      700: "{zinc.700}",
      800: "{zinc.800}",
      900: "{zinc.900}",
      950: "{zinc.950}",
    },
    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          50: "{zinc.50}",
          100: "{zinc.100}",
          200: "{zinc.200}",
          300: "{zinc.300}",
          400: "{zinc.400}",
          500: "{zinc.500}",
          600: "{zinc.600}",
          700: "{zinc.700}",
          800: "{zinc.800}",
          900: "{zinc.900}",
          950: "{zinc.950}",
        },
        primary: {
          color: "{primary.500}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.600}",
          activeColor: "{primary.700}",
        },
      },
      dark: {
        surface: {
          0: "#09090b",
          50: "#18181b",
          100: "#27272a",
          200: "#2e2e33",
          300: "#3f3f46",
          400: "#52525b",
          500: "#71717a",
          600: "#9f9fa9",
          700: "#d4d4d8",
          800: "#e4e4e7",
          900: "#f4f4f5",
          950: "#fafafa",
        },
        primary: {
          color: "{primary.400}",
          contrastColor: "#09090b",
          hoverColor: "{primary.300}",
          activeColor: "{primary.200}",
        },
      },
    },
  },
});
