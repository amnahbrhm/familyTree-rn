import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/profiles/ProfileScreen";
// import BarCodeScanScreen from "../screens/BarCodeScanScreen";
// import NewItemScreen from "../screens/home/NewItemScreen";
import { useLayoutEffect } from "react";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Platform } from "react-native";
import { Colors } from "../constants/styles";
const Stack = createStackNavigator();

export default function ProfileRoutes({ navigation, route }) {
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
    console.log(routeName);
  }, [navigation, route]);
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{
        // cardStyle: {
        //   backgroundColor: "red",
        // },
        headerBackground: () => {
          color: "#ECECFD";
        },
        headerTintColor: "#14134A",
      }}
    >
      {/* <Stack.Screen
        name="ScanScreen"
        component={BarCodeScanScreen}
        options={{
          title: "الماسح الضوئي",
        }}
      /> */}
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          title: "الملف الشخصي",
        }}
      />
      {/* <Stack.Screen
        name="AddItemScreen"
        component={NewItemScreen}
        options={{
          title: "اضافة منتج ",
          presentation: "modal",
          headerShown: Platform.OS === "ios" ? false : true,
        }}
      /> */}
    </Stack.Navigator>
  );
}
