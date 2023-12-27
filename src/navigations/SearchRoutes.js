import { createStackNavigator } from "@react-navigation/stack";
import SearchScreen from "../screens/search/SearchScreen";
// import BarCodeScanScreen from "../screens/BarCodeScanScreen";
// import NewItemScreen from "../screens/home/NewItemScreen";
import { useLayoutEffect } from "react";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Platform } from "react-native";
import { Colors } from "../constants/styles";

const Stack = createStackNavigator();

export default function SearchRoutes({ navigation, route }) {
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
  }, [navigation, route]);
  return (
    <Stack.Navigator
      initialRouteName="SearchScreen"
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
        name="SearchScreen"
        component={SearchScreen}
        options={{
          title: "صفحة البحث",
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
