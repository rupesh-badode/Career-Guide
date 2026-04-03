import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from "react-native";

export default function AIChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const detectType = (msg) => {
    msg = msg.toLowerCase();
    if (msg.includes("neet")) return "neet";
    if (msg.includes("consultant")) return "consultant";
    return "general";
  };

  const sendMessage = async () => {
    const type = detectType(input);

    let systemPrompt = "";

    if (type === "neet") {
      systemPrompt = "User is asking about NEET exam. give guidance.";
    } else if (type === "consultant") {
      systemPrompt = "User wants consultant. suggest booking consultant.";
    } else {
      systemPrompt = "You are career assistant.";
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_API_KEY"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input }
          ]
        })
      }
    );

    const data = await response.json();
    const reply = data.choices[0].message.content;

    setMessages([
      ...messages,
      { role: "user", text: input },
      { role: "ai", text: reply }
    ]);

    setInput("");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onClose}>
        <Text style={{fontSize:18}}>Close</Text>
      </TouchableOpacity>

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text style={item.role === "ai" ? styles.ai : styles.user}>
            {item.text}
          </Text>
        )}
      />

      {/* Quick buttons */}
      <View style={styles.quick}>
        <TouchableOpacity onPress={()=>setInput("NEET exam date")}>
          <Text style={styles.quickBtn}>NEET Date</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>setInput("Best consultant")}>
          <Text style={styles.quickBtn}>Consultant</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 10,
    left: 10,
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#4F46E5",
    color: "#fff",
    padding: 8,
    margin: 5,
    borderRadius: 6
  },
  ai: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    padding: 8,
    margin: 5,
    borderRadius: 6
  },
  inputRow: {
    flexDirection: "row"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 5
  },
  quick: {
    flexDirection: "row",
    gap: 10
  },
  quickBtn: {
    backgroundColor: "#eee",
    padding: 6,
    borderRadius: 5
  }
});