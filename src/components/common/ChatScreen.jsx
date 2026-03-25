import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable,
  TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

import { chatHistory } from '../../services/user';
import { ConsultantchatHistory } from '../../services/consultantAPI';
import { backendConfig } from '../../constants/MainContent';

const SOCKET_URL = backendConfig.origin; 

const AnimatedIcon = ({ name, size = 24, color = '#333', onPress, style }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.8 : 1 }], opacity: pressed ? 0.7 : 1 }, style]}
  >
    <Ionicons name={name} size={size} color={color} />
  </Pressable>
);

export default function ChatScreen({ navigation, route }) {
  const { receiverId, receiverName, receiverAvatar, consultationId, senderId } = route?.params || {};
  
  // 👉 Redux state
  const authState = useSelector((state) => state.auth);

  // States
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // 👉 Sahi ID Mapping (Konsi ID mil rahi hai, ab console me dikhega)
  const myUserRole = authState?.userData?.role || authState?.role; 

const myUserId = authState?.userData?._id || authState?.consultantData?._id || authState?._id || senderId;
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverName || 'User')}&background=0D8ABC&color=fff`;
  const chatUser = {
    name: receiverName || "User",
    status: isConnected ? "Online" : "Connecting...",
    avatar: receiverAvatar ? receiverAvatar : defaultAvatar,
  };

  // ==============================
  // 🐛 1. INITIAL MOUNT LOGS
  // ==============================
  useEffect(() => {
    console.log("🛠️ --- CHAT SCREEN MOUNTED ---");
    console.log("🟡 DEBUG: authState Object Keys ->", Object.keys(authState || {}));
    console.log("🟡 DEBUG: myUserRole extracted ->", myUserRole);
    console.log("🕵️ FULL USER DATA:", JSON.stringify(authState.userData, null, 2));
    console.log("🟡 DEBUG: myUserId extracted ->", myUserId);
    console.log("🟡 DEBUG: Room ID (consultationId) ->", consultationId);
    console.log("🟡 DEBUG: Receiver ID ->", receiverId);
    console.log("-------------------------------");
  }, []);

  // ==============================
  // 2. FETCH CHAT HISTORY
  // ==============================
  useEffect(() => {
    const fetchHistory = async () => {
      if (!consultationId) return;
      setIsLoading(true);
      try {
        let res;
        if (myUserRole === "Consultant" || myUserRole === "consultant") {
          res = await ConsultantchatHistory(consultationId);
        } else {
          res = await chatHistory(consultationId);
        }

        const historyData = res?.data?.chats || res?.chats || res?.data || [];
        console.log("✅ DEBUG: History Fetched. Total Messages:", historyData.length);
        
        if (historyData.length > 0) {
          setMessages(historyData);
          scrollToBottom();
        }
      } catch (error) {
        console.log("❌ DEBUG: Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [consultationId, myUserRole]);

  // ==============================
  // 3. SOCKET CONNECTION
  // ==============================
  useEffect(() => {
    console.log("🔌 DEBUG: Socket setup initiated.");
    if (!myUserId || !consultationId) {
       console.log("🔴 DEBUG: Socket aborted! Missing myUserId or consultationId.");
       return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    }

    const socket = socketRef.current;

    // Agar pehle se connect ho chuka hai fast render me
    if (socket.connected) {
        console.log("🟢 DEBUG: Socket was already connected!");
        setIsConnected(true);
    }

    socket.on('connect', () => {
        console.log("🟢 DEBUG: Socket Officially Connected! ID:", socket.id);
        setIsConnected(true);
    });

    socket.on('disconnect', () => {
        console.log("🔴 DEBUG: Socket Disconnected!");
        setIsConnected(false);
    });

    console.log(`🔗 DEBUG: Emitting joinRoom for ID: ${consultationId} by user: ${myUserId}`);
    socket.emit('joinRoom', { consultationId, userId: myUserId });

    // Room me join hone ke baad wala code...
    socket.on('receiveMessage', (incomingMessage) => {
      console.log("📩 DEBUG: New Message Received via Socket:", incomingMessage);

      // 🔥 THE FIX: Agar sender ki ID meri ID se match karti hai, toh list me dobara add mat karo
      if (String(incomingMessage.senderId) === String(myUserId)) {
          console.log("🛑 DEBUG: Ignored my own message (Echo stopped)");
          return; // Yahan se wapas laut jao, message add mat karo
      }

      setMessages(prev => [...prev, incomingMessage]);
      scrollToBottom();
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [consultationId, myUserId]);

  // ==============================
  // 4. SEND MESSAGE
  // ==============================
  const handleSendMessage = () => {
    console.log("🔵 DEBUG: Send Button Pressed!");
    console.log("🔵 DEBUG: Input Text ->", inputText);
    console.log("🔵 DEBUG: myUserId ->", myUserId);

    if (inputText.trim() === '') {
        console.log("🔴 DEBUG: Send Blocked! Message is empty.");
        return;
    }

    if (!myUserId) {
        console.log("🔴 DEBUG: Send Blocked! myUserId is NULL or UNDEFINED.");
        return;
    }

    const safeSenderType = myUserRole ? myUserRole.toLowerCase() : "user";

    const messageData = {
      consultationId: consultationId,
      message: inputText,
      senderId: myUserId,
      receiverId: receiverId, 
      senderType: safeSenderType,
    };

    console.log("📤 DEBUG: Final Message Payload:", messageData);

    const localMessage = {
      ...messageData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => {
        const newArray = [...(prev || []), localMessage];
        console.log("🟢 DEBUG: State Updated! New message count:", newArray.length);
        return newArray;
    });

    if (socketRef.current) {
      socketRef.current.emit('sendMessage', messageData);
      console.log("🟢 DEBUG: Message emitted to socket!");
    } else {
      console.log("🔴 DEBUG: Socket reference is null!");
    }

    setInputText('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (flatListRef.current && messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 200);
  };

  const renderMessage = ({ item }) => {
    // String matching just in case object IDs act weird
    const isMe = String(item.senderId) === String(myUserId);
    
    let displayTime = '';
    if (item.createdAt) {
      const dateObj = new Date(item.createdAt);
      displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
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
        {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading chat...</Text>
            </View>
        ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={renderMessage}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
            />
        )}

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