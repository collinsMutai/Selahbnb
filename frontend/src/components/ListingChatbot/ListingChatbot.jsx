import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ListingChatbot.css";
import Selah_Logo from "../../images/Selah_Logo.png";

const ListingChatbot = ({ listingId }) => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I can help with pricing, availability, location, and booking questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // 🔽 Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ------------------- Send message to chatbot -------------------
  const sendMessageToBot = async (userText) => {
    const response = await axios.post(
      `${apiUrl}/chatbot/chat`,
      { message: userText, listingId },
      { withCredentials: true }
    );
    return response.data;
  };

  // ------------------- Handle send -------------------
  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessageToBot(userText);
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Render -------------------
  return (
    <div className={`chatbot-wrapper ${open ? "open" : ""}`}>
     {/* Floating Button */}
{!open && (
  <div className="chatbot-toggle" onClick={() => setOpen(true)}>
    <img
      src={Selah_Logo}
      alt="Chat Logo"
      className="chatbot-logo"
    />
    <div className="chatbot-icon">💬</div>
    <div className="chatbot-text">Chat with us</div>
  </div>
)}


      {/* Chat Window */}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            Chat with us
            <button className="chatbot-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}

            {loading && <div className="chat-message bot">Typing…</div>}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about price, availability, location…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingChatbot;
