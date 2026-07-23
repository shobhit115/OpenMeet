import React, { useEffect, useRef, useState } from "react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAuth } from "../contexts/AuthContext";
import { useWebRTC } from "../hooks/useWebRTC";

import LobbyScreen from "../components/video/LobbyScreen";
import ChatDrawer from "../components/video/ChatDrawer";
import ControlBar from "../components/video/ControlBar";
import MeetingLayout from "../components/video/MeetingLayout";

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
    const [localScreenStream, setLocalScreenStream] = useState(null);

    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState(userData?.name || userData?.username || "");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");
    const [unreadCount, setUnreadCount] = useState(0);
    const [messageInput, setMessageInput] = useState("");
    const [pinnedId, setPinnedId] = useState(null); 

    const roomPath = window.location.pathname;
    const { connect, disconnect, sendChatMessage, peerConnectionsRef, remoteStreams, remoteUsers, messages, streamTypes } = useWebRTC(roomPath, username, showMessage);
    
    const toggleChatTab = () => { setIsDrawerOpen(prev => !(prev && activeTab === 'chat')); setActiveTab("chat"); };
    const togglePeopleTab = () => { setIsDrawerOpen(prev => !(prev && activeTab === 'people')); setActiveTab("people"); };
    const handlePin = (id) => setPinnedId(prev => prev === id ? null : id);

    // Media Permissions
    useEffect(() => {
        const getPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                window.localStream = stream;

                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = stream;

                setVideoAvailable(true); setAudioAvailable(true);
            } catch (err) {
                console.error("Permissions denied", err);
                setVideoAvailable(false); setAudioAvailable(false); setVideoState(false); setAudioState(false);
                showMessage("Camera/Microphone permissions denied. Joining to watch only.", "error");
            }
            if (navigator.mediaDevices?.getDisplayMedia) setScreenAvailable(true);
        };
        getPermission();
    }, []);

    // Local stream routing based on lobby vs meeting
    useEffect(() => {
        if (askForUsername && window.localStream && lobbyVideoRef.current) lobbyVideoRef.current.srcObject = window.localStream;
    }, [askForUsername]);

    useEffect(() => {
        if (!askForUsername && window.localStream && localVideoRef.current && videoState) {
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername, videoState]);

    // Unread count logic
    useEffect(() => { if (isDrawerOpen && activeTab === 'chat') setUnreadCount(0); }, [isDrawerOpen, activeTab]);
    useEffect(() => { if ((!isDrawerOpen || activeTab !== 'chat') && messages.length > 0) setUnreadCount(prev => prev + 1); }, [messages.length]);

    // Auto-unpin on leave
    useEffect(() => {
        if (pinnedId && pinnedId !== 'local' && pinnedId !== 'local-screen') {
            const isPinnedPresent = remoteStreams.some(peer => `${peer.socketId}-${peer.stream?.id || 'no-stream'}` === pinnedId);
            if (!isPinnedPresent) {
                setPinnedId(null);
                showMessage("Pinned user left the meeting", "info");
            }
        }
    }, [remoteStreams, pinnedId, showMessage]);

    // Meeting Controls
    const connectToMeeting = () => {
        if (!username.trim()) return showMessage("Please enter a username", "error");
        setAskForUsername(false); connect();
    };

    const toggleAudio = () => {
        const track = window.localStream?.getAudioTracks()[0];
        if (track) { track.enabled = !audioState; setAudioState(!audioState); }
    };

    const toggleVideo = () => {
        const track = window.localStream?.getVideoTracks()[0];
        if (track) { track.enabled = !videoState; setVideoState(!videoState); }
    };

    const handleScreenShare = async () => {
        if (screenState) return stopScreenShare();
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = screenStream.getVideoTracks()[0];
            
            setLocalScreenStream(screenStream); window.localScreenStream = screenStream; setScreenState(true);

            Object.values(peerConnectionsRef.current).forEach(pc => {
                if (pc.signalingState !== 'closed') pc.addTrack(videoTrack, screenStream);
            });

            videoTrack.onended = stopScreenShare;
            showMessage("You started sharing your screen", "info");
            sendChatMessage(`📢 ${username} started sharing their screen`);
        } catch (error) {
            console.error("Screen share cancelled", error);
        }
    };

    const stopScreenShare = () => {
        if (localScreenStream) {
            const screenTrack = localScreenStream.getVideoTracks()[0];
            Object.values(peerConnectionsRef.current).forEach(pc => {
                if (pc.signalingState !== 'closed') {
                    const sender = pc.getSenders().find(s => s.track === screenTrack);
                    if (sender) try { pc.removeTrack(sender); } catch (e) { console.error(e) }
                }
            });
            localScreenStream.getTracks().forEach(t => t.stop());
        }
        setLocalScreenStream(null); window.localScreenStream = null; setScreenState(false);
        showMessage("Screen sharing stopped", "info");
        sendChatMessage(`📢 ${username} stopped sharing their screen`);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        sendChatMessage(messageInput);
        setMessageInput("");
    };

    const leaveMeeting = () => {
        stopScreenShare();
        if (window.localStream) window.localStream.getTracks().forEach(track => track.stop());
        disconnect();
        window.location.href = "/home";
    };

    if (askForUsername) {
        return (
            <div className="h-screen w-full bg-[#313338] font-sans flex flex-col overflow-hidden text-white">
                <LobbyScreen 
                    lobbyVideoRef={lobbyVideoRef}
                    videoAvailable={videoAvailable} audioAvailable={audioAvailable}
                    videoState={videoState} audioState={audioState}
                    toggleAudio={toggleAudio} toggleVideo={toggleVideo}
                    username={username} setUsername={setUsername}
                    connectToMeeting={connectToMeeting}
                />
            </div>
        );
    }

    const totalParticipantsCount = 1 + (screenState ? 1 : 0) + remoteStreams.length;

    return (
        <div className="h-screen w-full bg-[#313338] font-sans flex flex-col overflow-hidden text-white">
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                <div className="flex-1 flex flex-row overflow-hidden relative h-full">
                    <div className="flex-1 p-2 sm:p-4 overflow-hidden flex flex-col relative z-0 h-full">
                        <MeetingLayout 
                            pinnedId={pinnedId}
                            handlePin={handlePin}
                            remoteStreams={remoteStreams}
                            remoteUsers={remoteUsers}
                            streamTypes={streamTypes}
                            localVideoProps={{
                                videoAvailable, videoState, localVideoRef, username, 
                                isPinned: pinnedId === 'local', onPin: () => handlePin('local')
                            }}
                            localScreenProps={{
                                localScreenStream, screenState, 
                                isPinned: pinnedId === 'local-screen', onPin: () => handlePin('local-screen')
                            }}
                        />
                    </div>

                    <ChatDrawer
                        isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen}
                        activeTab={activeTab} setActiveTab={setActiveTab}
                        messages={messages} username={username}
                        messageInput={messageInput} setMessageInput={setMessageInput}
                        sendMessage={handleSendMessage} remoteUsers={remoteUsers}
                        remoteStreams={remoteStreams} audioState={audioState} videoState={videoState}
                    />
                </div>

                <ControlBar
                    audioState={audioState} videoState={videoState} screenState={screenState}
                    audioAvailable={audioAvailable} videoAvailable={videoAvailable} screenAvailable={screenAvailable}
                    unreadCount={unreadCount} participantsCount={totalParticipantsCount}
                    toggleAudio={toggleAudio} toggleVideo={toggleVideo} handleScreenShare={handleScreenShare}
                    isDrawerOpen={isDrawerOpen} activeTab={activeTab}
                    toggleChatTab={toggleChatTab} togglePeopleTab={togglePeopleTab}
                    leaveMeeting={leaveMeeting}
                />
            </div>
        </div>
    );
}