"use client";
import { useState } from 'react';
import { Send, LayoutDashboard, Brain, Sparkles, Zap, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface AIResponse {
  name: string;
  content: string;
  status: 'success' | 'error';
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const preprocessMarkdown = (content: string) => {
    return content
      .replace(/\\\[/g, '$$$')
      .replace(/\\\]/g, '$$$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$');
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResults([]); 
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

const getIcon = (name: string) => {
  if (name.includes("Gemini")) return <Sparkles className="text-blue-400" size={18} />;
  if (name.includes("Chat")) return <Zap className="text-green-400" size={18} />;
  if (name.includes("Mistral")) return <Brain className="text-orange-400" size={18} />;
  if (name.includes("Meta")) return <Bot className="text-zinc-400" size={18} />;
};

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/30 mb-2">
            <LayoutDashboard className="text-blue-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Broadcaster</h1>
          <p className="text-zinc-400 max-w-md">One prompt, four perspectives.</p>
        </div>

        {/* Input Area */}
        <div className="sticky top-4 z-50 flex gap-2 bg-zinc-900/80 backdrop-blur-md p-3 rounded-2xl border border-zinc-800 shadow-2xl">
          <input 
            className="bg-transparent flex-1 px-3 py-2 outline-none text-zinc-100 placeholder:text-zinc-500"
            placeholder="Ask your models..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl disabled:opacity-50 transition-all"
          >
            {loading ? "Broadcasting..." : "Send"}
          </button>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((res) => (
            <div key={res.name} className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
              <div className="bg-zinc-800/50 px-4 py-3 flex justify-between items-center border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  {getIcon(res.name)}
                  <span className="font-semibold text-zinc-200">{res.name}</span>
                </div>
                <div className={`h-2 w-2 rounded-full ${res.status === 'success' ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              </div>
              <div className="p-5 overflow-y-auto max-h-[400px]">
                <div className="text-zinc-300 text-sm leading-relaxed prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {preprocessMarkdown(res.content)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}