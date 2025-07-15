import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { GameData, Round, Player } from "@/types";
import { GameSettingsTab, BuyInsTab, RoundTab, ResultsTab } from "./AdminTabs";

interface AdminViewProps {
  currentGame: GameData;
  setCurrentGame: (game: GameData | null) => void;
  setCurrentView: (view: string) => void;
  gameTimer: number;
  setGameTimer: (timer: number) => void;
  formatTime: (seconds: number) => string;
  updatePlayerStats: (playerName: string, game: GameData) => void;
}

export const AdminView = ({ 
  currentGame, 
  setCurrentGame, 
  setCurrentView, 
  gameTimer, 
  setGameTimer, 
  formatTime, 
  updatePlayerStats 
}: AdminViewProps) => {
  const [activeTab, setActiveTab] = useState("раунд");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const [finalChips, setFinalChips] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  
  const [currentRound, setCurrentRound] = useState({
    winners: [] as string[],
    dealer: "",
    combination: "",
    comment: "",
  });
  
  const [selectedForBuyIn, setSelectedForBuyIn] = useState<string[]>([]);
  const [buyInAmounts, setBuyInAmounts] = useState<{ [key: string]: number }>({});
  
  const [gameSettings, setGameSettings] = useState({
    name: currentGame?.name || "",
    smallBlind: currentGame?.smallBlind || 5,
    bigBlind: currentGame?.bigBlind || 10,
    startingStack: currentGame?.startingStack || 1000,
    chipToRuble: currentGame?.chipToRuble || 1,
  });
  
  const [newPlayerName, setNewPlayerName] = useState("");

  if (!currentGame) return null;

  const addRound = () => {
    if (currentRound.winners.length > 0 && currentRound.dealer && currentRound.combination) {
      const newRound: Round = {
        id: Date.now().toString(),
        winners: currentRound.winners,
        dealer: currentRound.dealer,
        combination: currentRound.combination,
        comment: currentRound.comment,
        timestamp: new Date(),
      };

      setCurrentGame({
        ...currentGame,
        rounds: [...currentGame.rounds, newRound]
      });

      setCurrentRound({
        winners: [],
        dealer: "",
        combination: "",
        comment: "",
      });
    }
  };

  const addBuyIns = () => {
    if (selectedForBuyIn.length > 0) {
      const newBuyIns = { ...currentGame.buyins };
      selectedForBuyIn.forEach(player => {
        newBuyIns[player] = (newBuyIns[player] || 0) + 1;
      });
      
      setCurrentGame({
        ...currentGame,
        buyins: newBuyIns
      });
      
      setSelectedForBuyIn([]);
      setBuyInAmounts({});
    }
  };

  const updateGameSettings = () => {
    setCurrentGame({
      ...currentGame,
      name: gameSettings.name,
      smallBlind: gameSettings.smallBlind,
      bigBlind: gameSettings.bigBlind,
      startingStack: gameSettings.startingStack,
      chipToRuble: gameSettings.chipToRuble,
    });
  };

  const addPlayerToGame = () => {
    if (newPlayerName.trim() && !currentGame.players.includes(newPlayerName.trim())) {
      setCurrentGame({
        ...currentGame,
        players: [...currentGame.players, newPlayerName.trim()],
        buyins: {
          ...currentGame.buyins,
          [newPlayerName.trim()]: 1
        }
      });
      setNewPlayerName("");
    }
  };

  const calculateResults = () => {
    const results = currentGame.players.map(player => {
      const buyInCount = currentGame.buyins[player] || 0;
      const buyInChips = buyInCount * currentGame.startingStack;
      const buyInRubles = buyInChips * currentGame.chipToRuble;
      const finalChipsAmount = finalChips[player] || 0;
      const finalRubles = finalChipsAmount * currentGame.chipToRuble;
      const profit = finalRubles - buyInRubles;
      
      return {
        player,
        buyInCount,
        buyInChips,
        buyInRubles,
        finalChips: finalChipsAmount,
        finalRubles,
        profit
      };
    });
    
    return results;
  };

  const finishGame = () => {
    setCurrentGame({
      ...currentGame,
      isActive: false,
      gameEndTime: new Date()
    });
    setShowResults(true);
  };

  const tabs = [
    { id: "настройки", name: "Настройки игры", icon: "Settings" },
    { id: "закупы", name: "Закупы", icon: "CreditCard" },
    { id: "раунд", name: "Раунд", icon: "Target" },
    { id: "итоги", name: "Итоги", icon: "Calculator" },
  ];

  return (
    <div className="min-h-screen" style={{backgroundColor: '#000000'}}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Icon name="Trophy" size={20} className="text-white" />
            </div>
            <h1 className="text-white text-2xl font-bold">Lozo Poker</h1>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setCurrentView('dashboard')} 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Дашборд
            </Button>
            <Button 
              onClick={() => setCurrentView('lobby')} 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-4 py-2 rounded-md"
            >
              Лобби
            </Button>
          </div>
        </div>

        <h2 className="text-white text-3xl font-bold mb-2">{currentGame.name}</h2>
        <p className="text-gray-400 mb-8">Администрирование игры</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Время игры</p>
                <p className="text-white text-xl font-bold">{formatTime(gameTimer)}</p>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <Icon name="Clock" size={16} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Раунды</p>
                <p className="text-white text-xl font-bold">{currentGame.rounds.length}</p>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <Icon name="Target" size={16} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Игроки</p>
                <p className="text-white text-xl font-bold">{currentGame.players.length}</p>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <Icon name="Users" size={16} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Блайнды</p>
                <p className="text-white text-xl font-bold">{currentGame.smallBlind}/{currentGame.bigBlind}</p>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <Icon name="Coins" size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-700 mb-8">
          <div className="md:hidden p-4 border-b border-gray-700">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 justify-between"
            >
              <span>{tabs.find(tab => tab.id === activeTab)?.name}</span>
              <Icon name={isMobileMenuOpen ? "ChevronUp" : "ChevronDown"} size={20} />
            </Button>
            {isMobileMenuOpen && (
              <div className="mt-4 space-y-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeTab === tab.id
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <Icon name={tab.icon as any} size={16} className="mr-2" />
                    {tab.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex border-b border-gray-700">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant="ghost"
                className={`rounded-none border-b-2 ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-500 bg-gray-800"
                    : "border-transparent text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon name={tab.icon as any} size={16} className="mr-2" />
                {tab.name}
              </Button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "настройки" && (
              <GameSettingsTab 
                gameSettings={gameSettings}
                setGameSettings={setGameSettings}
                updateGameSettings={updateGameSettings}
                timerRunning={timerRunning}
                setTimerRunning={setTimerRunning}
                newPlayerName={newPlayerName}
                setNewPlayerName={setNewPlayerName}
                addPlayerToGame={addPlayerToGame}
                gameTimer={gameTimer}
                setGameTimer={setGameTimer}
                formatTime={formatTime}
              />
            )}

            {activeTab === "закупы" && (
              <BuyInsTab 
                selectedForBuyIn={selectedForBuyIn}
                setSelectedForBuyIn={setSelectedForBuyIn}
                buyInAmounts={buyInAmounts}
                setBuyInAmounts={setBuyInAmounts}
                addBuyIns={addBuyIns}
                currentGame={currentGame}
              />
            )}

            {activeTab === "раунд" && (
              <RoundTab 
                currentRound={currentRound}
                setCurrentRound={setCurrentRound}
                addRound={addRound}
                currentGame={currentGame}
              />
            )}

            {activeTab === "итоги" && (
              <ResultsTab 
                finalChips={finalChips}
                setFinalChips={setFinalChips}
                showResults={showResults}
                calculateResults={calculateResults}
                finishGame={finishGame}
                currentGame={currentGame}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};