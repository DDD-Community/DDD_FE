export const colors = {
  primary: "#2e71ff",
  /** 흰 글자를 올리는 primary 버튼 배경 — #2e71ff 는 흰 글자와 대비 4.27:1 이라 WCAG AA(4.5:1) 미달, 이 색은 4.60:1 */
  primaryStrong: "#2b6cf5",
  /** mainLight 배경 위 primary 글자 — #2e71ff 는 3.79:1, 이 색은 4.73:1 */
  primaryText: "#2563e0",
  background: "#0c0e0f",
  backgroundDark: "#1d212d",
  textPrimary: "#202325",
  textSecondary: "#525252",
  textInverse: "#ffffff",
  slate200: "#e2e8f0",
  slate300: "#cad5e2",
  slate500: "#90a1b9",
  mainLight: "#e7f3fe",
  border: "#c9c9c9",
  /** 비활성 CTA(모집 종료) 배경 */
  disabled: "#62748e",
  categoryBg: "#e9e9e9",
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;

export const fontSizes = {
  small: "14px",
  medium: "16px",
  large: "20px",
  headingMedium: "16px",
  headingLarge: "28px",
  headingXl: "40px",
  paragraphXxxl: "64px",
  paragraphXxxxl: "80px",
  headingXxl: "130px",
} as const;

export const lineHeights = {
  small: "18px",
  paragraphMedium: "20px",
  headingMedium: "20px",
  paragraphLarge: "25px",
  headingLarge: "32px",
  headingXl: "50px",
  paragraphXxxl: "75px",
  headingXxl: "130px",
} as const;
