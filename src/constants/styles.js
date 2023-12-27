import { StyleSheet } from "react-native";
export const Colors = {
  primary100: "#FAF7F6",
  primary200: "#F8F5F4",
  primary400:"#CDB3A8",
  primary500: "#B4806B",
  primary600: "#640233",
  primary700: "#B0578D",
  primary800: "#3b021f",
  accent400: "BDA9A0",
};

export const GeneralStyle = StyleSheet.create({
  title: {
    fontSize: 20,
    color: Colors.primary600,
    fontWeight: "bold",
  },
});

export const Padding = {
  sm: 10,
  md: 15,
  lg: 20,
};
