import { StyleSheet, Button, Text, View } from "react-native";
import { useState, useEffect, useContext } from "react";
import HomeRoutes from "./src/navigations/HomeRoutes";
import SearchRoutes from "./src/navigations/SearchRoutes";
import ProfileRoutes from "./src/navigations/ProfileRoutes";
import LoginScreen from "./src/screens/login/LoginScreen";
import OTPScreen from "./src/screens/login/OTPScreen";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "./src/constants/styles";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthContextProvider, { AuthContext } from "./src/store/auth-context";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,
        background: "red",
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Tab.Navigator
      initialRouteName="HomeRoutes"
      activeColor={Colors.primary500}
      inactiveColor={Colors.primary500}
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          display: "flex",
          position: "absolute",
          // bottom: 20,
          // left: 25,
          // right: 25,
          // elevation: 5,
          backgroundColor: Colors.primary200,
          borderRadius: 30,
          height: 80,
        },
        backgroundColor: "black",
        tabBarShowLabel: false,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="ProfileRoutes"
        component={ProfileRoutes}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                {
                  shadowRadius: focused ? 2 : 0,
                },
                styles.iconTab,
              ]}
            >
              <Ionicons
                name="person-outline"
                color={Colors.primary500}
                size={focused ? 26 : 21}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SearchRoutes"
        component={SearchRoutes}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                {
                  shadowRadius: focused ? 2 : 0,
                },
                styles.iconTab,
              ]}
            >
              <Ionicons
                name="search-outline"
                color={Colors.primary500}
                size={focused ? 26 : 21}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="HomeRoutes"
        component={HomeRoutes}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                {
                  shadowRadius: focused ? 2 : 0,
                },
                styles.iconTab,
              ]}
            >
              <Ionicons
                name="home-outline"
                color={Colors.primary500}
                size={focused ? 26 : 21}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function Navigation() {

  const authCtx = useContext(AuthContext);
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#fff",
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      {!authCtx.isAuthenticated && <AuthStack />}
      {authCtx.isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}
function Root() {
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    async function fetchToken() {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        authCtx.authenticate(storedToken, JSON.parse(storedUser));
      }
    }

    fetchToken();
  }, []);

  return <Navigation />;
}
export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AuthContextProvider>
        <Root />
      </AuthContextProvider>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    background: Colors.primary200,
    alignItems: "center",
    justifyContent: "center",
  },
  iconTab: {
    top: -2,
    flex: 1,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    // backgroundColor: 'black',
    shadowColor: "white",
    shadowOffset: { height: 1, right: 1 },
    shadowOpacity: 0.25,
  },
});
