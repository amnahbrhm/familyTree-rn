import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/home/HomeScreen";
// import BarCodeScanScreen from "../screens/BarCodeScanScreen";
// import NewItemScreen from "../screens/home/NewItemScreen";
import { useLayoutEffect } from "react";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Platform } from "react-native";
import { Colors } from "../constants/styles";
const Stack = createStackNavigator();

export default function HomeRoutes({ navigation, route }) {
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
    // if (routeName === "AddItemScreen") {
    //   navigation.setOptions({ tabBarStyle: { display: "none" } });
    // } else {
    //   navigation.setOptions({
    //     tabBarStyle: {
    //       display: "flex",
    //       position: "absolute",
    //       bottom: 20,
    //       left: 25,
    //       right: 25,
    //       elevation: 5,
    //       backgroundColor: Colors.primary200,
    //       borderRadius: 30,
    //       height: 60,
    //     },
    //   });
    // }
  }, [navigation, route]);
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        // cardStyle: {
        //   backgroundColor: "red",
        // },
        headerBackground: () => {
          color: "#ECECFD";
        },
        headerTintColor: Colors.primary600,
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
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: "الصفحة الرئيسية",
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
