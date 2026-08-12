'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Sword, Heart, Package, MapPin } from 'lucide-react';

interface Player {
  health: number;
  hunger: number;
  position: { x: number; y: number };
  inventory: Array<{ name: string; qty: number }>;
}

interface NPC {
  id: number;
  name: string;
  x: number;
  y: number;
  health: number;
  faction: string;
  message: string;
  lastAction: number;
}

const WORLD_SIZE = 18;
const PLAYER_START = { x: 4, y: 8 };

export default function SurvivalGame() {
  const [player, setPlayer] = useState<Player>({
    health: 92,
    hunger: 34,
    position: { ...PLAYER_START },
    inventory: [
      { name: "Rusty Axe", qty: 1 },
      { name: "Canned Beans", qty: 3 },
      { name: "Bandage", qty: 2 },
    ]
  });

  const [npcs, setNpcs] = useState<NPC[]>([
    { id: 1, name: "Elias", x: 12, y: 5, health: 100, faction: "Wanderer", message: "The woods are full of them...", lastAction: Date.now() },
    { id: 2, name: "Mara", x: 7, y: 14, health: 65, faction: "Reclaimer", message: "Need bullets?", lastAction: Date.now() },
    { id: 3, name: "Rogue", x: 15, y: 11, health: 40, faction: "Bandit", message: "Get lost!", lastAction: Date.now() },
  ]);

  const [logs, setLogs] = useState<string[]>([
    " You wake up in an abandoned forest outpost.",
    "The wind carries distant screams.",
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const [showWin, setShowWin] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev.slice(0, 5)]);
  };

  const movePlayer = (dx: number, dy: number) => {
    setPlayer(prev => {
      const newX = Math.max(0, Math.min(WORLD_SIZE - 1, prev.position.x + dx));
      const newY = Math.max(0, Math.min(WORLD_SIZE - 1, prev.position.y + dy));
      
      let newHunger = Math.min(100, prev.hunger + 3);
      let newHealth = prev.health;
      
      if (newHunger > 88) {
        newHealth = Math.max(10, newHealth - 6);
        addLog(" Hunger is killing you...");
      }
      
      const newPlayer = {
        ...prev,
        position: { x: newX, y: newY },
        hunger: newHunger,
        health: newHealth,
      };
      
      // Check for NPC collision
      const nearbyNPC = npcs.find(n => 
        Math.abs(n.x - newX) <= 1 && Math.abs(n.y - newY) <= 1
      );
      
      if (nearbyNPC) {
        setSelectedNPC(nearbyNPC);
        addLog(`️ ${nearbyNPC.name} (${nearbyNPC.faction}): "${nearbyNPC.message}"`);
        
        if (nearbyNPC.faction === "Bandit" && Math.random() > 0.6) {
          setTimeout(() => {
            setPlayer(p => ({...p, health: Math.max(15, p.health - 22)}));
            addLog("️ Bandit attacked you!");
          }, 420);
        }
      }
      
      // Check win condition
      if (newX === 16 && newY === 3) {
        setTimeout(() => setShowWin(true), 600);
      }
      
      return newPlayer;
    });
  };

  const useItem = (itemName: string) => {
    setPlayer(prev => {
      const itemIndex = prev.inventory.findIndex(i => i.name === itemName);
      if (itemIndex === -1) return prev;
      
      const item = prev.inventory[itemIndex];
      let newHealth = prev.health;
      let newHunger = prev.hunger;
      
      if (itemName.includes("Beans")) {
        newHunger = Math.max(8, newHunger - 38);
        addLog(" You ate canned beans. Hunger reduced.");
      } else if (itemName.includes("Bandage")) {
        newHealth = Math.min(100, newHealth + 32);
        addLog(" You bandaged your wounds.");
      } else if (itemName.includes("Axe")) {
        addLog(" You swing your axe. Nothing to chop here.");
      }
      
      const newInventory = [...prev.inventory];
      newInventory[itemIndex] = { ...item, qty: item.qty - 1 };
      
      if (newInventory[itemIndex].qty <= 0) {
        newInventory.splice(itemIndex, 1);
      }
      
      return {
        ...prev,
        health: newHealth,
        hunger: newHunger,
        inventory: newInventory,
      };
    });
  };

  const simulateNPCs = useCallback(() => {
    setNpcs(prevNpcs => {
      return prevNpcs.map(npc => {
        if (Date.now() - npc.lastAction < 2200) return npc;
        
        const actions = ["wander", "talk", "idle"];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        let newX = npc.x;
        let newY = npc.y;
        let newMessage = npc.message;
        
        if (action === "wander") {
          newX = Math.max(1, Math.min(WORLD_SIZE - 2, npc.x + (Math.random() > 0.5 ? 1 : -1)));
          newY = Math.max(1, Math.min(WORLD_SIZE - 2, npc.y + (Math.random() > 0.5 ? 1 : -1)));
        } 
        else if (action === "talk") {
          const messages = {
            "Wanderer": ["Stay safe out there.", "I saw a tower to the northeast...", "They're getting closer."],
            "Reclaimer": ["We protect what's left.", "Trading is fair here.", "The old world is gone."],
            "Bandit": ["This is our land!", "Hand over your supplies!", "Run while you can."],
          };
          newMessage = messages[npc.faction as keyof typeof messages][Math.floor(Math.random() * 3)];
        }
        
        return {
          ...npc,
          x: newX,
          y: newY,
          message: newMessage,
          lastAction: Date.now(),
        };
      });
    });
  }, []);

  // Game loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setGameTime(t => t + 1);
        simulateNPCs();
        
        // Random world events
        if (Math.random() < 0.1) {
          const events = [
            "️ It begins to rain. Visibility drops.",
            " You hear wolves in the distance.",
            " Your flashlight flickers...",
          ];
          addLog(events[Math.floor(Math.random() * events.length)]);
        }
        
        // Hunger tick
        setPlayer(p => {
          if (p.health <= 0) {
            setIsRunning(false);
            addLog("️ YOU DIED.");
            return p;
          }
          return {
            ...p,
            hunger: Math.min(100, p.hunger + 1),
          };
        });
      }, 1100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, simulateNPCs]);

  const resetGame = () => {
    setPlayer({
      health: 92,
      hunger: 34,
      position: { ...PLAYER_START },
      inventory: [
        { name: "Rusty Axe", qty: 1 },
        { name: "Canned Beans", qty: 3 },
        { name: "Bandage", qty: 2 },
      ]
    });
    setNpcs([
      { id: 1, name: "Elias", x: 12, y: 5, health: 100, faction: "Wanderer", message: "The woods are full of them...", lastAction: Date.now() },
      { id: 2, name: "Mara", x: 7, y: 14, health: 65, faction: "Reclaimer", message: "Need bullets?", lastAction: Date.now() },
      { id: 3, name: "Rogue", x: 15, y: 11, health: 40, faction: "Bandit", message: "Get lost!", lastAction: Date.now() },
    ]);
    setLogs([" Reset complete. You are back at the outpost.", "Try reaching the tower at (16, 3)"]);
    setGameTime(0);
    setIsRunning(false);
    setShowWin(false);
    setSelectedNPC(null);
  };

  const getTileContent = (x: number, y: number) => {
    const npcHere = npcs.find(n => n.x === x && n.y === y);
    if (npcHere) return '';
    
    if (x === 16 && y === 3) return '';
    if ((x + y) % 5 === 0) return '';
    if ((x * 3 + y) % 7 === 0) return '️';
    return '·';
  };

  return (
    <div className="h-full bg-[#0a0a0a] text-white flex flex-col overflow-hidden font-mono">
      <div className="bg-black border-b border-red-900/60 px-6 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="text-red-500">●</div>
            <span>SURVIVAL WORLD v0.3 • PROTOTYPE</span>
          </div>
          <div className="text-emerald-400">DAY {Math.floor(gameTime / 4) + 1}</div>
        </div>
        
        <div className="flex items-center gap-8 text-[10px]">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500 w-4 h-4" /> 
            <span className={player.health < 30 ? 'text-red-400' : ''}>{player.health}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" /> 
            {player.inventory.length} ITEMS
          </div>
          <div>HUNGER: <span className={player.hunger > 70 ? 'text-orange-400' : ''}>{player.hunger}</span></div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-5 py-1 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-700 rounded-xl flex items-center gap-2 text-xs transition-all"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'PAUSE' : 'SIMULATE'}
          </button>
          <button 
            onClick={resetGame}
            className="px-4 py-1 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Game World */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050505] relative">
          <div className="mb-6 flex items-center gap-3 text-xs text-zinc-500">
            <MapPin className="w-4 h-4" /> USE ARROW KEYS or WASD • REACH THE TOWER
          </div>
          
          <div 
            className="grid gap-px bg-zinc-900 p-2 rounded-3xl shadow-2xl shadow-black/90"
            style={{ 
              gridTemplateColumns: `repeat(${WORLD_SIZE}, minmax(0, 1fr))`,
              width: 'fit-content'
            }}
          >
            {Array.from({ length: WORLD_SIZE * WORLD_SIZE }).map((_, index) => {
              const x = index % WORLD_SIZE;
              const y = Math.floor(index / WORLD_SIZE);
              const isPlayer = x === player.position.x && y === player.position.y;
              const tile = getTileContent(x, y);
              
              return (
                <div 
                  key={index}
                  className={`w-8 h-8 flex items-center justify-center text-xl border border-zinc-800/80 transition-all relative ${isPlayer ? 'bg-red-900/60 scale-125 z-20 shadow-xl' : 'hover:bg-zinc-800'}`}
                >
                  {isPlayer ? '' : tile}
                  {isPlayer && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-600 text-[9px] px-2 py-px rounded tracking-widest">YOU</div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 flex gap-3">
            {[
              { label: '↑', keys: ['w', 'ArrowUp'], dx: 0, dy: -1 },
              { label: '←', keys: ['a', 'ArrowLeft'], dx: -1, dy: 0 },
              { label: '↓', keys: ['s', 'ArrowDown'], dx: 0, dy: 1 },
              { label: '→', keys: ['d', 'ArrowRight'], dx: 1, dy: 0 },
            ].map(dir => (
              <button
                key={dir.label}
                onClick={() => movePlayer(dir.dx, dir.dy)}
                className="w-14 h-14 bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 active:bg-white active:text-black rounded-2xl text-3xl flex items-center justify-center transition-all"
              >
                {dir.label}
              </button>
            ))}
          </div>
          
          <div className="absolute bottom-8 right-8 bg-black/90 border border-zinc-700 text-xs p-4 rounded-2xl max-w-[240px]">
            <div className="font-semibold mb-3 text-amber-400">OBJECTIVE</div>
            <div className="leading-snug text-zinc-400">Reach the <span className="text-white">radio tower</span> at coordinates (16, 3) before hunger consumes you. Interact with NPCs. Manage resources.</div>
            <div className="text-[10px] text-zinc-500 mt-6">FRONTIER AI NPCs SIMULATED IN REAL-TIME</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col">
          {/* NPCs */}
          <div className="p-6 border-b border-zinc-800">
            <div className="uppercase text-xs tracking-widest mb-4 text-zinc-400">NEARBY AI NPCs</div>
            
            <div className="space-y-3">
              {npcs.map(npc => {
                const distance = Math.abs(npc.x - player.position.x) + Math.abs(npc.y - player.position.y);
                return (
                  <div 
                    key={npc.id}
                    onClick={() => setSelectedNPC(npc)}
                    className={`bg-zinc-900 border border-zinc-700 p-4 rounded-2xl cursor-pointer transition-all hover:border-white/70 ${selectedNPC?.id === npc.id ? 'border-violet-400' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl"></div>
                        <div>
                          <div className="font-medium">{npc.name}</div>
                          <div className="text-[10px] text-emerald-400">{npc.faction}</div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-zinc-500">DIST</div>
                        <div>{distance}</div>
                      </div>
                    </div>
                    <div className="text-xs mt-4 text-rose-300 line-clamp-1">“{npc.message}”</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory */}
          <div className="p-6 border-b border-zinc-800 flex-1">
            <div className="flex justify-between items-center mb-4">
              <div className="uppercase text-xs tracking-widest text-zinc-400">INVENTORY</div>
              <Sword className="w-4 h-4 text-zinc-400" />
            </div>
            
            <div className="space-y-2">
              {player.inventory.length > 0 ? player.inventory.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => useItem(item.name)}
                  className="flex justify-between items-center bg-zinc-900 border border-zinc-800 hover:border-amber-300 px-4 py-4 rounded-2xl cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">️</span>
                    <div>
                      <div>{item.name}</div>
                      <div className="text-[10px] text-zinc-500">x{item.qty}</div>
                    </div>
                  </div>
                  <div className="text-emerald-400 text-xs opacity-0 group-hover:opacity-100 transition">USE</div>
                </div>
              )) : (
                <div className="text-xs text-zinc-600 p-8 text-center border border-dashed border-zinc-700 rounded-3xl">Your pack is empty.</div>
              )}
            </div>
            
            {player.inventory.length > 0 && (
              <div className="text-[10px] text-center text-zinc-600 mt-8">CLICK ITEMS TO USE</div>
            )}
          </div>

          {/* Live Log */}
          <div className="flex-1 flex flex-col min-h-0 border-t border-zinc-800">
            <div className="px-6 py-4 text-xs uppercase tracking-widest border-b border-zinc-800 bg-black text-zinc-400">WORLD LOG</div>
            <div className="flex-1 p-6 text-xs font-light text-zinc-300 space-y-4 overflow-auto leading-relaxed bg-[#0a0a0a]">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>

          <div className="p-4 text-[10px] text-center text-zinc-600 border-t border-zinc-800 bg-black">
            FRONTIER GAME PROTOTYPE • AI NPCs HAVE PROCEDURAL BEHAVIOR
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {showWin && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="max-w-md text-center">
            <div className="text-7xl mb-6"></div>
            <div className="text-4xl font-bold tracking-tighter mb-2">TRANSMISSION SENT</div>
            <div className="text-emerald-400 mb-8">You survived long enough to reach the tower.</div>
            
            <div className="bg-zinc-900 border border-emerald-900 rounded-3xl p-8 mb-12 text-left text-sm">
              The signal has been received. Help is coming.<br /><br />
              <span className="text-emerald-400">FINAL STATS</span><br />
              Time survived: {gameTime} seconds<br />
              NPCs encountered: 3<br />
              Final health: {player.health}%
            </div>
            
            <button 
              onClick={resetGame}
              className="px-14 py-5 border border-white text-white hover:bg-white hover:text-black text-sm tracking-widest rounded-2xl transition-all"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
