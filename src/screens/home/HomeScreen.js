import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { WebView } from "react-native-webview";
import { Colors } from "../../constants/styles";
import {
  useLayoutEffect,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AuthContext } from "../../store/auth-context";
import { getTree } from "../../../util/http";
import { buildGraphHtml } from "./graphHtml";

function HomeScreen({ navigation }) {
  const authCtx = useContext(AuthContext);
  const webviewRef = useRef(null);
  const treeRef = useRef(null); // latest fetched graph data
  const readyRef = useRef(false); // webview reported 'ready'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("tree"); // 'tree' | 'graph'

  const html = buildGraphHtml(Colors);

  // Push graph data into the webview once BOTH the data and the webview are ready.
  const pushDataIfReady = useCallback(() => {
    if (readyRef.current && treeRef.current && webviewRef.current) {
      const payload = JSON.stringify(treeRef.current);
      webviewRef.current.injectJavaScript(
        `window.renderGraph(${payload}); true;`
      );
    }
  }, []);

  const loadTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTree(authCtx.token);
      treeRef.current = data;
      pushDataIfReady();
    } catch (e) {
      console.log("getTree error", e?.message);
      setError("تعذّر تحميل شجرة العائلة");
    } finally {
      setLoading(false);
    }
  }, [authCtx.token, pushDataIfReady]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Logout button in the header.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => authCtx.logout()}
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.primary600} />
        </Pressable>
      ),
    });
  }, [navigation, authCtx]);

  function onMessage(event) {
    let msg;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === "ready") {
      readyRef.current = true;
      pushDataIfReady();
    } else if (msg.type === "open" && msg.id) {
      // Jump to the tapped person's profile (Profile tab + its stack).
      navigation.navigate("ProfileRoutes", {
        screen: "ProfileScreen",
        params: { memberId: msg.id },
      });
    }
  }

  function runSearch() {
    const q = search.trim();
    if (!q || !webviewRef.current) return;
    const safe = JSON.stringify(q);
    webviewRef.current.injectJavaScript(`window.focusNode(${safe}); true;`);
  }

  function switchMode(m) {
    setMode(m);
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`window.setMode(${JSON.stringify(m)}); true;`);
    }
  }

  return (
    <View style={styles.screen}>
      {/* Native search box above the WebView */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.primary500} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث بالاسم أو الرقم التعريفي"
          placeholderTextColor="#9a9a9a"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={runSearch}
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <Ionicons
            name="close-circle"
            size={18}
            color="#bbb"
            onPress={() => setSearch("")}
          />
        ) : null}
      </View>

      {/* Tree / network view toggle */}
      <View style={styles.toggle}>
        {[
          { k: "tree", l: "شجرة", icon: "git-network-outline" },
          { k: "graph", l: "شبكة", icon: "share-social-outline" },
        ].map((o) => (
          <Pressable
            key={o.k}
            onPress={() => switchMode(o.k)}
            style={[styles.toggleBtn, mode === o.k && styles.toggleBtnActive]}
          >
            <Ionicons
              name={o.icon}
              size={16}
              color={mode === o.k ? "#fff" : Colors.primary600}
            />
            <Text style={[styles.toggleText, mode === o.k && styles.toggleTextActive]}>
              {o.l}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.graphContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
        />
        {loading ? (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={Colors.primary600} />
          </View>
        ) : null}
        {error ? (
          <View style={styles.overlay}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadTree} style={styles.retry}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 15,
    textAlign: "right",
    color: "#222",
  },
  toggle: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 3,
    marginBottom: 6,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary500,
  },
  toggleText: {
    fontSize: 13,
    color: Colors.primary600,
  },
  toggleTextActive: {
    color: "#fff",
  },
  graphContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 90, // clear the floating tab bar
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.primary100,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250,247,246,0.7)",
  },
  errorText: {
    color: Colors.primary600,
    fontSize: 15,
    marginBottom: 12,
  },
  retry: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
  },
  logout: {
    paddingHorizontal: 14,
  },
});