import React, { useEffect, useRef, useState } from "react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAuth } from "../contexts/AuthContext";
import { useWebRTC } from "../hooks/useWebRTC";

import LobbyScreen from "../components/video/LobbyScreen";
import RemoteVideo from "../components/video/RemoteVideo";
import ChatDrawer from "../components/video/ChatDrawer";
import ControlBar from "../components/video/ControlBar";

export default function VideoMeet() {
    const { showMessage } = useSnackbar();
    const { userData } = useAuth();

    const localVideoRef = useRef(null);
    const lobbyVideoRef = useRef(null);

    const [videoAvailable, setVideoAvailable] = useState(false);
    const [audioAvailable, setAudioAvailable] = useState(false);
    const [videoState, setVideoState] = useState(true);
    const [audioState, setAudioState] = useState(true);
    const [screenState, setScreenState] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState(userData?.name || userData?.username || "");
    
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [messageInput, setMessageInput] = useState("");

    const roomPath = window.location.pathname;
    const { connect, disconnect, sendChatMessage, peerConnectionsRef, remoteStreams, remoteUsers, messages } = useWebRTC(roomPath, username, showMessage);

    // Get Media Permissions
    useEffect(() => {
        const getPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                window.localStream = stream;
                
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = stream;

                setVideoAvailable(true);
                setAudioAvailable(true);
            } catch (err) {
                console.error("Permissions denied or devices missing", err);
                setVideoAvailable(false);
                setAudioAvailable(false);
                setVideoState(false);
                setAudioState(false);
                showMessage("Camera/Microphone permissions denied. Joining to watch only.", "error");
            }

            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }
        };
        getPermission();
    }, []);

    // Bind streams when view changes
    useEffect(() => {
        if (askForUsername && window.localStream && lobbyVideoRef.current) {
            lobbyVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    useEffect(() => {
        if (!askForUsername && window.localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    // Unread counter handling
    useEffect(() => {
        if (isChatOpen) setUnreadCount(0);
    }, [isChatOpen]);

    useEffect(() => {
        if (!isChatOpen && messages.length > 0) {
            setUnreadCount((prev) => prev + 1);
        }
    }, [messages.length]);

    const connectToMeeting = () => {
        if (!username.trim()) {
            showMessage("Please enter a username", "error");
            return;
        }
        setAskForUsername(false);
        connect();
    };

    const toggleAudio = () => {
        if (window.localStream && audioAvailable) {
            const track = window.localStream.getAudioTracks()[0];
            if (track) {
                track.enabled = !audioState;
                setAudioState(!audioState);
            }
        }
    };

    const toggleVideo = () => {
        if (window.localStream && videoAvailable) {
            const track = window.localStream.getVideoTracks()[0];
            if (track) {
                track.enabled = !videoState;
                setVideoState(!videoState);
            }
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!screenState) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const videoTrack = screenStream.getVideoTracks()[0];

                Object.values(peerConnectionsRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                });

                videoTrack.onended = stopScreenShare;
                if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
                setScreenState(true);
            } else {
                stopScreenShare();
            }
        } catch (error) {
            console.error("Screen share cancelled", error);
        }
    };

    const stopScreenShare = () => {
        if (window.localStream && videoAvailable) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            Object.values(peerConnectionsRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender && videoTrack) sender.replaceTrack(videoTrack);
            });
            if (localVideoRef.current) localVideoRef.current.srcObject = window.localStream;
        }
        setScreenState(false);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        sendChatMessage(messageInput);
        setMessageInput("");
    };

    const leaveMeeting = () => {
        if (window.localStream) window.localStream.getTracks().forEach(track => track.stop());
        disconnect();
        window.location.href = "/home";
    };

    return (
        <div className="flex-1 bg-gray-900 font-sans flex flex-col overflow-hidden text-white">
            {askForUsername ? (
                <LobbyScreen 
                    lobbyVideoRef={lobbyVideoRef}
                    videoAvailable={videoAvailable}
                    audioAvailable={audioAvailable}
                    videoState={videoState}
                    audioState={audioState}
                    toggleAudio={toggleAudio}
                    toggleVideo={toggleVideo}
                    username={username}
                    setUsername={setUsername}
                    connectToMeeting={connectToMeeting}
                />
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex flex-row overflow-hidden relative">
                        {/* Video Grid */}
                        <div className="flex-1 p-4 grid gap-4 auto-rows-[1fr] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto">
                            {/* Local Video Box */}
                            <div className="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center min-h-[250px]">
                                {videoAvailable && videoState ? (
                                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                ) : (
                                    <div className="text-gray-500 font-medium">Camera Off</div>
                                )}
                                <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded text-sm text-white z-10">
                                    {username} (You)
                                </div>
                            </div>

                            {/* Remote Video Boxes */}
                            {remoteStreams.map((peer) => (
                                <RemoteVideo 
                                    key={peer.socketId} 
                                    stream={peer.stream} 
                                    username={remoteUsers[peer.socketId]} 
                                />
                            ))}
                        </div>

                        {/* Chat Drawer */}
                        <ChatDrawer 
                            isChatOpen={isChatOpen}
                            setIsChatOpen={setIsChatOpen}
                            messages={messages}
                            username={username}
                            messageInput={messageInput}
                            setMessageInput={setMessageInput}
                            sendMessage={handleSendMessage}
                        />
                    </div>

                    {/* Bottom Control Bar */}
                    <ControlBar 
                        audioState={audioState}
                        videoState={videoState}
                        screenState={screenState}
                        audioAvailable={audioAvailable}
                        videoAvailable={videoAvailable}
                        screenAvailable={screenAvailable}
                        unreadCount={unreadCount}
                        toggleAudio={toggleAudio}
                        toggleVideo={toggleVideo}
                        handleScreenShare={handleScreenShare}
                        setIsChatOpen={setIsChatOpen}
                        isChatOpen={isChatOpen}
                        leaveMeeting={leaveMeeting}
                    />
                </div>
            )}
        </div>
    );
}