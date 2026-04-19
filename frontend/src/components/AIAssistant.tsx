'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, X, MessageSquare, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const responseEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setIsActive(true);
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const reader = res.body?.getReader();
      const utf8Decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = utf8Decoder.decode(value, { stream: true });
          setResponse((prev) => prev + chunk);
        }
      }
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setResponse('Παρουσιάστηκε σφάλμα κατά την επικοινωνία με τον AI Βοηθό. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`ai-assistant-container ${isActive ? 'active' : ''}`}>
      {!isActive ? (
        <form onSubmit={handleSubmit} className="ai-input-wrapper glass-panel">
          <div className="ai-input-icon">
            <Sparkles size={24} className="text-blue-400" />
          </div>
          <input 
            type="text" 
            placeholder="Ρωτήστε το AI για τη νομοθεσία (π.χ. 'Τι προβλέπει ο νόμος 5294;')" 
            className="ai-main-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="ai-send-btn" disabled={!query.trim() || isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      ) : (
        <div className="ai-response-view glass-panel">
          <div className="ai-response-header">
            <div className="flex items-center gap-2 text-blue-400">
              <Sparkles size={20} />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button onClick={() => setIsActive(false)} className="close-ai-btn">
              <ChevronDown size={20} />
            </button>
          </div>
          
          <div className="ai-chat-thread">
            <div className="user-query-bubble">
              <span className="text-xs uppercase opacity-50 block mb-1">Η ερώτησή σας</span>
              {query}
            </div>
            
            <div className="ai-response-bubble">
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{response || 'Ο AI βοηθός σκέφτεται...'}</ReactMarkdown>
                {isSubmitting && !response && (
                   <div className="flex gap-1 mt-4">
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                )}
              </div>
              <div ref={responseEndRef} />
            </div>
          </div>

          <div className="ai-follow-up">
             <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Κάντε νέα ερώτηση..." 
                  className="ai-follow-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="ai-follow-send" disabled={isSubmitting}>
                  <Send size={18} />
                </button>
             </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-assistant-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ai-input-wrapper {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          gap: 0.75rem;
          border-radius: 1.5rem;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2);
          border: 1px solid var(--color-border-glass);
        }

        .ai-main-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 1rem 0;
          font-size: 1.1rem;
          color: inherit;
          outline: none;
        }

        .ai-send-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 1rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .ai-send-btn:hover { transform: scale(1.05); }
        .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ai-response-view {
          min-height: 400px;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
          border-radius: 1.5rem;
          overflow: hidden;
        }

        .ai-response-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--color-border-glass);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.05);
        }

        .ai-chat-thread {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .user-query-bubble {
          align-self: flex-end;
          background: var(--color-primary);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 1.25rem 1.25rem 0 1.25rem;
          max-width: 80%;
          font-size: 1rem;
        }

        .ai-response-bubble {
          align-self: flex-start;
          background: rgba(255,255,255,0.05);
          padding: 1.25rem;
          border-radius: 0 1.25rem 1.25rem 1.25rem;
          border: 1px solid var(--color-border-glass);
          width: 100%;
        }

        .ai-follow-up {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--color-border-glass);
          background: rgba(0,0,0,0.05);
        }

        .ai-follow-input {
          flex: 1;
          background: rgba(0,0,0,0.1);
          border: 1px solid var(--color-border-glass);
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: inherit;
          outline: none;
        }

        .ai-follow-send {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 0.75rem;
          cursor: pointer;
        }

        .close-ai-btn {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          opacity: 0.6;
        }
        .close-ai-btn:hover { opacity: 1; }
      `}</style>
    </div>
  );
}
