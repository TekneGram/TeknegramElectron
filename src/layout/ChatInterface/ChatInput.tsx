import '@/styles/layout.css';

const ChatInput = () => {
    return (
        <div className="chat-input-shell">
            <textarea 
                id="chat-input"
                className="chat-input"
                rows={2}
                placeholder="Chat with your corpus"
            />
        </div>
    );
};

export default ChatInput;
