import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Colors } from "../../constants/styles";
import { updateMember, createMember } from "../../../util/http";

function Field({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

function ModalShell({ visible, title, onClose, onSave, saving, children }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color={Colors.primary600} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onSave} disabled={saving} hitSlop={10}>
            <Text style={[styles.save, saving && { opacity: 0.4 }]}>حفظ</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>{children}</ScrollView>
      </View>
    </Modal>
  );
}

// Edit the viewed member's scalar fields.
export function EditFieldsModal({ visible, token, profile, onClose, onSaved }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [sex, setSex] = useState(profile?.sex === "famale" ? "famale" : "male");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [deathDate, setDeathDate] = useState(profile?.deathDate ?? "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl ?? "");
  const [maritalStatus, setMaritalStatus] = useState(profile?.maritalStatus ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    try {
      setSaving(true);
      const updated = await updateMember(
        profile.id,
        { name, sex, birthDate, deathDate, photoUrl, maritalStatus },
        token
      );
      onSaved(updated);
    } catch (e) {
      Alert.alert("خطأ", e?.response?.data?.message || "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell visible={visible} title="تعديل الملف" onClose={onClose} onSave={save} saving={saving}>
      <Field label="الاسم" value={name} onChangeText={setName} />

      <Text style={styles.label}>الجنس</Text>
      <View style={styles.choiceRow}>
        {[{ k: "male", l: "ذكر" }, { k: "famale", l: "أنثى" }].map((o) => (
          <Pressable
            key={o.k}
            onPress={() => setSex(o.k)}
            style={[styles.choice, sex === o.k && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, sex === o.k && styles.choiceTextActive]}>{o.l}</Text>
          </Pressable>
        ))}
      </View>
      <Field label="تاريخ الميلاد" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" />
      <Field label="تاريخ الوفاة" value={deathDate} onChangeText={setDeathDate} placeholder="YYYY-MM-DD (فارغ = حي)" />
      <Field label="رابط الصورة" value={photoUrl} onChangeText={setPhotoUrl} placeholder="https://…" />

      <Text style={styles.label}>الحالة الاجتماعية</Text>
      <View style={styles.choiceWrap}>
        {(MARITAL_OPTIONS[sex] || MARITAL_OPTIONS.male).map((o) => (
          <Pressable
            key={o.value}
            onPress={() => setMaritalStatus(o.value)}
            style={[styles.choice, maritalStatus === o.value && styles.choiceActive]}
          >
            <Text
              style={[styles.choiceText, maritalStatus === o.value && styles.choiceTextActive]}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ModalShell>
  );
}

// Marital-status options. Stored value is canonical; the Arabic label is
// gendered (differs for men vs women).
const MARITAL_OPTIONS = {
  male: [
    { value: "single", label: "أعزب" },
    { value: "married", label: "متزوج" },
    { value: "divorced", label: "مطلّق" },
    { value: "widowed", label: "أرمل" },
  ],
  famale: [
    { value: "single", label: "عزباء" },
    { value: "married", label: "متزوجة" },
    { value: "divorced", label: "مطلّقة" },
    { value: "widowed", label: "أرملة" },
  ],
};

// Relation of the NEW person to the currently-viewed person.
const RELATIONS = [
  { key: "child", label: "ابن/ابنة" },
  { key: "father", label: "والد" },
  { key: "mother", label: "والدة" },
  { key: "spouse", label: "زوج/ة" },
  { key: "none", label: "بدون ربط" },
];

// Create a new profile, optionally linked to the viewed person.
export function AddProfileModal({ visible, token, current, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [sex, setSex] = useState("male");
  const [relation, setRelation] = useState("child");
  const [external, setExternal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Map relation + the current person's sex to the create-link fields, which
  // are expressed relative to the NEW person.
  function linksFor() {
    if (!current) return {};
    switch (relation) {
      case "child": // new is a child of current -> current is new's parent
        return current.sex === "male"
          ? { fatherId: current.id }
          : { motherId: current.id };
      case "father": // new is father of current
        return { childId: current.id };
      case "mother": // new is mother of current
        return { childId: current.id };
      case "spouse":
        return { spouseId: current.id };
      default:
        return {};
    }
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert("تنبيه", "الاسم مطلوب");
      return;
    }
    // Keep sex consistent with the chosen relation where it's implied.
    let finalSex = sex;
    if (relation === "father") finalSex = "male";
    if (relation === "mother") finalSex = "famale";
    try {
      setSaving(true);
      const created = await createMember(
        { name: name.trim(), sex: finalSex, external, ...linksFor() },
        token
      );
      onCreated(created);
    } catch (e) {
      Alert.alert("خطأ", e?.response?.data?.message || "تعذّر الإنشاء");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell visible={visible} title="إضافة ملف جديد" onClose={onClose} onSave={save} saving={saving}>
      {/* From the family, or married-in (external)? */}
      <Text style={styles.label}>نوع العضو</Text>
      <View style={styles.choiceRow}>
        {[
          { k: false, l: "من العائلة" },
          { k: true, l: "مصاهرة (خارجي)" },
        ].map((o) => (
          <Pressable
            key={String(o.k)}
            onPress={() => setExternal(o.k)}
            style={[styles.choice, external === o.k && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, external === o.k && styles.choiceTextActive]}>
              {o.l}
            </Text>
          </Pressable>
        ))}
      </View>

      <Field
        label={external ? "الاسم الكامل" : "الاسم الأول فقط"}
        value={name}
        onChangeText={setName}
        placeholder={external ? "مثال: نورة بنت عبدالله المنيع" : "مثال: نورة"}
      />
      <Text style={styles.hint}>
        {external
          ? "أدخل الاسم الكامل؛ سيُستخدم أول كلمة كاسم أول."
          : "أدخل الاسم الأول فقط؛ يُبنى الاسم الكامل من اسم الأب والجد."}
      </Text>

      <Text style={styles.label}>الجنس</Text>
      <View style={styles.choiceRow}>
        {[{ k: "male", l: "ذكر" }, { k: "famale", l: "أنثى" }].map((o) => (
          <Pressable
            key={o.k}
            onPress={() => setSex(o.k)}
            style={[styles.choice, sex === o.k && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, sex === o.k && styles.choiceTextActive]}>{o.l}</Text>
          </Pressable>
        ))}
      </View>

      {current ? (
        <>
          <Text style={styles.label}>العلاقة بـ {current.name}</Text>
          <View style={styles.choiceWrap}>
            {RELATIONS.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => setRelation(r.key)}
                style={[styles.choice, relation === r.key && styles.choiceActive]}
              >
                <Text style={[styles.choiceText, relation === r.key && styles.choiceTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.primary100, paddingTop: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: { fontSize: 18, fontWeight: "bold", color: Colors.primary600 },
  save: { fontSize: 16, fontWeight: "bold", color: Colors.primary600 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, color: "#555", textAlign: "right", marginBottom: 6, marginTop: 6 },
  hint: { fontSize: 11, color: "#9a9a9a", textAlign: "right", marginTop: 4, marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    textAlign: "right",
    color: "#222",
  },
  choiceRow: { flexDirection: "row", gap: 8 },
  choiceWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0d5d0",
  },
  choiceActive: { backgroundColor: Colors.primary500, borderColor: Colors.primary500 },
  choiceText: { color: "#555", fontSize: 14 },
  choiceTextActive: { color: "#fff" },
});
