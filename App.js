import { StyleSheet, Button, Text, View } from "react-native";
import {useState} from "react"
import HomeRoutes from "./navigations/HomeRoutes";
import SearchRoutes from "./navigations/SearchRoutes";
import ProfileRoutes from "./navigations/ProfileRoutes";
import LoginScreen from "./screens/login/LoginScreen";
import OTPScreen from "./screens/login/OTPScreen";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "./constants/styles";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default async function App() {

  const isLoggedIn = false;
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#fff",
    },
  };
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer theme={navTheme}>
        {isLoggedIn ? (
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
        ) : (
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
        )}
      </NavigationContainer>
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
