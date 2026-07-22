import React from "react";

export default function ChatDrawer({ 
    isChatOpen, 
    setIsChatOpen, 
    messages, 
    username, 
    messageInput, 
    setMessageInput, 
    sendMessage 
}) {
    if (!isChatOpen) return null;

    return (
        <div className="w-full md:w-80 bg-gray-800 border-l border-gray-700 flex flex-col absolute md:relative right-0 top-0 bottom-0 z-40 h-full">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                <h3 className="font-semibold">Meeting Chat</h3>
                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === username ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-400 mb-1">{msg.sender}</span>
                        <div className={`px-4 py-2 rounded-lg max-w-[85%] text-sm break-words ${msg.sender === username ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            {msg.data}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 flex gap-2 bg-gray-800 shrink-0">
                <input 
                    type="text" 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Message..." 
                    className="flex-1 bg-gray-700 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
                <button type="submit" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">Send</button>
            </form>
        </div>
    );
}