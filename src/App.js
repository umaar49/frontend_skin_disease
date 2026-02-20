import React from 'react';
import ModelStats from './components/ModelStats';
import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
const apiUrl = process.env.REACT_APP_API_URL;
const renderMarkdown = (text) => {
  return marked.parse(text, { breaks: true, gfm: true });
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, chatLoading]);

  // Handle file logic
  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPrediction(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => processFile(e.target.files[0]);
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };

  const handlePredict = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch(`${apiUrl}/predict`, { method: 'POST', body: formData });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim()) return;
    const userQuery = query;
    setMessages(prev => [...prev, { type: 'user', text: userQuery }]);
    setQuery('');
    setChatLoading(true);
    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.result }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Error connecting to assistant.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]"></div>
      </div>

      <nav className="relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Skin Disease <span className="text-indigo-500">Detection</span></span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          AI Skin <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Analysis.</span>
        </h1>
        <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">Upload or drag an image of the Acne, Candidiasis, Bullous, Vitiligo, Mole  for an instant AI-powered dermatological assessment.</p>

        <div 
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          className={`bg-slate-900/40 border-2 border-dashed transition-all duration-300 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl 
            ${isDragging ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]' : 'border-slate-800 hover:border-slate-700'}`}
        >
          {!preview ? (
            <div className="p-16 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-indigo-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Drop your image here</h3>
              <p className="text-slate-500 mb-8">Supports JPG, PNG (Max 5MB)</p>
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="group relative bg-indigo-600 px-10 py-4 rounded-2xl font-bold text-white overflow-hidden transition-all hover:bg-indigo-500"
              >
                <span className="relative z-10">Select Image</span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="p-8 grid md:grid-cols-2 gap-8 text-left">
              <div className="relative group">
                <img src={preview} alt="Preview" className="rounded-2xl border border-slate-700 w-full object-cover aspect-square" />
                <button onClick={() => {setPreview(null); setSelectedFile(null); setPrediction(null);}} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full hover:bg-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex flex-col justify-center">
                {!prediction ? (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-2">Image Captured</h3>
                    <p className="text-slate-400 mb-8">Our neural network is ready to analyze this sample.</p>
                    <button onClick={handlePredict} disabled={loading} className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white disabled:opacity-50 animate-pulse-subtle">
                      {loading ? 'Analyzing Neural Patterns...' : 'Start Full Analysis'}
                    </button>
                  </>
                ) : (
                  <div className="bg-indigo-500/10 p-8 rounded-[2rem] border border-indigo-500/20">
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">Analysis Result</p>
                    <h4 className="text-3xl font-bold text-white mb-6">{prediction.predicted_class}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-400">Confidence Score</span>
                        <span className="text-indigo-400">{(prediction.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${prediction.confidence * 100}%` }}></div>
                      </div>
                    </div>
                    <button onClick={() => {setPreview(null); setPrediction(null);}} className="mt-8 text-slate-500 hover:text-indigo-400 text-sm font-semibold transition-colors w-full text-center">Perform Another Scan</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat UI */}
      <div className={`fixed bottom-24 right-8 z-50 transition-all duration-500 ${isChatOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="w-[350px] h-[500px] bg-slate-900 border border-slate-700/50 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl">
          <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
              <div><h3 className="font-bold text-white">Skin Care Assistant</h3><span className="text-[10px] text-emerald-400 font-bold uppercase">Online</span></div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10 px-6">
                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                <p className="text-slate-400 text-sm">I'm your AI assistant. Ask me anything about skin conditions, treatments, or general dermatology questions.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700/50 rounded-tl-none text-slate-200'}`}>
                  {msg.type === 'user' ? <p className="text-sm leading-relaxed">{msg.text}</p> : 
                    <div className="text-sm markdown-container" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                  }
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-indigo-400 text-xs font-medium bg-indigo-500/5 p-3 rounded-xl w-fit">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                Analyzing query...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative flex items-center">
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about treatments..." className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-5 pr-14 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              <button onClick={handleSendMessage} className="absolute right-2 bg-indigo-600 p-2.5 rounded-xl text-white hover:bg-indigo-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className={`fixed bottom-8 right-8 w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 z-40 ${isChatOpen ? 'bg-slate-800 rotate-90' : 'bg-indigo-600 hover:scale-110'}`}>
        {isChatOpen ? <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
      </button>

      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.9; transform: scale(0.99); } }
        .animate-pulse-subtle { animation: pulse-subtle 3s infinite ease-in-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        
        /* Markdown Styling Fixes */
        .markdown-container h1, .markdown-container h2, .markdown-container h3 {
          color: #818cf8;
          font-weight: 800;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        .markdown-container p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .markdown-container strong {
          color: #ffffff;
          font-weight: 700;
        }
        .markdown-container ul {
          list-style-type: disc;
          margin-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .markdown-container li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}

export default App;
