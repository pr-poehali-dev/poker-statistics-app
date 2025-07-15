import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Icon from "@/components/ui/icon";

// Game data interface
interface GameData {
  id: string;
  name: string;
  players: string[];
  chipToRuble: number;
  startingStack: number;
  smallBlind: number;
  bigBlind: number;
  gameStartTime?: Date;
  gameEndTime?: Date;
  isActive: boolean;
  rounds: Round[];
  buyins: { [playerName: string]: number };
}

interface Round {
  id: string;
  winners: string[];
  dealer: string;
  combination: string;
  comment: string;
  timestamp: Date;
}

interface Player {
  id: string;
  name: string;
  totalGames: number;
  totalWins: number;
  winRate: number;
  favoriteCombination: string;
  bestDealer: string;
  totalBuyIns: number;
  totalBuyInChips: number;
}

const Index = () => {
  const [games, setGames] = useState<GameData[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [currentView, setCurrentView] = useState<"lobby" | "admin" | "dashboard" | "create-game" | "manage-players">("lobby");
  const [gameTimer, setGameTimer] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Функция для создания базовой статистики игрока
  const createPlayerStats = (name: string): Player => ({
    id: Date.now().toString(),
    name,
    totalGames: 0,
    totalWins: 0,
    winRate: 0,
    favoriteCombination: "Не определена",
    bestDealer: "Не определен",
    totalBuyIns: 0,
    totalBuyInChips: 0,
  });

  // Обновляем статистику игрока
  const updatePlayerStats = (playerName: string, game: GameData) => {
    const playerWins = game.rounds.filter(round => round.winners.includes(playerName)).length;
    const playerCombinations = game.rounds.filter(round => round.winners.includes(playerName)).map(round => round.combination);
    const playerDealers = game.rounds.filter(round => round.winners.includes(playerName)).map(round => round.dealer);
    
    const mostFrequentCombination = playerCombinations.reduce((a, b, i, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b, playerCombinations[0]
    );
    
    const mostFrequentDealer = playerDealers.reduce((a, b, i, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b, playerDealers[0]
    );

    setPlayers(prev => prev.map(player => 
      player.name === playerName ? {
        ...player,
        totalGames: player.totalGames + 1,
        totalWins: player.totalWins + playerWins,
        winRate: Math.round(((player.totalWins + playerWins) / (player.totalGames + 1)) * 100),
        favoriteCombination: mostFrequentCombination || "Не определена",
        bestDealer: mostFrequentDealer || "Не определен",
        totalBuyIns: player.totalBuyIns + (game.buyins[playerName] || 0),
        totalBuyInChips: player.totalBuyInChips + ((game.buyins[playerName] || 0) * game.startingStack),
      } : player
    ));
  };

  // Функция для получения статистики игрока в текущей игре
  const getPlayerGameStats = (playerName: string) => {
    if (!currentGame) return null;
    
    const wins = currentGame.rounds.filter(round => round.winners.includes(playerName)).length;
    const totalRounds = currentGame.rounds.length;
    const winRate = totalRounds > 0 ? Math.round((wins / totalRounds) * 100) : 0;
    
    const playerCombinations = currentGame.rounds.filter(round => round.winners.includes(playerName)).map(round => round.combination);
    const playerDealers = currentGame.rounds.filter(round => round.winners.includes(playerName)).map(round => round.dealer);
    
    const mostFrequentCombination = playerCombinations.reduce((a, b, i, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b, playerCombinations[0]
    );
    
    const mostFrequentDealer = playerDealers.reduce((a, b, i, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b, playerDealers[0]
    );

    return {
      wins,
      winRate,
      favoriteCombination: mostFrequentCombination || "Не определена",
      bestDealer: mostFrequentDealer || "Не определен",
      buyIns: currentGame.buyins[playerName] || 0,
      buyInChips: (currentGame.buyins[playerName] || 0) * currentGame.startingStack,
    };
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentGame && currentGame.isActive) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentGame]);

  // Состояние таймера
  const [timerRunning, setTimerRunning] = useState(true);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentGame && currentGame.isActive && timerRunning) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentGame, timerRunning]);

  // Format time function
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Lobby View - Стартовый экран
  const LobbyView = () => {
    const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
    const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);
    
    return (
      <div className="min-h-screen" style={{backgroundColor: '#000000'}}>
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Icon name="Trophy" size={20} className="text-white" />
              </div>
              <h1 className="text-white text-2xl font-bold">Lozo Poker</h1>
            </div>
            <div className="flex gap-3">
              <Dialog open={isManagePlayersOpen} onOpenChange={setIsManagePlayersOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    <Icon name="Users" size={16} className="mr-2" />
                    Игроки
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Управление игроками</DialogTitle>
                  </DialogHeader>
                  <ManagePlayersDialog />
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать игру
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Создание новой игры</DialogTitle>
                  </DialogHeader>
                  <CreateGameDialog onClose={() => setIsCreateGameOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Список игр */}
          <div className="mb-8">
            <h2 className="text-white text-xl font-semibold mb-4">Игры</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <div key={game.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">{game.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      game.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {game.isActive ? 'Активная' : 'Завершена'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Игроки:</span>
                      <span className="text-white">{game.players.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Раунды:</span>
                      <span className="text-white">{game.rounds.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Блайнды:</span>
                      <span className="text-white">{game.smallBlind}/{game.bigBlind}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setCurrentGame(game);
                      setCurrentView(game.isActive ? "admin" : "dashboard");
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {game.isActive ? 'Продолжить' : 'Просмотр'}
                  </Button>
                </div>
              ))}
              
              {games.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Trophy" size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg">Нет созданных игр</p>
                  <p className="text-gray-500 text-sm">Создайте первую игру для начала</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Компонент управления игроками
  const ManagePlayersDialog = () => {
    const [newPlayerName, setNewPlayerName] = useState("");
    const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const addPlayer = () => {
      if (newPlayerName.trim() && !players.find(p => p.name === newPlayerName.trim())) {
        setPlayers(prev => [...prev, createPlayerStats(newPlayerName.trim())]);
        setNewPlayerName("");
      }
    };

    const updatePlayerName = (oldName: string, newName: string) => {
      if (newName.trim() && !players.find(p => p.name === newName.trim())) {
        setPlayers(prev => prev.map(player => 
          player.name === oldName ? { ...player, name: newName.trim() } : player
        ));
        setEditingPlayer(null);
        setEditName("");
      }
    };

    return (
      <div className="space-y-6">
        {/* Добавить игрока */}
        <div className="flex gap-2">
          <Input
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Имя нового игрока"
            className="bg-gray-800 border-gray-600 text-white"
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
          />
          <Button onClick={addPlayer} className="bg-green-600 hover:bg-green-700">
            <Icon name="Plus" size={16} />
          </Button>
        </div>

        {/* Список игроков */}
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                {editingPlayer === player.name ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && updatePlayerName(player.name, editName)}
                    />
                    <Button onClick={() => updatePlayerName(player.name, editName)} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Icon name="Check" size={16} />
                    </Button>
                    <Button onClick={() => setEditingPlayer(null)} size="sm" variant="outline" className="border-gray-600">
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white font-semibold">{player.name}</h3>
                    <Button 
                      onClick={() => {
                        setEditingPlayer(player.name);
                        setEditName(player.name);
                      }}
                      size="sm" 
                      variant="outline" 
                      className="border-gray-600"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Игры:</p>
                  <p className="text-white font-bold">{player.totalGames}</p>
                </div>
                <div>
                  <p className="text-gray-400">Победы:</p>
                  <p className="text-white font-bold">{player.totalWins}</p>
                </div>
                <div>
                  <p className="text-gray-400">% побед:</p>
                  <p className="text-green-400 font-bold">{player.winRate}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Закупы:</p>
                  <p className="text-white font-bold">{player.totalBuyIns}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400">Любимый дилер:</p>
                  <p className="text-white">{player.bestDealer}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400">Любимая комбинация:</p>
                  <p className="text-white">{player.favoriteCombination}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Компонент создания игры
  const CreateGameDialog = ({ onClose }: { onClose: () => void }) => {
    const [gameName, setGameName] = useState("");
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [startingStack, setStartingStack] = useState(1000);
    const [smallBlind, setSmallBlind] = useState(5);
    const [bigBlind, setBigBlind] = useState(10);
    const [chipToRuble, setChipToRuble] = useState(1);
    const [newPlayerName, setNewPlayerName] = useState("");

    const addNewPlayer = () => {
      if (newPlayerName.trim() && !players.find(p => p.name === newPlayerName.trim())) {
        setPlayers(prev => [...prev, createPlayerStats(newPlayerName.trim())]);
        setSelectedPlayers(prev => [...prev, newPlayerName.trim()]);
        setNewPlayerName("");
      }
    };

    const createGame = () => {
      if (gameName.trim() && selectedPlayers.length >= 2) {
        const newGame: GameData = {
          id: Date.now().toString(),
          name: gameName.trim(),
          players: selectedPlayers,
          startingStack,
          smallBlind,
          bigBlind,
          chipToRuble,
          gameStartTime: new Date(),
          isActive: true,
          rounds: [],
          buyins: Object.fromEntries(selectedPlayers.map(player => [player, 1])),
        };
        
        setGames(prev => [...prev, newGame]);
        setCurrentGame(newGame);
        setCurrentView("admin");
        onClose();
      }
    };

    return (
      <div className="space-y-6">
        {/* Название игры */}
        <div>
          <Label className="text-white">Название игры</Label>
          <Input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="Введите название игры"
          />
        </div>

        {/* Выбор игроков */}
        <div>
          <Label className="text-white">Игроки (минимум 2)</Label>
          <div className="space-y-2 mt-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center space-x-2">
                <Checkbox
                  id={player.id}
                  checked={selectedPlayers.includes(player.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPlayers(prev => [...prev, player.name]);
                    } else {
                      setSelectedPlayers(prev => prev.filter(name => name !== player.name));
                    }
                  }}
                />
                <label htmlFor={player.id} className="text-white cursor-pointer">
                  {player.name}
                </label>
              </div>
            ))}
          </div>
          
          {/* Добавить нового игрока */}
          <div className="flex gap-2 mt-3">
            <Input
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Новый игрок"
              className="bg-gray-800 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && addNewPlayer()}
            />
            <Button onClick={addNewPlayer} className="bg-blue-600 hover:bg-blue-700">
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>

        {/* Настройки игры */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Стартовый стек</Label>
            <Input
              type="number"
              value={startingStack}
              onChange={(e) => setStartingStack(Number(e.target.value))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Фишка к рублю</Label>
            <Input
              type="number"
              value={chipToRuble}
              onChange={(e) => setChipToRuble(Number(e.target.value))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Малый блайнд</Label>
            <Input
              type="number"
              value={smallBlind}
              onChange={(e) => setSmallBlind(Number(e.target.value))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Большой блайнд</Label>
            <Input
              type="number"
              value={bigBlind}
              onChange={(e) => setBigBlind(Number(e.target.value))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={createGame}
            disabled={!gameName.trim() || selectedPlayers.length < 2}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Создать игру
          </Button>
          <Button onClick={onClose} variant="outline" className="border-gray-600">
            Отмена
          </Button>
        </div>
      </div>
    );
  };

  // Admin View - переработанная с вкладками
  const AdminView = () => {
    const [activeTab, setActiveTab] = useState("раунд");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [timerRunning, setTimerRunning] = useState(true);
    const [finalChips, setFinalChips] = useState<{ [key: string]: number }>({});
    const [showResults, setShowResults] = useState(false);
    
    // Состояние для раундов
    const [currentRound, setCurrentRound] = useState({
      winners: [] as string[],
      dealer: "",
      combination: "",
      comment: "",
    });
    
    // Состояние для закупов
    const [selectedForBuyIn, setSelectedForBuyIn] = useState<string[]>([]);
    const [buyInAmounts, setBuyInAmounts] = useState<{ [key: string]: number }>({});
    
    // Состояние для настроек
    const [gameSettings, setGameSettings] = useState({
      name: currentGame?.name || "",
      smallBlind: currentGame?.smallBlind || 5,
      bigBlind: currentGame?.bigBlind || 10,
      startingStack: currentGame?.startingStack || 1000,
      chipToRuble: currentGame?.chipToRuble || 1,
    });
    
    const [newPlayerName, setNewPlayerName] = useState("");

    if (!currentGame) return null;

    // Функции для раундов
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

        setCurrentGame(prev => prev ? {
          ...prev,
          rounds: [...prev.rounds, newRound]
        } : null);

        setCurrentRound({
          winners: [],
          dealer: "",
          combination: "",
          comment: "",
        });
      }
    };

    // Функции для закупов
    const addBuyIns = () => {
      if (selectedForBuyIn.length > 0) {
        const newBuyIns = { ...currentGame.buyins };
        selectedForBuyIn.forEach(player => {
          newBuyIns[player] = (newBuyIns[player] || 0) + 1;
        });
        
        setCurrentGame(prev => prev ? {
          ...prev,
          buyins: newBuyIns
        } : null);
        
        setSelectedForBuyIn([]);
        setBuyInAmounts({});
      }
    };

    // Функции для настроек
    const updateGameSettings = () => {
      setCurrentGame(prev => prev ? {
        ...prev,
        name: gameSettings.name,
        smallBlind: gameSettings.smallBlind,
        bigBlind: gameSettings.bigBlind,
        startingStack: gameSettings.startingStack,
        chipToRuble: gameSettings.chipToRuble,
      } : null);
    };

    const addPlayerToGame = () => {
      if (newPlayerName.trim() && !currentGame.players.includes(newPlayerName.trim())) {
        setCurrentGame(prev => prev ? {
          ...prev,
          players: [...prev.players, newPlayerName.trim()],
          buyins: {
            ...prev.buyins,
            [newPlayerName.trim()]: 1
          }
        } : null);
        setNewPlayerName("");
      }
    };

    // Функции для итогов
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
      setCurrentGame(prev => prev ? {
        ...prev,
        isActive: false,
        gameEndTime: new Date()
      } : null);
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
          {/* Header */}
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

          {/* Game Info Cards */}
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

          {/* Навигация по вкладкам */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 mb-8">
            {/* Мобильное меню */}
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

            {/* Десктопное меню */}
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

            {/* Контент вкладок */}
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

  // Компоненты вкладок
  const GameSettingsTab = ({ gameSettings, setGameSettings, updateGameSettings, timerRunning, setTimerRunning, newPlayerName, setNewPlayerName, addPlayerToGame, gameTimer, setGameTimer }: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">Настройки игры</h3>
          
          <div>
            <Label className="text-white">Название игры</Label>
            <Input
              value={gameSettings.name}
              onChange={(e) => setGameSettings(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Малый блайнд</Label>
              <Input
                type="number"
                value={gameSettings.smallBlind}
                onChange={(e) => setGameSettings(prev => ({ ...prev, smallBlind: Number(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Большой блайнд</Label>
              <Input
                type="number"
                value={gameSettings.bigBlind}
                onChange={(e) => setGameSettings(prev => ({ ...prev, bigBlind: Number(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Стартовый стек</Label>
              <Input
                type="number"
                value={gameSettings.startingStack}
                onChange={(e) => setGameSettings(prev => ({ ...prev, startingStack: Number(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Фишка к рублю</Label>
              <Input
                type="number"
                value={gameSettings.chipToRuble}
                onChange={(e) => setGameSettings(prev => ({ ...prev, chipToRuble: Number(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <Button onClick={updateGameSettings} className="bg-green-600 hover:bg-green-700">
            Сохранить настройки
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">Управление игрой</h3>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Таймер игры</span>
              <div className="text-white text-2xl font-mono">{formatTime(gameTimer)}</div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setTimerRunning(!timerRunning)}
                className={timerRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                <Icon name={timerRunning ? "Pause" : "Play"} size={16} className="mr-2" />
                {timerRunning ? "Пауза" : "Старт"}
              </Button>
              <Button
                onClick={() => setGameTimer(0)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Сброс
              </Button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white font-medium mb-3">Добавить игрока</h4>
            <div className="flex gap-2">
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Имя игрока"
                className="bg-gray-700 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addPlayerToGame()}
              />
              <Button onClick={addPlayerToGame} className="bg-green-600 hover:bg-green-700">
                <Icon name="Plus" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BuyInsTab = ({ selectedForBuyIn, setSelectedForBuyIn, buyInAmounts, setBuyInAmounts, addBuyIns, currentGame }: any) => (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-semibold">Управление закупами</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-white mb-3 block">Выберите игроков для закупа</Label>
          <div className="space-y-3">
            {currentGame.players.map((player: string) => (
              <div key={player} className="flex items-center justify-between bg-gray-800 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedForBuyIn.includes(player)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedForBuyIn([...selectedForBuyIn, player]);
                        setBuyInAmounts(prev => ({ ...prev, [player]: currentGame.startingStack }));
                      } else {
                        setSelectedForBuyIn(selectedForBuyIn.filter(p => p !== player));
                        setBuyInAmounts(prev => {
                          const newAmounts = { ...prev };
                          delete newAmounts[player];
                          return newAmounts;
                        });
                      }
                    }}
                  />
                  <span className="text-white font-medium">{player}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Закупы: {currentGame.buyins[player] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white mb-3 block">Сумма закупа для каждого</Label>
          <div className="space-y-3">
            {selectedForBuyIn.map((player: string) => (
              <div key={player} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{player}</span>
                  <span className="text-sm text-gray-400">
                    в рублях: {((buyInAmounts[player] || currentGame.startingStack) * currentGame.chipToRuble).toFixed(0)}
                  </span>
                </div>
                <Input
                  type="number"
                  value={buyInAmounts[player] || currentGame.startingStack}
                  onChange={(e) => setBuyInAmounts(prev => ({ ...prev, [player]: Number(e.target.value) }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Количество фишек"
                />
              </div>
            ))}
          </div>
          
          {selectedForBuyIn.length > 0 && (
            <Button onClick={addBuyIns} className="mt-4 w-full bg-green-600 hover:bg-green-700">
              Добавить закупы ({selectedForBuyIn.length} игр.)
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const RoundTab = ({ currentRound, setCurrentRound, addRound, currentGame }: any) => (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-semibold">Управление раундами</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-medium mb-4">Добавить новый раунд</h4>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Победители</Label>
              <div className="grid grid-cols-2 gap-2">
                {currentGame.players.map((player: string) => (
                  <div key={player} className="flex items-center space-x-2">
                    <Checkbox
                      checked={currentRound.winners.includes(player)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCurrentRound(prev => ({ ...prev, winners: [...prev.winners, player] }));
                        } else {
                          setCurrentRound(prev => ({ ...prev, winners: prev.winners.filter(w => w !== player) }));
                        }
                      }}
                    />
                    <label className="text-white text-sm cursor-pointer">{player}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white">Дилер</Label>
              <Select value={currentRound.dealer} onValueChange={(value) => setCurrentRound(prev => ({ ...prev, dealer: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите дилера" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {currentGame.players.map((player: string) => (
                    <SelectItem key={player} value={player} className="text-white">{player}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Комбинация</Label>
              <Select value={currentRound.combination} onValueChange={(value) => setCurrentRound(prev => ({ ...prev, combination: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите комбинацию" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {["Пара", "Две пары", "Тройка", "Стрит", "Флеш", "Фулл хаус", "Каре", "Стрит флеш", "Роял флеш"].map((combo) => (
                    <SelectItem key={combo} value={combo} className="text-white">{combo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Комментарий</Label>
              <Textarea
                value={currentRound.comment}
                onChange={(e) => setCurrentRound(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Комментарий к раунду..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Button 
              onClick={addRound}
              disabled={currentRound.winners.length === 0 || !currentRound.dealer || !currentRound.combination}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Добавить раунд
            </Button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-medium mb-4">История раундов</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {currentGame.rounds.slice().reverse().map((round: Round, index: number) => (
              <div key={round.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Раунд #{currentGame.rounds.length - index}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {round.timestamp.toLocaleTimeString('ru', {hour: '2-digit', minute: '2-digit'})}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-400">Победители:</span> <span className="text-white">{round.winners.join(', ')}</span></div>
                  <div><span className="text-gray-400">Дилер:</span> <span className="text-white">{round.dealer}</span></div>
                  <div><span className="text-gray-400">Комбинация:</span> <span className="text-white">{round.combination}</span></div>
                  {round.comment && (
                    <div><span className="text-gray-400">Комментарий:</span> <span className="text-gray-300">{round.comment}</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ResultsTab = ({ finalChips, setFinalChips, showResults, calculateResults, finishGame, currentGame }: any) => (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-semibold">Подсчет итогов игры</h3>
      
      {!showResults ? (
        <div className="space-y-4">
          <p className="text-gray-400">Введите финальное количество фишек для каждого игрока:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentGame.players.map((player: string) => (
              <div key={player} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{player}</span>
                  <span className="text-sm text-gray-400">
                    Закупы: {currentGame.buyins[player] || 0}
                  </span>
                </div>
                <Input
                  type="number"
                  value={finalChips[player] || ""}
                  onChange={(e) => setFinalChips(prev => ({ ...prev, [player]: Number(e.target.value) }))}
                  placeholder="Финальные фишки"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            ))}
          </div>

          <Button 
            onClick={finishGame}
            disabled={Object.keys(finalChips).length !== currentGame.players.length || Object.values(finalChips).some(v => v < 0)}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Закончить игру и подсчитать результат
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white font-medium mb-4">Итоговая таблица</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left text-gray-400 pb-2">Игрок</th>
                    <th className="text-right text-gray-400 pb-2">Закупы</th>
                    <th className="text-right text-gray-400 pb-2">Фишки</th>
                    <th className="text-right text-gray-400 pb-2">Рубли</th>
                    <th className="text-right text-gray-400 pb-2">Финал фишки</th>
                    <th className="text-right text-gray-400 pb-2">Финал рубли</th>
                    <th className="text-right text-gray-400 pb-2">Выигрыш/Проигрыш</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateResults().map((result: any) => (
                    <tr key={result.player} className="border-b border-gray-700">
                      <td className="text-white py-2">{result.player}</td>
                      <td className="text-right text-white py-2">{result.buyInCount}</td>
                      <td className="text-right text-white py-2">{result.buyInChips}</td>
                      <td className="text-right text-white py-2">{result.buyInRubles.toFixed(0)}</td>
                      <td className="text-right text-white py-2">{result.finalChips}</td>
                      <td className="text-right text-white py-2">{result.finalRubles.toFixed(0)}</td>
                      <td className={`text-right py-2 font-bold ${
                        result.profit > 0 ? 'text-green-400' : result.profit < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {result.profit > 0 ? '+' : ''}{result.profit.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Dashboard View - обновленный с плашками игроков
  const DashboardView = () => {
    if (!currentGame) return null;

    // Получаем статистику победителей
    const getWinnerStats = () => {
      const winCounts: { [key: string]: number } = {};
      currentGame.rounds.forEach(round => {
        round.winners.forEach(winner => {
          winCounts[winner] = (winCounts[winner] || 0) + 1;
        });
      });
      
      return Object.entries(winCounts)
        .map(([name, wins]) => ({
          name,
          wins,
          percentage: currentGame.rounds.length > 0 ? Math.round((wins / currentGame.rounds.length) * 100) : 0
        }))
        .sort((a, b) => b.wins - a.wins);
    };

    // Получаем статистику комбинаций
    const getCombinationStats = () => {
      const combinationCounts: { [key: string]: number } = {};
      currentGame.rounds.forEach(round => {
        combinationCounts[round.combination] = (combinationCounts[round.combination] || 0) + 1;
      });
      
      const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#6366f1', '#f97316'];
      
      return Object.entries(combinationCounts)
        .map(([name, value], index) => ({
          name,
          value,
          color: colors[index % colors.length],
          percentage: currentGame.rounds.length > 0 ? Math.round((value / currentGame.rounds.length) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value);
    };

    const winnerStats = getWinnerStats();
    const combinationStats = getCombinationStats();
    const chartConfig: ChartConfig = {
      wins: { label: "Победы", color: "#10b981" },
      combination: { label: "Комбинация", color: "#10b981" }
    };

    return (
      <div className="min-h-screen" style={{backgroundColor: '#000000'}}>
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
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
                onClick={() => setCurrentView('admin')} 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-4 py-2 rounded-md"
              >
                Админ панель
              </Button>
            </div>
          </div>

          <h2 className="text-white text-3xl font-bold mb-8">Dashboard</h2>

          {/* Общая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Игроков</p>
                  <p className="text-white text-2xl font-bold">{currentGame.players.length}</p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Users" size={16} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Всего раундов</p>
                  <p className="text-white text-2xl font-bold">{currentGame.rounds.length}</p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Target" size={16} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Блайнды</p>
                  <p className="text-white text-2xl font-bold">{currentGame.smallBlind}/{currentGame.bigBlind}</p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Coins" size={16} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Время игры</p>
                  <p className="text-white text-2xl font-bold">{formatTime(gameTimer)}</p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Clock" size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Графики */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Топ победителей */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Crown" size={20} className="text-yellow-500" />
                <h3 className="text-white text-lg font-semibold">Топ победителей</h3>
              </div>
              {winnerStats.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={winnerStats}>
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Bar
                        dataKey="wins"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-gray-400 text-center py-20">
                  Нет данных о раундах
                </p>
              )}
            </div>

            {/* Топ комбинаций */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Star" size={20} className="text-green-500" />
                <h3 className="text-white text-lg font-semibold">Топ комбинаций</h3>
              </div>
              {combinationStats.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={combinationStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                      >
                        {combinationStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-gray-400 text-center py-20">
                  Нет данных о комбинациях
                </p>
              )}
            </div>
          </div>

          {/* Плашки по игрокам - компактные */}
          <div className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4">Статистика игроков</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {currentGame.players.map((playerName) => {
                const stats = getPlayerGameStats(playerName);
                if (!stats) return null;
                
                return (
                  <div key={playerName} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Icon name="User" size={12} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm truncate">{playerName}</h4>
                        <p className="text-green-400 text-xs">{stats.winRate}% побед</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Победы:</span>
                        <span className="text-white font-bold">{stats.wins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Закупы:</span>
                        <span className="text-white">{stats.buyIns}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Дилер:</span>
                        <p className="text-green-400 text-xs truncate">{stats.bestDealer}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Комбинация:</span>
                        <p className="text-white text-xs truncate">{stats.favoriteCombination}</p>
                      </div>
                      <div className="border-t border-gray-700 pt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Фишки:</span>
                          <span className="text-white text-xs">{stats.buyInChips}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Последние раунды */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Icon name="MessageSquare" size={20} className="text-orange-500" />
              <h3 className="text-white text-lg font-semibold">Последние раунды</h3>
            </div>
            <div className="space-y-4">
              {currentGame.rounds.slice(-5).reverse().map((round, index) => (
                <div key={round.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded">
                      Раунд #{currentGame.rounds.length - index}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {round.timestamp.toLocaleTimeString('ru', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                  <p className="text-white text-sm">
                    {round.combination} у {round.winners.join(', ')} | Дилер: {round.dealer}
                  </p>
                  {round.comment && (
                    <p className="text-gray-400 text-sm mt-1">{round.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dark">
      {currentView === "lobby" && <LobbyView />}
      {currentView === "admin" && <AdminView />}
      {currentView === "dashboard" && <DashboardView />}
    </div>
  );
};

export default Index;