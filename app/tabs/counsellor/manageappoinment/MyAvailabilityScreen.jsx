import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from "react-native";

const THEME_COLOR = "#10B981";

const AvailabilityModal = ({
  data,
  loading,
  onDeleteSlot,
  onDeleteDate
}) => {

  // 👉 NAYA: index receive kiya aur View mein key add ki
  const renderSlot = (slot, availabilityId, index) => (
    <View style={styles.slotBox} key={slot._id || index}> 
      <Text style={styles.slotText}>{slot.time}</Text>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() =>
          onDeleteSlot({
            availabilityId,
            time: slot.time
          })
        }
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.date}>
          {new Date(item.date).toDateString()}
        </Text>

        <TouchableOpacity
          onPress={() => onDeleteDate(item._id)}
        >
          <Text style={styles.deleteDate}>
            Delete Date
          </Text>
        </TouchableOpacity>
      </View>

      {/* 👉 NAYA: map function se index pass kiya */}
      {item.slots.map((slot, index) =>
        renderSlot(slot, item._id, index)
      )}

    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={() => (
        <Text style={styles.empty}>
          No Availability Found
        </Text>
      )}
    />
  );
};

export default AvailabilityModal;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280"
  },
  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  date: {
    fontWeight: "600",
    fontSize: 15
  },
  deleteDate: {
    color: "red",
    fontWeight: "500"
  },
  slotBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginBottom: 6
  },
  slotText: {
    fontWeight: "500"
  },
  deleteBtn: {
    backgroundColor: "red",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6
  },
  deleteText: {
    color: "white",
    fontSize: 12
  }
});