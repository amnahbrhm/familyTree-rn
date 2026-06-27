import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Colors } from "../../constants/styles";
import { useEffect, useLayoutEffect, useState, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../../store/auth-context";
import {
  getMember,
  setParent,
  addSpouse,
  addChild,
  removeParent,
  removeSpouse,
  removeChild,
} from "../../../util/http";
import PersonPicker from "./PersonPicker";
import { EditFieldsModal, AddProfileModal } from "./EditModals";

// --- small helpers ----------------------------------------------------------

// Year out of a 'YYYY-MM-DD' string (avoids timezone surprises).
function year(dateStr) {
  return dateStr ? String(dateStr).slice(0, 4) : null;
}

function genderLabel(sex) {
  return sex === "famale" ? "أنثى" : "ذكر";
}

// A spouse's status badge text + color, gender-aware.
// "widowed" is derived: the spouse is deceased and the marriage isn't divorced.
function spouseBadge(spouse) {
  const fem = spouse.sex === "famale";
  if (spouse.status === "divorced") {
    const y = year(spouse.divorceDate);
    return { text: (fem ? "مطلّقة" : "مطلّق") + (y ? ` ${y}` : ""), color: "#9E9E9E" };
  }
  if (spouse.deceased) {
    const y = year(spouse.deathDate);
    return { text: (fem ? "متوفّاة" : "متوفّى") + (y ? ` ${y}` : ""), color: "#616161" };
  }
  const y = year(spouse.marriageDate);
  return {
    text: (fem ? "متزوجة" : "متزوج") + (y ? ` منذ ${y}` : ""),
    color: Colors.primary600,
  };
}

// --- presentational components ----------------------------------------------

function Avatar({ photoUrl, sex, size = 56 }) {
  const radius = { width: size, height: size, borderRadius: size / 2 };
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={[styles.avatar, radius]} />;
  }
  const fem = sex === "famale";
  return (
    <View
      style={[
        styles.avatar,
        radius,
        styles.avatarPlaceholder,
        { backgroundColor: fem ? "#F3D9E4" : "#D9E2F3" },
      ]}
    >
      <Ionicons
        name={fem ? "woman" : "man"}
        size={size * 0.55}
        color={fem ? Colors.primary700 : "#3b5ba5"}
      />
    </View>
  );
}

// A tappable relative row. `onRemove`, when provided, shows an unlink (✕) button.
function PersonRow({ person, subtitle, onPress, badge, onRemove }) {
  if (!person) return null;
  const ageText =
    person.deceased && (year(person.birthDate) || year(person.deathDate))
      ? `${year(person.birthDate) ?? "?"}–${year(person.deathDate) ?? "?"}${
          person.age != null ? ` (${person.age})` : ""
        }`
      : person.age != null
      ? `${person.age} سنة`
      : null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar photoUrl={person.photoUrl} sex={person.sex} size={48} />
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{person.fullname || person.name}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
        {!subtitle && ageText ? <Text style={styles.rowSub}>{ageText}</Text> : null}
      </View>
      {badge ? (
        <View style={[styles.badge, { borderColor: badge.color }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      ) : null}
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="close-circle" size={22} color="#c0392b" />
        </Pressable>
      ) : null}
      <Ionicons name="chevron-back" size={18} color={Colors.primary400} />
    </Pressable>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// A child row that can be long-pressed and dragged onto a spouse section to
// assign that spouse as the child's mother. `activateAfterLongPress` lets quick
// scrolls still scroll the page; a long-press lifts the row for dragging.
function DraggableChild({ child, onPickup, onDrop, onPress, onRemove, isDragging }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const lastAbs = useRef({ x: 0, y: 0 });

  function onGestureEvent(e) {
    const { translationX, translationY, absoluteX, absoluteY } = e.nativeEvent;
    pan.setValue({ x: translationX, y: translationY });
    lastAbs.current = { x: absoluteX, y: absoluteY };
  }

  function onStateChange(e) {
    const s = e.nativeEvent.state;
    if (s === State.ACTIVE) {
      onPickup(child.id);
    } else if (s === State.END || s === State.CANCELLED || s === State.FAILED) {
      const point = lastAbs.current;
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      onDrop(child, point);
    }
  }

  return (
    <PanGestureHandler
      activateAfterLongPress={220}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onStateChange}
    >
      <Animated.View
        style={[
          { transform: pan.getTranslateTransform() },
          isDragging && styles.draggingRow,
        ]}
      >
        <PersonRow person={child} onPress={onPress} onRemove={onRemove} />
      </Animated.View>
    </PanGestureHandler>
  );
}

