import React, { useState, useEffect } from 'react';
import './ChatWindow.css';
import close from './close-428-16.png';

const ChatWindow = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);

  const steps = [
    { delay: 3000, content: "Привіт!" },
    { delay: 3000, content: "Чим я вам можу допомогти?" },
    {
      delay: 3000,
      content: (
        <div className="options">
          <div onClick={() => handleOptionClick('Який сьогодні день?')}>Який сьогодні день?</div>
          <div onClick={() => handleOptionClick('Яка зараз година?')}>Яка зараз година?</div>
          <div onClick={() => handleOptionClick('Скільки днів до Нового Року?')}>Скільки днів до Нового Року?</div>
          <div onClick={() => handleOptionClick('Своє питання')}>Своє питання</div>
        </div>
      )
    },
  ];

  useEffect(() => {
    if (isChatOpen && currentStep < steps.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: prev.length + 1, content: steps[currentStep].content }]);
        setCurrentStep((prev) => prev + 1);
      }, steps[currentStep].delay);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isChatOpen]);

  const toggleChat = () => {
    if (!isChatOpen) {
      setCurrentStep(0);
      setMessages([]);
      setIsTyping(false);
      setIsCustomQuestion(false);
    }
    setIsChatOpen(!isChatOpen);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const handleOptionClick = (option) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, content: option }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (option === 'Своє питання') {
        setIsCustomQuestion(true);
      } else {
        let response;
        switch (option) {
          case 'Який сьогодні день?':
            response = { id: messages.length + 2, content: `Сьогодні ${new Date().toLocaleDateString('uk-UA', { weekday: 'long' })}` };
            break;
          case 'Яка зараз година?':
            response = { id: messages.length + 2, content: `Зараз ${new Date().toLocaleTimeString('uk-UA')}` };
            break;
          case 'Скільки днів до Нового Року?':
            const today = new Date();
            const newYear = new Date(today.getFullYear() + 1, 0, 1);
            const diffTime = Math.abs(newYear - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            response = { id: messages.length + 2, content: `До Нового Року залишилося ${diffDays} днів.` };
            break;
          default:
            response = { id: messages.length + 2, content: 'Невідома команда.' };
            break;
        }
        setMessages((prev) => [...prev, response]);
        setIsCustomQuestion(false);
      }
    }, 3000);
  };

  const hideInputField = () => {
    setIsCustomQuestion(false);
  };

  const handleUserMessage = async (e) => {
    e.preventDefault();
    const userInput = e.target.elements.userMessage.value;
    if (!userInput) return;

    setMessages((prev) => [...prev, { id: prev.length + 1, content: userInput }]);
    e.target.elements.userMessage.value = '';

    setIsTyping(true);

    try {
      await fetch('https://example.com/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: prev.length + 1, content: "Дякую за ваше повідомлення!" }]);
        hideInputField();
      }, 1500);
    } catch (error) {
      console.error('Помилка повідомлення:', error);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: prev.length + 1, content: "Дякую за ваше повідомлення!" }]);
        hideInputField();
      }, 1500);
    }
  };

  return (
    <div className="chat-window">
      <button className="chat-toggle-button" onClick={toggleChat}>
        Чат
      </button>
      {isChatOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <button className="chat-close-button" onClick={closeChat}><img src={close}/></button>
          </div>
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className="message">
                {message.content}
              </div>
            ))}
            {isTyping && <div className="typing">Введення<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></div>}
          </div>
          {isCustomQuestion && (
            <form className="chat-input" onSubmit={handleUserMessage}>
              <input type="text" name="userMessage" placeholder="Введіть своє питання..." />
              <button type="submit">Надіслати</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
