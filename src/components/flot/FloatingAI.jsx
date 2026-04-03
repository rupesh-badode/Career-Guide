import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import AIChat from "./AIChat";

export default function FloatingAI() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <AIChat onClose={() => setOpen(false)} />}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setOpen(true)}
      >
        <Text style={{color:"#fff",fontSize:22}}>🤖</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#F27A21",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5
  }
});