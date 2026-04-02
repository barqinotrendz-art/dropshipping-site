import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useSocialSettings } from '../hooks/useSocialSettings';

const WhatsAppChat: React.FC = () => {
  const { data: socialSettings } = useSocialSettings();
  const [showMessages, setShowMessages] = useState(false);

  if (!socialSettings?.whatsapp) return null;

  // 💬 Predefined messages
  const messages = [
    'Hello! I have a question about your products.',
    'Hi! I want to track my order.',
    'Hey! I’m interested in bulk purchasing.',
  ];

  const handleSendMessage = (message: string) => {
    const whatsappUrl = `https://wa.me/${socialSettings.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowMessages(false);
  };

  return (
    <div className="fixed right-4 bottom-24 sm:right-6 sm:bottom-6 z-50 flex flex-col items-end">
      {/* Toggle Message List */}
      {showMessages && (
        <div className="mb-2 bg-white border rounded-lg shadow-lg overflow-hidden w-64 animate-fadeIn">
          {messages.map((msg, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(msg)}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-100 border-b last:border-b-0"
            >
              {msg}
            </button>
          ))}
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <button
        onClick={() => setShowMessages(!showMessages)}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-3xl" />
        <span className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Chat with us
        </span>
      </button>
    </div>
  );
};

export default WhatsAppChat;
