import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import { Colors } from "../../constants/styles";
import { getTree } from "../../../util/http";

// Modal that lets an admin/moderator search the whole family by name and pick a
// person. Used to choose a mother/father/spouse/child to link.
export default function PersonPicker({
  visible,
  token,
  title,
  excludeId,
  sexFilter, // optional 'male' | 'famale'
  onPick,
  onClose,
}) {
  const [all, setAll] = useState(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || all) return;
    (async () => {
      try {
        setLoading(true);
        const tree = await getTree(token);
        setAll(tree.nodes || []);
      } catch (e) {
        setAll([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, all, token]);

  const results = useMemo(() => {
    if (!all) return [];
    const term = q.trim().toLowerCase();
    return all
      .filter((n) => n.id !== excludeId)
      .filter((n) => !sexFilter || n.sex === sexFilter)
      .filter(
        (n) =>
          !term ||
          (n.name || "").toLowerCase().includes(term) ||
          (n.id || "").toLowerCase().includes(term)
      )
      .slice(0, 60);
  }, [all, q, excludeId, sexFilter]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color={Colors.primary600} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.primary500} />
          <TextInput
            style={styles.input}
            placeholder="ابحث بالاسم أو الرقم التعريفي"
            placeholderTextColor="#9a9a9a"
            value={q}
            onChangeText={setQ}
            autoFocus
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary600} style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.5 }]}
                onPress={() => onPick(item)}
              >
                <Ionicons
                  name={item.sex === "famale" ? "woman" : "man"}
                  size={20}
                  color={item.sex === "famale" ? Colors.primary700 : "#3b5ba5"}
                />
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{item.fullname || item.firstname || item.name}</Text>
                  <Text style={styles.rowId}>{item.id}</Text>
                </View>
                {item.deceased ? <Text style={styles.dead}>متوفّى</Text> : null}
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>لا توجد نتائج</Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.primary100, paddingTop: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", color: Colors.primary600 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
    marginBottom: 8,
  },
  input: { flex: 1, marginHorizontal: 8, fontSize: 15, textAlign: "right", color: "#222" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
  },
  rowText: { flex: 1, marginHorizontal: 10 },
  rowName: { fontSize: 15, color: "#222", textAlign: "right" },
  rowId: { fontSize: 11, color: "#9a9a9a", textAlign: "right", marginTop: 2 },
  dead: { fontSize: 11, color: "#999" },
  empty: { textAlign: "center", color: "#999", marginTop: 30 },
});