// --- screen -----------------------------------------------------------------

function ProfileScreen({ navigation, route }) {
  const authCtx = useContext(AuthContext);

  // Default to the logged-in user's id when no member id is passed.
  const loggedInUser = (() => {
    try {
      return authCtx.user ? JSON.parse(authCtx.user) : null;
    } catch {
      return null;
    }
  })();
  const memberId = route.params?.memberId ?? loggedInUser?.id;

  const role = loggedInUser?.role;
  const canManage = role === "admin" || role === "moderator";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin/moderator editing UI state.
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [picker, setPicker] = useState(null); // { mode, title, sexFilter }

  // Drag-to-assign-mother state.
  const spouseRefs = useRef({}); // spouseId -> View node (drop zones)
  const zonesRef = useRef({}); // spouseId -> { x, y, w, h } measured on pickup
  const [draggingChild, setDraggingChild] = useState(null);

  // Per-spouse collapse state for their children list.
  const [collapsed, setCollapsed] = useState({}); // spouseId -> true if collapsed
  function toggleCollapse(id) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const load = useCallback(async () => {
    if (!memberId) {
      setError("لا يوجد ملف لعرضه");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getMember(memberId, authCtx.token);
      setProfile(data);
    } catch (e) {
      console.log("getMember error", e?.message);
      setError("تعذّر تحميل الملف الشخصي");
    } finally {
      setLoading(false);
    }
  }, [memberId, authCtx.token]);

  useEffect(() => {
    load();
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: profile?.fullname ?? profile?.name ?? "الملف الشخصي",
      headerRight:
        canManage && profile
          ? () => (
              <Pressable
                onPress={() => setEditVisible(true)}
                style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.5 }]}
              >
                <Ionicons name="create-outline" size={22} color={Colors.primary600} />
              </Pressable>
            )
          : undefined,
    });
  }, [navigation, profile, canManage]);

  function openProfile(id) {
    if (!id) return;
    navigation.push("ProfileScreen", { memberId: id });
  }

  // Apply a link picked from the PersonPicker, then refresh the profile.
  async function onPickPerson(person) {
    const mode = picker?.mode;
    setPicker(null);
    try {
      if (mode === "mother") await setParent(profile.id, "mother", person.id, authCtx.token);
      else if (mode === "father") await setParent(profile.id, "father", person.id, authCtx.token);
      else if (mode === "spouse") await addSpouse(profile.id, person.id, authCtx.token);
      else if (mode === "child") await addChild(profile.id, person.id, authCtx.token);
      load();
    } catch (e) {
      Alert.alert("خطأ", e?.response?.data?.message || "تعذّر تنفيذ العملية");
    }
  }

  // Confirm + unlink a relationship, then refresh.
  function confirmRemove(label, action) {
    Alert.alert("إزالة الرابط", `هل تريد إزالة ${label}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: async () => {
          try {
            await action();
            load();
          } catch (e) {
            Alert.alert("خطأ", e?.response?.data?.message || "تعذّر إزالة الرابط");
          }
        },
      },
    ]);
  }

  const spouseSexFilter = profile?.sex === "famale" ? "male" : "famale";

  // --- drag an unknown-mother child onto a wife to set her as the mother -----
  function measureSpouseZones() {
    Object.keys(spouseRefs.current).forEach((id) => {
      const node = spouseRefs.current[id];
      if (node && node.measureInWindow) {
        node.measureInWindow((x, y, w, h) => {
          zonesRef.current[id] = { x, y, w, h };
        });
      }
    });
  }

  function onChildPickup(childId) {
    measureSpouseZones();
    setDraggingChild(childId);
  }

  async function onChildDrop(child, point) {
    setDraggingChild(null);
    // Find which spouse section the child was released over.
    let targetId = null;
    for (const id of Object.keys(zonesRef.current)) {
      const z = zonesRef.current[id];
      if (z && point.x >= z.x && point.x <= z.x + z.w && point.y >= z.y && point.y <= z.y + z.h) {
        targetId = id;
        break;
      }
    }
    if (!targetId) return; // dropped outside any spouse section
    const target = spouses.find((s) => s.id === targetId);
    if (!target) return;
    // No-op if the child is already this spouse's child.
    if ((target.children || []).some((ch) => ch.id === child.id)) return;
    // The dropped-on spouse supplies the missing parent of their own sex:
    // a husband => father, a wife => mother.
    const kind = target.sex === "male" ? "father" : "mother";
    const roleWord = kind === "father" ? "أبًا" : "أمًّا";
    Alert.alert(
      "تعيين أحد الوالدين",
      `هل تجعل ${target.fullname || target.firstname || target.name} ${roleWord} لـ ${
        child.fullname || child.firstname || child.name
      }؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          onPress: async () => {
            try {
              await setParent(child.id, kind, targetId, authCtx.token);
              load();
            } catch (e) {
              Alert.alert("خطأ", e?.response?.data?.message || "تعذّر التعيين");
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary600} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "غير موجود"}</Text>
      </View>
    );
  }

  const { parents, spouses, childrenWithUnknownMother, childrenWithUnknownFather } = profile;
  const headerSub = profile.deceased
    ? `${year(profile.birthDate) ?? "?"}–${year(profile.deathDate) ?? "?"}${
        profile.age != null ? ` (${profile.age})` : ""
      }`
    : profile.age != null
    ? `${genderLabel(profile.sex)} · ${profile.age} سنة`
    : genderLabel(profile.sex);

  const hasParents = parents && (parents.father || parents.mother);
  const spouseSectionTitle = profile.sex === "famale" ? "الزوج" : "الزوجات";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!draggingChild}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar photoUrl={profile.photoUrl} sex={profile.sex} size={104} />
        <Text style={styles.name}>{profile.fullname || profile.name}</Text>
        <Text style={styles.headerSub}>{headerSub}</Text>
        <Text style={styles.idText} selectable>
          الرقم التعريفي: {profile.id}
        </Text>
        {profile.deceased ? (
          <Text style={styles.deceasedTag}>
            {profile.sex === "famale" ? "متوفّاة" : "متوفّى"}
          </Text>
        ) : null}
      </View>

      {/* Admin / moderator action bar */}
      {canManage ? (
        <View style={styles.actionBar}>
          {[
            { icon: "create-outline", label: "تعديل", onPress: () => setEditVisible(true) },
            { icon: "woman-outline", label: "تعيين الأم",
              onPress: () => setPicker({ mode: "mother", title: "اختر الأم", sexFilter: "famale" }) },
            { icon: "man-outline", label: "تعيين الأب",
              onPress: () => setPicker({ mode: "father", title: "اختر الأب", sexFilter: "male" }) },
            { icon: "heart-outline", label: "إضافة زوج/ة",
              onPress: () => setPicker({ mode: "spouse", title: "اختر الزوج/ة", sexFilter: spouseSexFilter }) },
            { icon: "person-add-outline", label: "إضافة ابن/ابنة",
              onPress: () => setPicker({ mode: "child", title: "اختر الابن/الابنة" }) },
            { icon: "add-circle-outline", label: "ملف جديد", onPress: () => setAddVisible(true) },
          ].map((a) => (
            <Pressable
              key={a.label}
              onPress={a.onPress}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.5 }]}
            >
              <Ionicons name={a.icon} size={20} color={Colors.primary600} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Parents */}
      {hasParents ? (
        <View style={styles.section}>
          <SectionTitle>الوالدان</SectionTitle>
          <PersonRow
            person={parents.father}
            subtitle="الأب"
            onPress={() => openProfile(parents.father?.id)}
            onRemove={
              canManage
                ? () =>
                    confirmRemove("الأب", () =>
                      removeParent(profile.id, "father", authCtx.token)
                    )
                : undefined
            }
          />
          <PersonRow
            person={parents.mother}
            subtitle="الأم"
            onPress={() => openProfile(parents.mother?.id)}
            onRemove={
              canManage
                ? () =>
                    confirmRemove("الأم", () =>
                      removeParent(profile.id, "mother", authCtx.token)
                    )
                : undefined
            }
          />
        </View>
      ) : null}

      {/* Spouses + their children */}
      {spouses && spouses.length > 0 ? (
        <View style={styles.section}>
          <SectionTitle>{spouseSectionTitle}</SectionTitle>
          {spouses.map((sp) => (
            <View
              key={sp.id}
              ref={(el) => {
                spouseRefs.current[sp.id] = el;
              }}
              style={[styles.spouseBlock, draggingChild && styles.dropZoneActive]}
            >
              <PersonRow
                person={sp}
                badge={spouseBadge(sp)}
                onPress={() => openProfile(sp.id)}
                onRemove={
                  canManage
                    ? () =>
                        confirmRemove(`الزواج من ${sp.name}`, () =>
                          removeSpouse(profile.id, sp.id, authCtx.token)
                        )
                    : undefined
                }
              />
              {sp.children && sp.children.length > 0 ? (
                <View style={styles.childrenGroup}>
                  <Pressable
                    onPress={() => toggleCollapse(sp.id)}
                    style={styles.childrenHeader}
                  >
                    <Ionicons
                      name={collapsed[sp.id] ? "chevron-back" : "chevron-down"}
                      size={16}
                      color={Colors.primary500}
                    />
                    <Text style={styles.childrenLabel}>
                      الأبناء ({sp.children.length})
                    </Text>
                  </Pressable>
                  {!collapsed[sp.id]
                    ? sp.children.map((c) => {
                        const remove = canManage
                          ? () =>
                              confirmRemove(`الابن/الابنة ${c.name}`, () =>
                                removeChild(profile.id, c.id, authCtx.token)
                              )
                          : undefined;
                        // Draggable when there's another mother to move to.
                        return canManage && spouses.length > 1 ? (
                          <DraggableChild
                            key={c.id}
                            child={c}
                            onPickup={onChildPickup}
                            onDrop={onChildDrop}
                            onPress={() => openProfile(c.id)}
                            onRemove={remove}
                            isDragging={draggingChild === c.id}
                          />
                        ) : (
                          <PersonRow
                            key={c.id}
                            person={c}
                            onPress={() => openProfile(c.id)}
                            onRemove={remove}
                          />
                        );
                      })
                    : null}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* Children with unknown mother */}
      {childrenWithUnknownMother && childrenWithUnknownMother.length > 0 ? (
        <View style={styles.section}>
          <SectionTitle>أبناء (الأم غير معروفة)</SectionTitle>
          {canManage && spouses && spouses.length > 0 ? (
            <Text style={styles.dragHint}>
              اضغط مطوّلًا على الابن واسحبه إلى الزوجة لتعيينها أمًّا له
            </Text>
          ) : null}
          {childrenWithUnknownMother.map((c) =>
            canManage && spouses && spouses.length > 0 ? (
              <DraggableChild
                key={c.id}
                child={c}
                onPickup={onChildPickup}
                onDrop={onChildDrop}
                onPress={() => openProfile(c.id)}
                isDragging={draggingChild === c.id}
              />
            ) : (
              <PersonRow
                key={c.id}
                person={c}
                onPress={() => openProfile(c.id)}
                onRemove={
                  canManage
                    ? () =>
                        confirmRemove(`الابن/الابنة ${c.name}`, () =>
                          removeChild(profile.id, c.id, authCtx.token)
                        )
                    : undefined
                }
              />
            )
          )}
        </View>
      ) : null}

      {/* Children with unknown father (mirror — for a mother whose child has no
          father linked) */}
      {childrenWithUnknownFather && childrenWithUnknownFather.length > 0 ? (
        <View style={styles.section}>
          <SectionTitle>أبناء (الأب غير معروف)</SectionTitle>
          {canManage && spouses && spouses.length > 0 ? (
            <Text style={styles.dragHint}>
              اضغط مطوّلًا على الابن واسحبه إلى الزوج لتعيينه أبًا له
            </Text>
          ) : null}
          {childrenWithUnknownFather.map((c) =>
            canManage && spouses && spouses.length > 0 ? (
              <DraggableChild
                key={c.id}
                child={c}
                onPickup={onChildPickup}
                onDrop={onChildDrop}
                onPress={() => openProfile(c.id)}
                isDragging={draggingChild === c.id}
              />
            ) : (
              <PersonRow
                key={c.id}
                person={c}
                onPress={() => openProfile(c.id)}
                onRemove={
                  canManage
                    ? () =>
                        confirmRemove(`الابن/الابنة ${c.name}`, () =>
                          removeChild(profile.id, c.id, authCtx.token)
                        )
                    : undefined
                }
              />
            )
          )}
        </View>
      ) : null}

      {/* Edit / add / link modals (admin & moderator) */}
      {canManage ? (
        <>
          <EditFieldsModal
            visible={editVisible}
            token={authCtx.token}
            profile={profile}
            onClose={() => setEditVisible(false)}
            onSaved={(updated) => {
              setEditVisible(false);
              if (updated) setProfile(updated);
              else load();
            }}
          />
          <AddProfileModal
            visible={addVisible}
            token={authCtx.token}
            current={{ id: profile.id, name: profile.fullname || profile.name, sex: profile.sex }}
            onClose={() => setAddVisible(false)}
            onCreated={(created) => {
              setAddVisible(false);
              load();
              if (created?.id) openProfile(created.id);
            }}
          />
          <PersonPicker
            visible={!!picker}
            token={authCtx.token}
            title={picker?.title}
            sexFilter={picker?.sexFilter}
            excludeId={profile.id}
            onPick={onPickPerson}
            onClose={() => setPicker(null)}
          />
        </>
      ) : null}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary100,
  },
  errorText: {
    color: Colors.primary600,
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary600,
    marginTop: 12,
  },
  headerSub: {
    fontSize: 15,
    color: "#6b6b6b",
    marginTop: 4,
  },
  idText: {
    fontSize: 12,
    color: "#9a9a9a",
    marginTop: 3,
  },
  deceasedTag: {
    marginTop: 6,
    fontSize: 12,
    color: "#616161",
    backgroundColor: "#ECECEC",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary600,
    textAlign: "right",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
    marginHorizontal: 12,
  },
  rowName: {
    fontSize: 16,
    color: "#222",
    textAlign: "right",
  },
  rowSub: {
    fontSize: 13,
    color: "#8a8a8a",
    textAlign: "right",
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
  },
  avatar: {
    backgroundColor: "#eee",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  spouseBlock: {
    marginBottom: 6,
  },
  dropZoneActive: {
    borderWidth: 1.5,
    borderColor: Colors.primary500,
    borderStyle: "dashed",
    borderRadius: 14,
  },
  draggingRow: {
    zIndex: 999,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    opacity: 0.95,
  },
  dragHint: {
    fontSize: 12,
    color: Colors.primary500,
    textAlign: "right",
    marginBottom: 8,
  },
  childrenGroup: {
    marginRight: 14,
    paddingRight: 8,
    borderRightWidth: 2,
    borderRightColor: Colors.primary200,
    marginBottom: 8,
  },
  childrenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginBottom: 6,
    paddingVertical: 2,
  },
  childrenLabel: {
    fontSize: 13,
    color: Colors.primary500,
    textAlign: "right",
  },
  headerBtn: {
    paddingHorizontal: 14,
  },
  removeBtn: {
    paddingHorizontal: 4,
    marginRight: 2,
  },
  actionBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },
  actionLabel: {
    fontSize: 12,
    color: Colors.primary600,
  },
});