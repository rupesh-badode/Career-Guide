import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation } from '@react-navigation/native';
import { BuyProduct, VerifyProductPayment } from '../../../../src/services/user';
import { key_id } from '../../../../src/constants/MainContent';


export default function CheckoutButton({ selectedAddressId, userData,Amount }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useNavigation();

  const handlePayment = async () => {
    if (!selectedAddressId) {
      Alert.alert("Error", "Please select a delivery address first.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Tell backend to create the Razorpay order
      // 1. Tell backend to create the Razorpay order
      const orderResponse = await BuyProduct({ 
        addressId: selectedAddressId,
        amount: Amount 
      });
      
      console.log("🔍 RAW BACKEND RESPONSE:", orderResponse);

      // 🛡️ SMART EXTRACTION: Matching your EXACT backend JSON structure
      const rzpData = orderResponse?.razorpayOrder;
      
      const order_id = rzpData?.id; // Backend calls it 'id'
      const amount = rzpData?.amount; // Backend sends 86400 (Paise)
      const currency = rzpData?.currency || 'INR';

      // 🚨 IMPORTANT: Your backend didn't send the Razorpay Key!
      // Put your actual Razorpay Key ID here (starts with 'rzp_test_' or 'rzp_live_')
      

      if (!order_id) {
        throw new Error("Could not find Razorpay Order ID in the response!");
      }

      // 2. Open Razorpay Modal
      const options = {
        description: 'Cart Purchase',
        currency: currency,
        key: key_id, // Make sure you replaced the string above!
        amount: amount, 
        name: 'Career Guide',
        order_id: order_id,
        prefill: {
          email: userData?.email || '',
          contact: userData?.phone || '',
          name: userData?.name || ''
        },
        theme: { color: '#F59E0B' }
      };
      
      // ... rest of the RazorpayCheckout.open() code ...

      // 3. Open Razorpay Checkout Modal
      RazorpayCheckout.open(options).then(async (data) => {
        // Success Callback
        try {
          // 4. Verify Payment on Backend
          const verifyPayload = {
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
          };

          const verifyRes = await VerifyProductPayment(verifyPayload);

          if (verifyRes.success) {
            Alert.alert("Success", "Payment successful! Order placed.");
            // Redirect to a success screen or clear cart
            // navigation.navigate("BookingSuccess"); 
          } else {
            Alert.alert("Payment Failed", "Could not verify payment securely.");
          }
        } catch (verifyErr) {
          console.error("Verification Error:", verifyErr);
          Alert.alert("Error", "Payment verification failed. Please contact support.");
        } finally {
          setIsProcessing(false);
        }

      }).catch((error) => {
        // Handle Razorpay Modal Dismissal / Failure
        setIsProcessing(false);
        console.log("Razorpay Error:", error);
        Alert.alert("Payment Cancelled", "You cancelled the payment process.");
      });

    } catch (error) {
      setIsProcessing(false);
      console.error("Order Creation Error:", error);
      Alert.alert("Error", typeof error === 'string' ? error : "Could not initiate payment.");
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.checkoutBtn, isProcessing && styles.checkoutBtnDisabled]} 
      onPress={handlePayment}
      disabled={isProcessing}
      activeOpacity={0.8}
    >
      {isProcessing ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.checkoutBtnText}>Continue to Payment</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkoutBtn: {
    backgroundColor: '#F59E0B', // 👉 Matches your theme perfectly
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 20,
    elevation: 3, // Slight shadow for Android
    shadowColor: '#F59E0B', // Colored shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#93c5fd', // Lighter blue when loading to prevent double taps
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});