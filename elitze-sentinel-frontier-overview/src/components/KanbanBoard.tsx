'use client';

import React, { useState, useEffect } from 'react';
import { Plus, User, Clock, Zap } from 'lucide-react';

interface KanbanCard {
  id: number;
  title: string;
  description: string;
  status: 'ideas' | 'building' | 'testing' | 'ready';
  assignee: string;
  priority: number;
}

const statusConfig = {
  ideas: { label: 'IDEAS', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  building: { label: 'BUILDING', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  testing: { label: 'TESTING', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  ready: { label: 'READY', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
};

const mockAgents = ['Game Director', 'NPC Designer', 'Unreal Engineer', 'Economy Designer', 'QA Agent', 'Quest Designer'];

export default function KanbanBoard() {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from DB
    setTimeout(() => {
      setCards([
        { id: 1, title: "Create NPC faction system", description: "Define 3 rival survivor factions with unique behaviors", status: "ideas", assignee: "NPC Designer", priority: 1 },
        { id: 2, title: "Generate cinematic trailer", description: "Create a 30-second teaser video for the prototype", status: "ideas", assignee: "Game Director", priority: 2 },
        { id: 3, title: "Implement AI economy & crafting", description: "Dynamic pricing based on scarcity, procedural item generation", status: "building", assignee: "Economy Designer", priority: 1 },
        { id: 4, title: "Build combat system", description: "Melee + ranged combat with stamina and enemy AI", status: "building", assignee: "Unreal Engineer", priority: 2 },
        { id: 5, title: "Balance difficulty curve", description: "Test NPC aggression, resource scarcity and survival pacing", status: "testing", assignee: "QA Agent", priority: 1 },
        { id: 6, title: "Export WebGL prototype build", description: "Package playable demo for browser sharing", status: "ready", assignee: "Unreal Engineer", priority: 1 },
      ]);
      setIsLoading(false);
    }, 420);
  }, []);

  const columns = ['ideas', 'building', 'testing', 'ready'] as const;

  const getCardsForStatus = (status: string) => {
    return cards.filter(card => card.status === status);
  };

  const moveCard = (cardId: number, newStatus: 'ideas' | 'building' | 'testing' | 'ready') => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, status: newStatus } : card
    ));
  };

  const createNewCard = () => {
    const newCard: KanbanCard = {
      id: Date.now(),
      title: "New Survival Feature",
      description: "Describe the new system or asset here...",
      status: 'ideas',
      assignee: mockAgents[Math.floor(Math.random() * mockAgents.length)],
      priority: Math.floor(Math.random() * 3) + 1,
    };
    setCards(prev => [...prev, newCard]);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <div className="uppercase text-xs tracking-[2px] text-zinc-500 mb-1">PROJECT KANBAN</div>
          <div className="text-3xl font-semibold tracking-tighter">Survival World</div>
        </div>
        
        <button 
          onClick={createNewCard}
          className="flex items-center gap-2 bg-white hover:bg-amber-200 text-black px-6 py-3 rounded-2xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> NEW CARD
        </button>
      </div>

      <div className="flex-1 p-8 grid grid-cols-4 gap-6 overflow-hidden">
        {columns.map(status => {
          const statusInfo = statusConfig[status];
          const columnCards = getCardsForStatus(status);
          
          return (
            <div key={status} className="flex flex-col">
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-3xl mb-5 w-fit ${statusInfo.color}`}>
                {statusInfo.label}
                <span className="bg-black/30 text-[10px] px-2 py-px rounded-full">{columnCards.length}</span>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scroll">
                {columnCards.map(card => (
                  <div 
                    key={card.id}
                    className="bg-zinc-900 border border-zinc-700 rounded-3xl p-5 group hover:border-violet-500/60 transition-all cursor-grab active:cursor-grabbing"
                    onClick={() => {
                      const statuses = ['ideas','building','testing','ready'];
                      const currentIndex = statuses.indexOf(card.status);
                      const nextStatus = statuses[(currentIndex + 1) % 4] as 'ideas' | 'building' | 'testing' | 'ready';
                      moveCard(card.id, nextStatus);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium leading-tight pr-6">{card.title}</div>
                      <div className="text-[22px] opacity-30 group-hover:opacity-70 transition-opacity">↗</div>
                    </div>
                    
                    <div className="mt-4 text-sm text-zinc-400 line-clamp-3">
                      {card.description}
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-700 rounded-2xl flex items-center justify-center text-base">
                          
                        </div>
                        <div>
                          <div className="font-mono text-zinc-500 text-[10px]">ASSIGNED TO</div>
                          <div className="text-white">{card.assignee}</div>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 text-[10px] font-mono rounded-2xl border ${statusInfo.color}`}>
                        P{card.priority}
                      </div>
                    </div>
                  </div>
                ))}
                
                {columnCards.length === 0 && (
                  <div className="h-40 flex items-center justify-center text-xs text-zinc-600 border border-dashed border-zinc-700 rounded-3xl">
                    No cards yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="px-8 py-4 border-t border-zinc-800 text-xs font-mono flex items-center justify-between text-zinc-500 bg-zinc-900">
        <div>AI KANBAN • DRAG CARDS BETWEEN COLUMNS TO PROGRESS • 14 TOTAL TASKS</div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" /> 4 AGENTS WORKING
          </div>
          <div>UPDATED JUST NOW</div>
        </div>
      </div>
    </div>
  );
}
