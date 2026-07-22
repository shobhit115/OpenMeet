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

    // NEW: Unified Drawer States (Chat & People)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");
    const [unreadCount, setUnreadCount] = useState(0);
    const [messageInput, setMessageInput] = useState("");

    const roomPath = window.location.pathname;
    const { connect, disconnect, sendChatMessage, peerConnectionsRef, remoteStreams, remoteUsers, messages } = useWebRTC(roomPath, username, showMessage);

    // NEW: Toggling logic for Chat and People tabs
    const toggleChatTab = () => {
        if (isDrawerOpen && activeTab === 'chat') {
            setIsDrawerOpen(false); // Close if already open on chat
        } else {
            setActiveTab("chat");
            setIsDrawerOpen(true);
        }
    };

    const togglePeopleTab = () => {
        if (isDrawerOpen && activeTab === 'people') {
            setIsDrawerOpen(false); // Close if already open on people
        } else {
            setActiveTab("people");
            setIsDrawerOpen(true);
        }
    };

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

    // Re-attaches stream when video state is toggled back on
    useEffect(() => {
        if (!askForUsername && window.localStream && localVideoRef.current && videoState) {
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername, videoState]);

    // Unread counter handling (checks if drawer is open AND active tab is chat)
    useEffect(() => {
        if (isDrawerOpen && activeTab === 'chat') setUnreadCount(0);
    }, [isDrawerOpen, activeTab]);

    useEffect(() => {
        if ((!isDrawerOpen || activeTab !== 'chat') && messages.length > 0) {
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

    const initial = username ? username.charAt(0).toUpperCase() : "U";

    // Calculate total participants (You + all connected remote users)
    const totalParticipantsCount = 1 + Object.keys(remoteUsers).length;

    return (
        <div className="flex-1 bg-[#202124] font-sans flex flex-col overflow-hidden text-white min-h-screen">
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
                    <div className="flex-1 flex flex-row overflow-hidden relative p-4">

                        {/* Video Grid - Centered like Google Meet */}
                        <div className="flex-1 flex flex-wrap place-content-center gap-4 overflow-y-auto">

                            {/* Local Video Box */}
                            <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl flex items-center justify-center min-h-[240px] flex-1 min-w-[300px] max-w-[800px] aspect-video group transition-all duration-300 hover:border-gray-700">
                                {videoAvailable && videoState ? (
                                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-20 h-20 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-[var(--primary)]/20 border-2 border-white/10">
                                            {initial}
                                        </div>
                                        <span className="text-gray-400 text-xs font-medium tracking-wide">
                                            Camera Off
                                        </span>
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2 z-10 shadow-md">
                                    <span className="truncate max-w-[140px]">
                                        {username} (You)
                                    </span>
                                </div>
                            </div>

                            {/* Remote Video Boxes */}
                            {remoteStreams.map((peer) => (
                                <div key={peer.socketId} className="flex-1 min-w-[300px] max-w-[800px] aspect-video">
                                    <RemoteVideo
                                        stream={peer.stream}
                                        username={remoteUsers[peer.socketId]}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Combined Chat & Participants Drawer */}
                        {/* Combined Chat & Participants Drawer */}
                        <ChatDrawer
                            isDrawerOpen={isDrawerOpen}
                            setIsDrawerOpen={setIsDrawerOpen}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            messages={messages}
                            username={username}
                            messageInput={messageInput}
                            setMessageInput={setMessageInput}
                            sendMessage={handleSendMessage}
                            remoteUsers={remoteUsers}
                            remoteStreams={remoteStreams}
                            audioState={audioState}
                            videoState={videoState}
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
                        participantsCount={totalParticipantsCount}
                        toggleAudio={toggleAudio}
                        toggleVideo={toggleVideo}
                        handleScreenShare={handleScreenShare}
                        isDrawerOpen={isDrawerOpen}
                        activeTab={activeTab}
                        toggleChatTab={toggleChatTab}
                        togglePeopleTab={togglePeopleTab}
                        leaveMeeting={leaveMeeting}
                    />
                </div>
            )}
        </div>
    );
}