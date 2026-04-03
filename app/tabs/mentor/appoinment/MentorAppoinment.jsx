import React, { useEffect, useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Platform, Alert } from 'react-native';
import CustomHeader from "../../../../src/components/common/CustomHeader";
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ManageMentorManagement from './ManageMentorManagement';
import AvailableModal from './AvailableModal';

import {
  DeleteDate,
  DeleteSlot,
  getMyAvailblity,
  UpdateAvailability
} from '../../../../src/services/mentorAPI';


export default function MentorAppoinment() {

  const [isAvailabilityModalVisible, setIsAvailabilityModalVisible] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isAvailabilityModalVisible) {
      fetchAvailability();
    }
  }, [isAvailabilityModalVisible]);

  // fetch
  const fetchAvailability = async () => {
    setLoading(true);

    const res = await getMyAvailblity();

    if (res.success) {
      setAvailability(res.data.availability);
    } else {
      Alert.alert("Error", res.message);
    }

    setLoading(false);
  };

  // delete slot
  const handleDeleteSlot = async (payload) => {
    const res = await DeleteSlot(payload);

    if (res.success) {
      fetchAvailability();
    } else {
      Alert.alert("Error", res.message);
    }
  };

  // delete date
  const handleDeleteDate = async (id) => {
    const res = await DeleteDate(id);

    if (res.success) {
      fetchAvailability();
    } else {
      Alert.alert("Error", res.message);
    }
  };

  return (
    <View style={styles.container}>

      <CustomHeader
        routeName="CounsutantAppoinment"
        onActionPress={() => setIsAvailabilityModalVisible(true)}
      />

      <ManageMentorManagement/>

      <Modal
        visible={isAvailabilityModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAvailabilityModalVisible(false)}
      >
        <View style={[
          styles.modalContainer,
          { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }
        ]}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsAvailabilityModalVisible(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>My Availability</Text>
            <View style={styles.spacer} />
          </View>

          {/* Content */}
          <AvailableModal
            data={availability}
            loading={loading}
            onDeleteSlot={handleDeleteSlot}
            onDeleteDate={handleDeleteDate}
          />
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },

  closeBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20
  },

  spacer: { width: 40 }
});