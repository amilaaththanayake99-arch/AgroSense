import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import './ChatWidget.css';

const cleanChatText = (text, lang) => {
  if (!text || typeof text !== 'string') return text;
  if (!lang || lang === 'English') {
    let cleaned = text.replace(/[\u0D80-\u0DFF\u0B80-\u0BFF\u200B-\u200D]/g, '');
    cleaned = cleaned
      .replace(/\(\s*[/,-]?\s*\)/g, '')
      .replace(/\[\s*[/,-]?\s*\]/g, '')
      .replace(/\s*\/\s*\)/g, ')')
      .replace(/\(\s*\/\s*/g, '(')
      .replace(/\s*[/,-]\s*$/g, '')
      .replace(/^\s*[/,-]\s*/, '')
      .replace(/[ ]{2,}/g, ' ')
      .trim();
    return cleaned;
  }
  return text;
};

const SUGGESTIONS = {
  disease: {
    English: [
      "DOA fungicides for Paddy Blast",
      "How to treat Grape Downy Mildew?",
      "Organic Neem spray recipe",
      "What causes leaf curling in chili?"
    ],
    "සිංහල": [
      "වී කොළ කරායං වලට DOA බෙහෙත්",
      "මිදි පිනි පුස් රෝගයට පිළියම්",
      "කාබනික කොහොඹ කසාය හදන හැටි",
      "මිරිස් කොළ කොඩවීමට හේතු සහ බෙහෙත්"
    ],
    "தமிழ்": [
      "நெல் குலை நோய்க்கான மருந்துகள்",
      "திராட்சை சாம்பல் நோய் தீர்வு",
      "வேப்பங்கொட்டை கரைசல் தயாரிப்பு",
      "மிளகாய் இலை சுருட்டல் நோய்க்கான தீர்வு"
    ]
  },
  crop: {
    English: [
      "Best crops for Maha season",
      "Paddy fertilizer schedule (DOA)",
      "Chili spacing & land prep",
      "Manning & Dambulla wholesale prices"
    ],
    "සිංහල": [
      "මාස් කන්නයට වඩාත්ම සුදුසු බෝග",
      "වී සඳහා DOA පොහොර නිර්දේශ",
      "මිරිස් සිටුවීමේ පරතරය සහ බිම් සැකසීම",
      "දඹුල්ල හා මැනිං වෙළඳපොළ තොග මිල"
    ],
    "தமிழ்": [
      "பெரும்போகத்திற்கான சிறந்த பயிர்கள்",
      "நெல் உரமிடும் DOA அட்டவணை",
      "மிளகாய் நடுகை இடைவெளி மற்றும் நிலம் தயாரித்தல்",
      "தம்புள்ளை மற்றும் மெனிங் சந்தை மொத்த விலைகள்"
    ]
  }
};

const ChatWidget = ({ mode = 'crop' }) => {
  const { language, t } = useLanguage();

  const isDiseaseMode = mode === 'disease';

  const activeSuggestions = (SUGGESTIONS[isDiseaseMode ? 'disease' : 'crop'] && 
    SUGGESTIONS[isDiseaseMode ? 'disease' : 'crop'][language]) || 
    SUGGESTIONS[isDiseaseMode ? 'disease' : 'crop']['English'];

  const getInitialMessage = () => {
    if (isDiseaseMode) {
      return {
        id: 'welcome',
        role: 'assistant',
        content: t('diseaseChatWelcome', '**Hello!** I am your AgriSense AI Plant Doctor & Crop Pathologist.\n\nAsk me anything about:\n* Leaf spots, curling, wilting, and yellowing\n* Fungal, bacterial, and viral pathogen diagnosis\n* Department of Agriculture (DOA) chemical & organic treatments\n* Preventive spray schedules & field sanitation')
      };
    }
    return {
      id: 'welcome',
      role: 'assistant',
      content: t('chatWelcome', '**Hello!** I am your AgriSense AI Agricultural Advisor.\n\nAsk me anything about:\n* Crop varieties and Maha/Yala planting guides\n* DOA recommended fertilizer schedules\n* Pest and disease treatments\n* Market prices and harvesting advice')
    };
  };

  const [messages, setMessages] = useState([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `${mode}_session_` + Math.random().toString(36).substr(2, 9));
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Update welcome message if language or mode changes and only welcome message is present
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [getInitialMessage()];
      }
      return prev;
    });
  }, [language, mode]);

  // Scroll ONLY the inner chat messages container, NEVER the window
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Only scroll down when user or assistant sends a new message after initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = (typeof textToSend === 'string' ? textToSend : input).trim();
    if (!query || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Append strict language context if not English to assist multilingual generation
      const contextualQuery = language && language !== 'English' 
        ? `${query} (Please reply strictly in ${language})` 
        : query;

      const data = await sendChatMessage(contextualQuery, sessionId, language, mode);
      const rawResponse = data.response || (language === 'සිංහල' 
        ? 'කෘෂිකර්ම දෙපාර්තමේන්තුවේ නිර්දේශයන් අනුගමනය කරන්න.' 
        : (language === 'தமிழ்'
          ? 'விவசாயத் திணைக்களத்தின் வழிகாட்டுதல்களைப் பின்பற்றுங்கள்.'
          : 'I recommend following Department of Agriculture (DOA) guidelines for optimal yield.'));

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanChatText(rawResponse, language)
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      let fallbackText = language === 'සිංහල'
        ? '**නිර්දේශය:** පාංශු පරීක්ෂාවකට අනුව කෘෂිකර්ම දෙපාර්තමේන්තුවේ නිර්දේශිත පොහොර මාත්‍රාව යොදන්න.'
        : (language === 'தமிழ்'
          ? '**பரிந்துரை:** விவசாயத் திணைக்களத்தின் வழிகாட்டுதலின்படி உரம் இடவும்.'
          : '**Recommendation:** Ensure balanced fertilizer application following DOA guidelines.');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackText
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      <div className="chat-widget-window glass-panel">
        <div className="chat-widget-header">
          <div className="chat-widget-brand">
            <Sparkles size={18} className="text-primary-dark" />
            <span>{isDiseaseMode ? t('diseaseChatTitle', 'AI Plant Doctor') : t('chatTitle', 'AgriSense AI Assistant')}</span>
          </div>
          <span className="chat-widget-badge">{isDiseaseMode ? 'Plant Doctor AI' : 'Agronomist AI'}</span>
        </div>

        <div className="chat-widget-messages" ref={messagesContainerRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-widget-msg ${msg.role}`}>
              <div className="chat-widget-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="chat-widget-bubble">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-widget-msg assistant">
              <div className="chat-widget-avatar"><Bot size={16} /></div>
              <div className="chat-widget-bubble loading-bubble">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {activeSuggestions && activeSuggestions.length > 0 && (
          <div className="chat-suggestions-bar">
            {activeSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="chat-suggestion-chip"
                onClick={() => handleSendMessage(s.replace(/^[^\w\u0D80-\u0DFF\u0B80-\u0BFF]+/, ''))}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="chat-widget-input">
          <input 
            type="text"
            placeholder={isDiseaseMode ? t('diseaseChatPlaceholder', 'Ask about plant symptoms, remedies, or disease prevention...') : t('chatPlaceholder', 'Ask a crop or farming question...')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={loading}
          />
          <button 
            className="chat-widget-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
