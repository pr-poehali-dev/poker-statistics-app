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

  // Admin View - обновим стиль под темную тему
  const AdminView = () => {
    const [currentRound, setCurrentRound] = useState({
      winners: [] as string[],
      dealer: "",
      combination: "",
      comment: "",
    });

    const addRound = () => {
      if (currentGame && currentRound.winners.length > 0 && currentRound.dealer && currentRound.combination) {
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

    if (!currentGame) return null;

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Раунды</p>
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
          </div>

          {/* Add Round Form */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 mb-8">
            <h3 className="text-white text-lg font-semibold mb-4">Добавить раунд</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white mb-2 block">Победители</Label>
                <div className="space-y-2">
                  {currentGame.players.map((player) => (
                    <div key={player} className="flex items-center space-x-2">
                      <Checkbox
                        id={`winner-${player}`}
                        checked={currentRound.winners.includes(player)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCurrentRound(prev => ({
                              ...prev,
                              winners: [...prev.winners, player]
                            }));
                          } else {
                            setCurrentRound(prev => ({
                              ...prev,
                              winners: prev.winners.filter(w => w !== player)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={`winner-${player}`} className="text-white cursor-pointer">
                        {player}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">Дилер</Label>
                  <Select value={currentRound.dealer} onValueChange={(value) => setCurrentRound(prev => ({ ...prev, dealer: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Выберите дилера" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {currentGame.players.map((player) => (
                        <SelectItem key={player} value={player} className="text-white">
                          {player}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Комбинация</Label>
                  <Select value={currentRound.combination} onValueChange={(value) => setCurrentRound(prev => ({ ...prev, combination: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Выберите комбинацию" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {["Пара", "Две пары", "Тройка", "Стрит", "Флеш", "Фулл хаус", "Каре", "Стрит флеш", "Роял флеш"].map((combo) => (
                        <SelectItem key={combo} value={combo} className="text-white">
                          {combo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Комментарий</Label>
                  <Textarea
                    value={currentRound.comment}
                    onChange={(e) => setCurrentRound(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Добавьте комментарий к раунду..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={addRound}
              disabled={currentRound.winners.length === 0 || !currentRound.dealer || !currentRound.combination}
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              Добавить раунд
            </Button>
          </div>

          {/* Recent Rounds */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Последние раунды</h3>
            <div className="space-y-3">
              {currentGame.rounds.slice(-5).reverse().map((round, index) => (
                <div key={round.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Раунд #{currentGame.rounds.length - index}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {round.timestamp.toLocaleTimeString('ru', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Победители:</p>
                      <p className="text-white">{round.winners.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Дилер:</p>
                      <p className="text-white">{round.dealer}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Комбинация:</p>
                      <p className="text-white">{round.combination}</p>
                    </div>
                  </div>
                  {round.comment && (
                    <p className="text-gray-300 text-sm mt-2">{round.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard View - обновленный с плашками игроков
  const DashboardView = () => {
    if (!currentGame) return null;

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Всего фишек</p>
                  <p className="text-white text-2xl font-bold">{(currentGame.players.length * currentGame.startingStack / 1000).toFixed(1)}K</p>
                  <p className="text-green-400 text-xs">{(currentGame.players.length * currentGame.startingStack * currentGame.chipToRuble).toFixed(0)} Р</p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Trophy" size={16} className="text-white" />
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
                  <p className="text-gray-400 text-sm mb-1">Время игры</p>
                  <p className="text-white text-2xl font-bold">{formatTime(gameTimer)}</p>
                  <p className="text-gray-400 text-xs">Блайнды: {currentGame.smallBlind}/{currentGame.bigBlind}</p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Clock" size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Плашки по игрокам */}
          <div className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4">Статистика игроков</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentGame.players.map((playerName) => {
                const stats = getPlayerGameStats(playerName);
                if (!stats) return null;
                
                return (
                  <div key={playerName} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{playerName}</h4>
                        <p className="text-gray-400 text-sm">{stats.winRate}% побед</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Победы в раундах:</span>
                        <span className="text-white font-bold">{stats.wins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Лучший дилер:</span>
                        <span className="text-green-400 text-sm">{stats.bestDealer}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Любимая комбинация:</span>
                        <p className="text-white text-sm">{stats.favoriteCombination}</p>
                      </div>
                      <div className="border-t border-gray-700 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Закупы:</span>
                          <span className="text-white">{stats.buyIns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Фишки:</span>
                          <span className="text-white">{stats.buyInChips}</span>
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