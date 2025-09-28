import { useForm } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import axiosClient from '../axiosClient'

const ByteBuddyChat = ({problem,userCode,language}) => {
  const [messages, setMessages] = useState([
    { 
      role: "model", 
      parts: [{ text: "Hello, I'm your buddy, ByteBuddy. How can I help you?" }] 
    }
  ]);
  const [isThinking, setIsThinking] = useState(false); // ✅ Add thinking state
  const { register, handleSubmit, reset } = useForm();
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);
  const onSubmit = async (data) => {
    if (data.message.trim()) {
      // Add user message in the new format
      const newUserMessage = { 
        role: "user", 
        parts: [{ text: data.message }] 
      };
      const updatedMessages = [...messages, newUserMessage];
      
      // ✅ Update state with the new array
      setMessages(updatedMessages);
      setIsThinking(true); // ✅ Show thinking message
      // Reset form
      // Reset form
      reset();
      try{
        const response=await axiosClient.post("/byteBuddy/chat",{
          messages: updatedMessages,
          title:problem.title,
          description:problem.description,
          startCode:problem.startCode,
          testCases:problem.visibleTestCases,
          userCode: userCode,           // ✅ Send current user code
          language: language,           // ✅ Send current language
        });
        console.log(response.data.response);
        setMessages(prev => [...prev, { 
          role: "model", 
          parts: [{ text: response.data.response }] 
        }]);
      }
      catch(err){
        console.error("Error communicating with ByteBuddy:", err);
        setMessages(prev => [...prev, { 
          role: "model", 
          parts: [{ text: "Sorry, I'm having trouble responding right now. Please try again later." }] 
        }]);
      }
      finally {
        setIsThinking(false); // ✅ Hide thinking message
      }
    }
  };

  const clearChat = () => {
    setMessages([{ 
      role: "model", 
      parts: [{ text: "Hello, I'm your buddy, ByteBuddy. How can I help you?" }] 
    }]);
    setIsThinking(false);
  };

  const handleSuggestionClick = async (suggestion) => {
    setMessages(prev => [...prev, { 
      role: "user", 
      parts: [{ text: suggestion }] 
    }]);
    
    const updatedMessages = [...messages, 
      { 
        role: "user", 
        parts: [{ text: suggestion }] 
      }
    ]; //React’s state updates (setMessages) are asynchronous, so the new state value is NOT immediately reflected in the messages variable after a setMessages call. By building updatedMessages locally, the function guarantees it’s using the most up-to-date array for the API request
      
      // ✅ Update state with the new array
      setMessages(updatedMessages);
      setIsThinking(true);
      // Reset form
      reset();
      console.log("messages: ", updatedMessages);
      try{
        const response=await axiosClient.post("/byteBuddy/chat",{
          messages: updatedMessages,
          title:problem.title,
          description:problem.description,
          startCode:problem.startCode,
          testCases:problem.visibleTestCases,
          userCode: userCode,
          language: language,
        });
        console.log(response.data.response);
        setMessages(prev => [...prev, { 
          role: "model", 
          parts: [{ text: response.data.response }] 
        }]);
      }
      catch(err){
        console.error("Error communicating with ByteBuddy:", err);
        setMessages(prev => [...prev, { 
          role: "model", 
          parts: [{ text: "Sorry, I'm having trouble responding right now. Please try again later." }] 
        }]);
      }
      finally {
        setIsThinking(false); // ✅ Hide thinking message
      }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-zinc-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">ByteBuddy</h3>
        </div>
        <button 
          onClick={clearChat}
          className="text-zinc-400 hover:text-zinc-300 text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700/50 hover:border-zinc-600/50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
  
      {/* Chat Messages Container - This grows and scrolls internally */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{
         scrollbarWidth: 'thin',
         scrollbarColor: '#52525b #27272a'
      }}>
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {/* AI Message (Left aligned) */}
            {message.role === 'model' && (
              <>
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-lg rounded-bl-none p-3">
                    <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">{message.parts[0].text}</p>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 ml-1">ByteBuddy</p>
                </div>
              </>
            )}
  
            {/* User Message (Right aligned) */}
            {message.role === 'user' && (
              <>
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-red-600/80 rounded-lg rounded-br-none p-3">
                    <p className="text-xs text-white leading-relaxed">{message.parts[0].text}</p>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 mr-1 text-right">You</p>
                </div>
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-medium text-blue-400">U</span>
                </div>
              </>
            )}
          </div>
        ))}
        
        {/* Thinking Message */}
        {isThinking && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-4 h-4 text-red-400 animate-pulse">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-lg rounded-bl-none p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-xs text-zinc-400">ByteBuddy is thinking...</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-1 ml-1">ByteBuddy</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
  
      {/* Suggestions - Fixed height */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            "💡 Fix my code",
            "🎯 Am I approaching correctly?", 
            "⚡ Analyze complexity",
            "📚 Explain this concept"
          ].map((suggestion, index) => (
            <button 
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isThinking}
              className={`text-xs text-left p-2.5 rounded-lg border border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-700/50 hover:border-zinc-600/50 text-zinc-300 transition-all duration-200 hover:scale-[1.02] ${
                isThinking ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
  
      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-zinc-700/50 bg-zinc-900/50">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              {...register('message')}
              disabled={isThinking}
              className={`w-full bg-zinc-800 border border-zinc-600/50 rounded-lg py-3 px-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all ${
                isThinking ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder={isThinking ? "ByteBuddy is thinking..." : "Ask ByteBuddy anything..."}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={isThinking}
            className={`bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center min-w-[48px] focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
              isThinking ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isThinking ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        
        {/* Helper text */}
        <p className="text-xs text-zinc-500 mt-2 text-center">
          {isThinking ? "Please wait while ByteBuddy processes your request..." : "Press Enter to send • Be specific for better help"}
        </p>
      </div>
    </div>
  );
  
};

export default ByteBuddyChat;