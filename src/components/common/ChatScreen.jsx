import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable,
  TextInput, FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

// API Services (Dhyan rakhein ki ye paths aapke project ke hisaab se sahi hon)
import { chatHistory } from '../../services/user';
import { ConsultantchatHistory, getConsultantProfile } from '../../services/consultantAPI';
import { backendConfig } from '../../constants/MainContent';

const SOCKET_URL = backendConfig.origin; // Apni IP / Backend URL

// ==========================================
// Reusable Icon Button
// ==========================================
const AnimatedIcon = ({ name, size = 24, color = '#333', onPress, style }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      { transform: [{ scale: pressed ? 0.8 : 1 }], opacity: pressed ? 0.7 : 1 },
      style
    ]}
  >
    <Ionicons name={name} size={size} color={color} />
  </Pressable>
);

export default function ChatScreen({ navigation, route }) {
  const { receiverId, receiverName, receiverAvatar, consultationId } = route?.params || {};

  // Redux se User aur Role nikalna
  const { userData } = useSelector((state) => state.auth);
  const myUserRole = userData?.role;
  console.log("UserRole", myUserRole);

  // States
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [consultantProfile, setConsultantProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Data aane tak loader dikhayenge

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // 👉 Sahi ID set karna: Agar Consultant hai toh profile se ID lo, warna User ki ID lo
  // Dono roles ke liye Redux wali ID hi use karo
  const myUserId =
    myUserRole === "Consultant"
      ? consultantProfile?._id
      : userData?._id;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverName || 'User')}&background=0D8ABC&color=fff`;

  const chatUser = {
    name: receiverName || "User",
    status: isConnected ? "Online" : "Connecting...",
    avatar: receiverAvatar ? receiverAvatar : defaultAvatar,
  };

  // ==============================
  // FETCH HISTORY & SOCKET CONNECT
  console.log("Role:", myUserRole);
  console.log("UserData ID:", userData?._id);
  console.log("Consultant ID:", consultantProfile?._id);
  console.log("Final ID:", myUserId);


  useEffect(() => {
    // 1. Wait for ID and Room ID
    if (!consultationId || !myUserId) {
      // Data abhi nahi aaya hai
      return;
    }

    // 2. IDs mil gayi, toh Loading hatao
    setIsLoading(false);

    // 3. Socket Initialize
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        forceNew: true,
      });
    }

    const socket = socketRef.current;

    // Remove old listeners to prevent duplication
    socket.off('connect');
    socket.off('disconnect');
    socket.off('receiveMessage');

    // Register new listeners
    socket.on('connect', () => {
      console.log('Connected:', socket.id);
      setIsConnected(true);
      socket.emit('joinRoom', { consultationId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('receiveMessage', (incomingMessage) => {
      setMessages((prevMessages) => {
        // Prevent adding my own messages
        if (incomingMessage.senderId === myUserId) return prevMessages;

        // Prevent duplicates
        const isDuplicate = prevMessages.some(msg => msg._id === incomingMessage._id);
        if (isDuplicate) return prevMessages;

        return [...prevMessages, incomingMessage];
      });
      scrollToBottom();
    });

    return () => {
      if (socket) {
        socket.off('receiveMessage');
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [consultationId, myUserId]);
  // ==============================
  // SCROLL TO BOTTOM
  // ==============================
  const scrollToBottom = () => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 150);
  };

  // ==============================
  // SEND MESSAGE
  // ==============================
  const handleSendMessage = () => {
    // Agar input khaali hai, ya asali MongoDB ID load nahi hui, toh send mat karo (BSON Error bachane ke liye)
    if (inputText.trim() === '' || !myUserId) return;

    // 👉 FIX 2: senderType ko .toLowerCase() karna zaroori hai (e.g. "Consultant" -> "consultant")
    const safeSenderType = myUserRole ? myUserRole.toLowerCase() : "user";

    const messageData = {
      consultationId: consultationId,
      message: inputText,
      senderId: myUserId,
      senderType: safeSenderType,
    };

    const localMessage = {
      ...messageData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...(prev || []), localMessage]);

    if (socketRef.current) {
      socketRef.current.emit('sendMessage', messageData);
    }

    setInputText('');
    scrollToBottom();
  };

  // ==============================
  // RENDER MESSAGE BUBBLE
  // ==============================
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === myUserId;

    let displayTime = '';
    if (item.createdAt) {
      const dateObj = new Date(item.createdAt);
      displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      displayTime = item.time || '';
    }

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperThem]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleThem]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.timeText}>{displayTime}</Text>
      </View>
    );
  };

  // ==============================
  // UI RENDERING
  // ==============================

  // 👉 Jab tak User/Consultant ki ID backend se set nahi ho jati, loader dikhao
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: '#888' }}>Loading Chat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        {/* --- 1. CHAT HEADER --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AnimatedIcon name="arrow-back" size={24} color="#333" onPress={() => navigation.goBack()} style={styles.backIcon} />

            <View style={styles.avatarContainer}>
              <Image source={{ uri: chatUser.avatar }} style={styles.avatar} />
              <View style={[styles.onlineIndicator, { backgroundColor: isConnected ? '#10B981' : '#ccc' }]} />
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName} numberOfLines={1}>{chatUser.name}</Text>
              <Text style={[styles.headerStatus, { color: isConnected ? '#10B981' : '#888' }]}>
                {chatUser.status}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <AnimatedIcon name="call-outline" size={22} color="#3B82F6" style={styles.headerIcon} />
            <AnimatedIcon name="videocam-outline" size={24} color="#3B82F6" />
          </View>
        </View>

        {/* --- 2. MESSAGE LIST --- */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item._id || item.id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {/* --- 3. INPUT AREA --- */}
        <View style={styles.inputContainer}>
          <AnimatedIcon name="add-circle-outline" size={28} color="#888" style={styles.inputIcon} />

          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <AnimatedIcon name="document-attach-outline" size={22} color="#888" style={styles.attachIcon} />
          </View>

          {inputText.trim().length > 0 ? (
            <Pressable
              onPress={handleSendMessage}
              style={({ pressed }) => [
                styles.sendButton,
                { transform: [{ scale: pressed ? 0.9 : 1 }] }
              ]}
            >
              <Ionicons name="send" size={18} color="#fff" style={styles.sendIconFix} />
            </Pressable>
          ) : (
            <AnimatedIcon name="mic-outline" size={28} color="#888" style={styles.micIcon} />
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { position: 'relative', marginLeft: 12, marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, backgroundColor: '#10B981', borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  headerTextContainer: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  headerStatus: { fontSize: 12, color: '#10B981', fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 16 },
  messageList: { paddingHorizontal: 16, paddingVertical: 20 },
  messageWrapper: { marginBottom: 16, maxWidth: '80%' },
  messageWrapperMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageWrapperThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  messageBubbleMe: { backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
  messageBubbleThem: { backgroundColor: '#E5E7EB', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextMe: { color: '#fff' },
  messageTextThem: { color: '#111' },
  timeText: { fontSize: 11, color: '#888', marginTop: 4, marginHorizontal: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  inputIcon: { marginRight: 8 },
  textInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 12, marginRight: 8 },
  textInput: { flex: 1, minHeight: 40, maxHeight: 100, paddingTop: Platform.OS === 'ios' ? 10 : 8, paddingBottom: Platform.OS === 'ios' ? 10 : 8, fontSize: 15, color: '#111' },
  attachIcon: { marginLeft: 8 },
  sendButton: { width: 44, height: 44, backgroundColor: '#3B82F6', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendIconFix: { marginLeft: 4 },
  micIcon: { marginLeft: 4 },
  backIcon: { marginRight: 5 }
});