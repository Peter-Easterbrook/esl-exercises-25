import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "display"
    | "body-large"
    | "caption";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const titleColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "title",
  );

  return (
    <Text
      style={[
        { color: type === "title" || type === "display" ? titleColor : color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "display" ? styles.display : undefined,
        type === "body-large" ? styles.bodyLarge : undefined,
        type === "caption" ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "berlin-sans-fb",
    fontWeight: "normal",
    letterSpacing: 1,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "berlin-sans-fb-bold",
    letterSpacing: 1,
  },
  display: {
    fontSize: 42,
    lineHeight: 48,
    fontFamily: "berlin-sans-fb-bold",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontFamily: "berlin-sans-fb-bold",
    letterSpacing: 0.75,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "berlin-sans-fb",
    letterSpacing: 1.2,
    lineHeight: 28,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "berlin-sans-fb",
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "berlin-sans-fb",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: "berlin-sans-fb",
    fontWeight: "400",
    letterSpacing: 1,
    textDecorationLine: "underline",
    color: "#0a7ea4",
  },
});
