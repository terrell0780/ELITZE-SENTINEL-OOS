'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Play, Pause } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_PROMPT = "Build me a survival game prototype with AI NPCs.";

export default function FrontierChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello, Creator. I'm Frontier — the open creation OS.\n\nWhat do you want to create today?",
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'user',
      content: INITIAL_PROMPT,
      timestamp: new Date(Date.now() + 1000),
    },
    {
      id: '3',
      role: 'assistant',
      content: "Understood. Initializing **Survival World** prototype.\n\nActivating specialized agents:\n• Game Director \n• Unreal Engineer \n• NPC Designer \n• Economy Designer \n• Quest Designer \n• QA Agent \n\nBuilding a browser-playable survival prototype with dynamic AI NPCs, resource scarcity, crafting, and procedural quests.\n\nThe world is being generated...",
      timestamp: new Date(Date.now() + 2500),
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: ' Game', prompt: 'Build a survival game prototype with AI NPCs' },
    { label: ' Video', prompt: 'Generate a cinematic trailer for the survival game' },
    { label: ' App', prompt: 'Create a companion web app for tracking survival stats' },
    { label: ' Image', prompt: 'Generate concept art for the post-apocalyptic world' },
    { label: ' Agent', prompt: 'Create a new autonomous NPC behavior agent' },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Simulate Frontier thinking and responding
    setTimeout(() => {
      const responses = [
        "Agent swarm updated. NPC faction \"The Reclaimers\" now has improved pathfinding and reputation-based dialogue.",
        "Crafting system complete. 27 new recipes added. Scarcity engine now dynamically adjusts loot tables based on player actions.",
        "Quest chain 'Echoes of the Fall' integrated. Voice lines synthesized using local models.",
        "Performance stabilized at 62 FPS with 24 active AI entities. Memory footprint reduced by 41%.",
        "Generating new assets... The world feels alive. Would you like to play the current build, adjust difficulty, or expand the map?",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 1350);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const toggleSimulation = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white">
      {/* Chat Header */}
      <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-inner">
            
          </div>
          <div>
            <div className="font-semibold tracking-tighter text-2xl">FRONTIER</div>
            <div className="text-[10px] text-emerald-400 font-mono -mt-1">ELITZE SENTINEL v0.8.4 • LIVE</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-full px-4 py-1 text-emerald-400 text-xs font-mono">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            7 AGENTS ONLINE
          </div>
          <button 
            onClick={toggleSimulation}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-2 rounded-2xl transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-xs font-medium">{isPlaying ? 'PAUSE SIM' : 'RUN SIM'}</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 bg-[radial-gradient(#27272a_0.8px,transparent_1px)] bg-[length:24px_24px]"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex-shrink-0 flex items-center justify-center text-xl mt-1">
                
              </div>
            )}
            
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'bg-white text-zinc-900' : 'bg-zinc-900 border border-zinc-700'} rounded-3xl px-6 py-4 text-[15px] leading-relaxed`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {msg.role === 'assistant' && msg.id === '3' && (
                <div className="mt-6 pt-6 border-t border-zinc-700 text-xs font-mono text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> 
                  FRONTIER INTELLIGENCE ENGINE ACTIVE • 3.2s
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-2xl bg-white/10 flex-shrink-0 flex items-center justify-center text-xl mt-1"></div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex-shrink-0 flex items-center justify-center text-xl mt-1"></div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                <span className="text-xs font-mono text-zinc-500">AGENTS COORDINATING...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-zinc-800 bg-zinc-900 p-4">
        <div className="text-xs uppercase tracking-[1px] text-zinc-500 mb-3 px-2">SUGGESTED CREATIONS</div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.prompt)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-white text-sm px-5 py-2.5 rounded-2xl transition-all active:scale-[0.985]"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-700 bg-zinc-900 p-5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe what you want to create, change, or automate..."
            className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-3xl py-5 px-7 pr-16 text-base placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black h-11 w-11 flex items-center justify-center rounded-2xl disabled:opacity-40 hover:bg-amber-300 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center text-[10px] text-zinc-500 mt-3 font-mono">FRONTIER understands natural language • Powered by Frontier Intelligence Engine</div>
      </div>
    </div>
  );
}
