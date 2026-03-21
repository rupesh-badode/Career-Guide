// import React, { useEffect, useRef, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { io } from 'socket.io-client';
// import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';

// // Replace with your actual backend URL
// const SOCKET_URL = 'http://192.168.29.89:8089'; 

// const VideoCall = ({ roomId = 'test-room-123' }) => {
//   const [isCalling, setIsCalling] = useState(false);
//   const [micOn, setMicOn] = useState(true);
//   const [cameraOn, setCameraOn] = useState(true);
  
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const socketRef = useRef(null);
//   const peerConnectionRef = useRef(null);
//   const localStreamRef = useRef(null);

//   // STUN servers to help establish the connection over the internet
//   const rtcConfig = {
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//   };

//   useEffect(() => {
//     // 1. Initialize Socket Connection
//     socketRef.current = io(SOCKET_URL);
    
//     // 2. Join the Call Room (matching your backend)
//     socketRef.current.emit('joinCallRoom', { roomId });

//     // 3. Get Local Media (Camera/Mic)
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         localStreamRef.current = stream;
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }
//       })
//       .catch((err) => console.error('Error accessing media devices.', err));

//     // 4. Socket Listeners for WebRTC Signaling
//     socketRef.current.on('offer', async (offer) => {
//       if (!peerConnectionRef.current) createPeerConnection();
      
//       await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnectionRef.current.createAnswer();
//       await peerConnectionRef.current.setLocalDescription(answer);
      
//       socketRef.current.emit('answer', { roomId, answer });
//       setIsCalling(true);
//     });

//     socketRef.current.on('answer', async (answer) => {
//       await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//     });

//     socketRef.current.on('ice-candidate', async (candidate) => {
//       if (peerConnectionRef.current) {
//         try {
//           await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (e) {
//           console.error('Error adding received ice candidate', e);
//         }
//       }
//     });

//     // Cleanup on unmount
//     return () => {
//       socketRef.current.disconnect();
//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach(track => track.stop());
//       }
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//       }
//     };
//   }, [roomId]);

//   const createPeerConnection = () => {
//     const pc = new RTCPeerConnection(rtcConfig);
//     peerConnectionRef.current = pc;

//     // Add local tracks to the connection
//     localStreamRef.current.getTracks().forEach((track) => {
//       pc.addTrack(track, localStreamRef.current);
//     });

//     // Handle incoming remote stream
//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     // Send ICE candidates to the other peer via Socket
//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current.emit('ice-candidate', { roomId, candidate: event.candidate });
//       }
//     };
//   };

//   const startCall = async () => {
//     createPeerConnection();
//     const offer = await peerConnectionRef.current.createOffer();
//     await peerConnectionRef.current.setLocalDescription(offer);
    
//     // Emit offer to backend
//     socketRef.current.emit('offer', { roomId, offer });
//     setIsCalling(true);
//   };

//   const endCall = () => {
//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.close();
//       peerConnectionRef.current = null;
//     }
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = null;
//     }
//     setIsCalling(false);
//   };

//   const toggleMic = () => {
//     if (localStreamRef.current) {
//       const audioTrack = localStreamRef.current.getAudioTracks()[0];
//       audioTrack.enabled = !audioTrack.enabled;
//       setMicOn(audioTrack.enabled);
//     }
//   };

//   const toggleCamera = () => {
//     if (localStreamRef.current) {
//       const videoTrack = localStreamRef.current.getVideoTracks()[0];
//       videoTrack.enabled = !videoTrack.enabled;
//       setCameraOn(videoTrack.enabled);
//     }
//   };

//   return (
//     <div className="relative w-full h-screen bg-gray-950 flex items-center justify-center overflow-hidden font-sans">
      
//       {/* Remote Video (Main Screen) */}
//       <AnimatePresence>
//         {isCalling ? (
//           <motion.video
//             initial={{ opacity: 0, scale: 1.1 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.8, ease: "easeOut" }}
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="absolute inset-0 w-full h-full object-cover"
//           />
//         ) : (
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="absolute inset-0 flex flex-col items-center justify-center text-white"
//           >
//             <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-2xl">
//               <Phone className="w-10 h-10 text-emerald-400" />
//             </div>
//             <h2 className="text-2xl font-semibold mb-2">Ready to connect</h2>
//             <p className="text-gray-400 mb-8">Waiting for others to join room: {roomId}</p>
//             <button 
//               onClick={startCall}
//               className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-full font-medium transition-colors shadow-lg shadow-emerald-500/30"
//             >
//               Start Call
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Local Video (Picture in Picture) */}
//       <motion.div 
//         drag
//         dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
//         className="absolute bottom-24 right-4 md:bottom-8 md:right-8 w-32 md:w-48 aspect-[3/4] md:aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 z-10 cursor-move"
//       >
//         <video
//           ref={localVideoRef}
//           autoPlay
//           playsInline
//           muted // Always mute local video to prevent feedback loops
//           className={`w-full h-full object-cover transition-opacity duration-300 ${!cameraOn ? 'opacity-0' : 'opacity-100'}`}
//         />
//         {!cameraOn && (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
//             <VideoOff className="w-8 h-8 text-gray-500" />
//           </div>
//         )}
//       </motion.div>

//       {/* Control Bar */}
//       <motion.div 
//         initial={{ y: 100, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.2, type: 'spring', damping: 20 }}
//         className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-lg px-6 py-4 rounded-2xl border border-gray-700/50 shadow-2xl z-20"
//       >
//         <button 
//           onClick={toggleMic}
//           className={`p-4 rounded-full transition-all ${micOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
//         >
//           {micOn ? <Mic size={20} /> : <MicOff size={20} />}
//         </button>

//         <button 
//           onClick={toggleCamera}
//           className={`p-4 rounded-full transition-all ${cameraOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
//         >
//           {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
//         </button>

//         {isCalling && (
//           <button 
//             onClick={endCall}
//             className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all"
//           >
//             <PhoneOff size={20} />
//           </button>
//         )}
//       </motion.div>

//     </div>
//   );
// };

// export default VideoCall;