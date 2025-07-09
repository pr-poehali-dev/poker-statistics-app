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

const Index = () => {
  const [currentView, setCurrentView] = useState("lobby");
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [games, setGames] = useState<GameData[]>([]);
  const [gameTimer, setGameTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [blindsEnabled, setBlindsEnabled] = useState(false);
  const [blindsIncreaseBy, setBlindsIncreaseBy] = useState("time");
  const [blindsIncreaseValue, setBlindsIncreaseValue] = useState(20);
  const [blindsMultiplier, setBlindsMultiplier] = useState(1.5);

  // New game form state
  const [newGameForm, setNewGameForm] = useState({
    name: "",
    players: [] as string[],
    chipToRuble: 0.5,
    startingStack: 5000,
    smallBlind: 25,
    bigBlind: 50,
  });

  // Round form state
  const [roundForm, setRoundForm] = useState({
    winners: [] as string[],
    dealer: "",
    combination: "",
    comment: "",
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setGameTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const addPlayer = () => {
    setNewGameForm({ ...newGameForm, players: [...newGameForm.players, ""] });
  };

  const updatePlayer = (index: number, name: string) => {
    const updatedPlayers = [...newGameForm.players];
    updatedPlayers[index] = name;
    setNewGameForm({ ...newGameForm, players: updatedPlayers });
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = newGameForm.players.filter((_, i) => i !== index);
    setNewGameForm({ ...newGameForm, players: updatedPlayers });
  };

  const createGame = () => {
    const validPlayers = newGameForm.players.filter((p) => p.trim());
    if (!newGameForm.name || validPlayers.length < 2) return;

    const newGame: GameData = {
      id: Date.now().toString(),
      name: newGameForm.name,
      players: validPlayers,
      chipToRuble: newGameForm.chipToRuble,
      startingStack: newGameForm.startingStack,
      smallBlind: newGameForm.smallBlind,
      bigBlind: newGameForm.bigBlind,
      isActive: false,
      rounds: [],
      buyins: validPlayers.reduce(
        (acc, player) => ({ ...acc, [player]: 1 }),
        {},
      ),
    };
    setGames([...games, newGame]);
    setNewGameForm({
      name: "",
      players: [],
      chipToRuble: 0.5,
      startingStack: 5000,
      smallBlind: 25,
      bigBlind: 50,
    });
  };

  const startTimer = () => {
    if (!currentGame) return;
    setIsTimerRunning(true);
    if (!currentGame.gameStartTime) {
      setCurrentGame({ ...currentGame, gameStartTime: new Date() });
    }
  };

  const stopTimer = () => {
    if (!currentGame) return;
    setIsTimerRunning(false);
    setCurrentGame({ ...currentGame, gameEndTime: new Date() });
  };

  const addRound = () => {
    if (
      !currentGame ||
      roundForm.winners.length === 0 ||
      !roundForm.dealer ||
      !roundForm.combination
    )
      return;

    const newRound: Round = {
      id: Date.now().toString(),
      winners: roundForm.winners,
      dealer: roundForm.dealer,
      combination: roundForm.combination,
      comment: roundForm.comment,
      timestamp: new Date(),
    };

    const updatedGame = {
      ...currentGame,
      rounds: [...currentGame.rounds, newRound],
    };
    setCurrentGame(updatedGame);
    setGames(games.map((g) => (g.id === currentGame.id ? updatedGame : g)));
    setRoundForm({ winners: [], dealer: "", combination: "", comment: "" });
  };

  const updateBuyin = (playerName: string, increment: boolean) => {
    if (!currentGame) return;
    const updatedBuyins = { ...currentGame.buyins };
    updatedBuyins[playerName] = Math.max(
      0,
      updatedBuyins[playerName] + (increment ? 1 : -1),
    );
    const updatedGame = { ...currentGame, buyins: updatedBuyins };
    setCurrentGame(updatedGame);
    setGames(games.map((g) => (g.id === currentGame.id ? updatedGame : g)));
  };

  // Analytics calculations
  const getWinnerStats = () => {
    if (!currentGame) return [];
    const stats: { [key: string]: number } = {};
    currentGame.rounds.forEach((round) => {
      round.winners.forEach((winner) => {
        stats[winner] = (stats[winner] || 0) + 1;
      });
    });

    const totalRounds = currentGame.rounds.length;
    return Object.entries(stats).map(([name, wins]) => ({
      name,
      wins,
      percentage: totalRounds > 0 ? Math.round((wins / totalRounds) * 100) : 0,
    }));
  };

  const getCombinationStats = () => {
    if (!currentGame) return [];
    const stats: { [key: string]: number } = {};
    currentGame.rounds.forEach((round) => {
      stats[round.combination] = (stats[round.combination] || 0) + 1;
    });

    const colors = ["#D4A428", "#2D4A2D", "#DC2626", "#404040", "#1A1A1A"];
    return Object.entries(stats).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  };

  const getBestDealerStats = () => {
    if (!currentGame) return {};
    const dealerStats: { [player: string]: { [dealer: string]: number } } = {};

    currentGame.rounds.forEach((round) => {
      round.winners.forEach((winner) => {
        if (!dealerStats[winner]) dealerStats[winner] = {};
        dealerStats[winner][round.dealer] =
          (dealerStats[winner][round.dealer] || 0) + 1;
      });
    });

    const result: {
      [player: string]: { dealers: string[]; wins: number; percentage: number };
    } = {};
    Object.entries(dealerStats).forEach(([player, dealers]) => {
      const totalWins = Object.values(dealers).reduce(
        (sum, wins) => sum + wins,
        0,
      );
      const maxWins = Math.max(...Object.values(dealers));
      const bestDealers = Object.entries(dealers)
        .filter(([_, wins]) => wins === maxWins)
        .map(([dealer]) => dealer);

      result[player] = {
        dealers: bestDealers,
        wins: maxWins,
        percentage: totalWins > 0 ? Math.round((maxWins / totalWins) * 100) : 0,
      };
    });

    return result;
  };

  const getTotalChips = () => {
    if (!currentGame) return { chips: 0, rubles: 0 };
    const totalBuyins = Object.values(currentGame.buyins).reduce(
      (sum, buyins) => sum + buyins,
      0,
    );
    const chips = totalBuyins * currentGame.startingStack;
    const rubles = chips * currentGame.chipToRuble;
    return { chips, rubles };
  };

  // Mock data for charts
  const winnerData = [
    { name: "Игрок 1", wins: 8, percentage: 40 },
    { name: "Игрок 2", wins: 6, percentage: 30 },
    { name: "Игрок 3", wins: 4, percentage: 20 },
    { name: "Игрок 4", wins: 2, percentage: 10 },
  ];

  const combinationData = [
    { name: "Пара", value: 35, color: "#D4A428" },
    { name: "Две пары", value: 25, color: "#2D4A2D" },
    { name: "Стрит", value: 15, color: "#DC2626" },
    { name: "Флеш", value: 10, color: "#404040" },
    { name: "Фулл хаус", value: 8, color: "#1A1A1A" },
    { name: "Каре", value: 4, color: "#D4A428" },
    { name: "Стрит флеш", value: 2, color: "#2D4A2D" },
    { name: "Флеш рояль", value: 1, color: "#DC2626" },
  ];

  const chartConfig = {
    wins: {
      label: "Победы",
      color: "#D4A428",
    },
  } satisfies ChartConfig;

  const LobbyView = () => (
    <div className="min-h-screen bg-poker-dark p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-poker-gold mb-4 flex items-center justify-center gap-2 md:gap-4">
            🃏 Lozo Poker 🎰
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-open-sans">
            Профессиональный покерный трекер
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="bg-poker-gray border-poker-gold/20">
            <CardHeader>
              <CardTitle className="text-poker-gold font-montserrat flex items-center gap-2">
                <Icon name="Plus" size={24} />
                Создать новую игру
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Название игры"
                value={newGameForm.name}
                onChange={(e) =>
                  setNewGameForm({ ...newGameForm, name: e.target.value })
                }
                className="bg-poker-dark border-poker-gold/30"
              />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-white text-sm">Игроки</Label>
                  <Button
                    type="button"
                    onClick={addPlayer}
                    size="sm"
                    className="bg-poker-green hover:bg-poker-green/80"
                  >
                    <Icon name="Plus" size={16} className="mr-1" />
                    Добавить
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {newGameForm.players.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-3">
                      Нажмите "Добавить" чтобы добавить игроков
                    </p>
                  )}
                  {newGameForm.players.map((player, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Игрок ${index + 1}`}
                        value={player}
                        onChange={(e) => updatePlayer(index, e.target.value)}
                        className="bg-poker-dark border-poker-gold/30 flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => removePlayer(index)}
                        size="sm"
                        variant="outline"
                        className="border-poker-red text-poker-red hover:bg-poker-red/10"
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white text-sm">
                    Курс (1₽ = X фишек)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newGameForm.chipToRuble}
                    onChange={(e) =>
                      setNewGameForm({
                        ...newGameForm,
                        chipToRuble: parseFloat(e.target.value),
                      })
                    }
                    className="bg-poker-dark border-poker-gold/30"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">Стартовый банк</Label>
                  <Input
                    type="number"
                    value={newGameForm.startingStack}
                    onChange={(e) =>
                      setNewGameForm({
                        ...newGameForm,
                        startingStack: parseInt(e.target.value),
                      })
                    }
                    className="bg-poker-dark border-poker-gold/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-white text-xs">Малый блайнд</Label>
                    <Input
                      type="number"
                      value={newGameForm.smallBlind}
                      onChange={(e) =>
                        setNewGameForm({
                          ...newGameForm,
                          smallBlind: parseInt(e.target.value),
                        })
                      }
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-xs">Большой блайнд</Label>
                    <Input
                      type="number"
                      value={newGameForm.bigBlind}
                      onChange={(e) =>
                        setNewGameForm({
                          ...newGameForm,
                          bigBlind: parseInt(e.target.value),
                        })
                      }
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={createGame}
                disabled={
                  !newGameForm.name ||
                  newGameForm.players.filter((p) => p.trim()).length < 2
                }
                className="w-full bg-poker-green hover:bg-poker-green/80"
              >
                🚀 Создать игру (
                {newGameForm.players.filter((p) => p.trim()).length} игроков)
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-poker-gray border-poker-gold/20">
            <CardHeader>
              <CardTitle className="text-poker-gold font-montserrat flex items-center gap-2">
                <Icon name="Trophy" size={24} />
                Доступные игры
              </CardTitle>
            </CardHeader>
            <CardContent>
              {games.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  Пока нет созданных игр
                </p>
              ) : (
                <div className="space-y-3">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="p-4 bg-poker-dark rounded-lg border border-poker-gold/30"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            🎲 {game.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {game.players.length} игроков • Блайнды:{" "}
                            {game.smallBlind}/{game.bigBlind} • Раундов:{" "}
                            {game.rounds.length}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setCurrentGame(game);
                              setCurrentView("admin");
                            }}
                            className="bg-poker-gold hover:bg-poker-gold/80 text-black font-medium"
                          >
                            ⚙️ Админ
                          </Button>
                          <Button
                            onClick={() => {
                              setCurrentGame(game);
                              setCurrentView("dashboard");
                            }}
                            variant="outline"
                            className="border-poker-gold text-poker-gold"
                          >
                            📊 Дашборд
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const AdminView = () => (
    <div className="min-h-screen bg-poker-dark p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-poker-gold flex items-center gap-2">
            ⚙️ {currentGame?.name || "Админ панель"}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentView("dashboard")}
              variant="outline"
              className="border-poker-gold text-poker-gold text-sm"
            >
              📊 Дашборд
            </Button>
            <Button
              onClick={() => setCurrentView("lobby")}
              variant="outline"
              className="border-poker-gold text-poker-gold text-sm"
            >
              🏠 Лобби
            </Button>
          </div>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-poker-gray mb-6">
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-poker-gold data-[state=active]:text-black text-xs md:text-sm"
            >
              🎛️ Настройки
            </TabsTrigger>
            <TabsTrigger
              value="chips"
              className="data-[state=active]:bg-poker-gold data-[state=active]:text-black text-xs md:text-sm"
            >
              💰 Закупы
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-poker-gold data-[state=active]:text-black text-xs md:text-sm"
            >
              📈 Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card className="bg-poker-gray border-poker-gold/20">
              <CardHeader>
                <CardTitle className="text-poker-gold">
                  🎛️ Настройки игры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label className="text-white">Игроки</Label>
                    <div className="text-sm text-gray-400 mt-1">
                      {currentGame?.players.join(", ") || "Нет игроков"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-white">Курс фишек</Label>
                      <div className="text-poker-gold">
                        1₽ = {currentGame?.chipToRuble} фишек
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Стартовый банк</Label>
                      <div className="text-poker-gold">
                        {currentGame?.startingStack}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Малый блайнд</Label>
                      <div className="text-poker-gold">
                        {currentGame?.smallBlind}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Большой блайнд</Label>
                      <div className="text-poker-gold">
                        {currentGame?.bigBlind}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-poker-dark rounded-lg border border-poker-gold/30">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      ⏱️ Секундомер игры
                    </h3>
                    <p className="text-poker-gold text-xl font-mono">
                      {formatTime(gameTimer)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={startTimer}
                      disabled={isTimerRunning}
                      className="bg-poker-green hover:bg-poker-green/80"
                      size="sm"
                    >
                      ▶️ Старт
                    </Button>
                    <Button
                      onClick={stopTimer}
                      disabled={!isTimerRunning}
                      className="bg-poker-red hover:bg-poker-red/80"
                      size="sm"
                    >
                      ⏸️ Стоп
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-poker-dark rounded-lg border border-poker-gold/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">
                        📈 Повышение блайндов
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Автоматическое увеличение ставок
                      </p>
                    </div>
                    <Switch
                      checked={blindsEnabled}
                      onCheckedChange={setBlindsEnabled}
                    />
                  </div>

                  {blindsEnabled && (
                    <div className="space-y-3 pt-3 border-t border-poker-gold/20">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-white text-sm">
                            Повышать по
                          </Label>
                          <Select
                            value={blindsIncreaseBy}
                            onValueChange={setBlindsIncreaseBy}
                          >
                            <SelectTrigger className="bg-poker-dark border-poker-gold/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="time">Времени</SelectItem>
                              <SelectItem value="rounds">Раундам</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-white text-sm">
                            {blindsIncreaseBy === "time" ? "Минут" : "Раундов"}
                          </Label>
                          <Input
                            type="number"
                            value={blindsIncreaseValue}
                            onChange={(e) =>
                              setBlindsIncreaseValue(parseInt(e.target.value))
                            }
                            className="bg-poker-dark border-poker-gold/30"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-sm">
                            Множитель
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={blindsMultiplier}
                            onChange={(e) =>
                              setBlindsMultiplier(parseFloat(e.target.value))
                            }
                            className="bg-poker-dark border-poker-gold/30"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chips">
            <Card className="bg-poker-gray border-poker-gold/20">
              <CardHeader>
                <CardTitle className="text-poker-gold">
                  💰 Закупы фишек
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {currentGame?.players.map((player) => (
                    <div
                      key={player}
                      className="p-4 bg-poker-dark rounded-lg border border-poker-gold/30"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-semibold">{player}</h3>
                          <p className="text-poker-gold text-sm">
                            💰 {currentGame.buyins[player]} закуп
                            {currentGame.buyins[player] > 1 ? "а" : ""}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Фишек:{" "}
                            {currentGame.buyins[player] *
                              currentGame.startingStack}{" "}
                            • Рублей:{" "}
                            {(
                              currentGame.buyins[player] *
                              currentGame.startingStack *
                              currentGame.chipToRuble
                            ).toFixed(0)}
                            ₽
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateBuyin(player, true)}
                            className="bg-poker-green hover:bg-poker-green/80"
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateBuyin(player, false)}
                            disabled={currentGame.buyins[player] <= 0}
                            variant="outline"
                            className="border-poker-red text-poker-red"
                          >
                            -
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="bg-poker-gray border-poker-gold/20">
              <CardHeader>
                <CardTitle className="text-poker-gold">
                  📊 Статистика раунда
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Победители</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {currentGame?.players.map((player) => (
                      <label
                        key={player}
                        className="flex items-center space-x-2 text-white"
                      >
                        <Checkbox
                          checked={roundForm.winners.includes(player)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRoundForm({
                                ...roundForm,
                                winners: [...roundForm.winners, player],
                              });
                            } else {
                              setRoundForm({
                                ...roundForm,
                                winners: roundForm.winners.filter(
                                  (w) => w !== player,
                                ),
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{player}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white">Дилер</Label>
                  <Select
                    value={roundForm.dealer}
                    onValueChange={(value) =>
                      setRoundForm({ ...roundForm, dealer: value })
                    }
                  >
                    <SelectTrigger className="bg-poker-dark border-poker-gold/30">
                      <SelectValue placeholder="Выберите дилера" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentGame?.players.map((player) => (
                        <SelectItem key={player} value={player}>
                          {player}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Выигрышная комбинация</Label>
                  <Select
                    value={roundForm.combination}
                    onValueChange={(value) =>
                      setRoundForm({ ...roundForm, combination: value })
                    }
                  >
                    <SelectTrigger className="bg-poker-dark border-poker-gold/30">
                      <SelectValue placeholder="Выберите комбинацию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Задавил банком">
                        💪 Задавил банком
                      </SelectItem>
                      <SelectItem value="Пара">🃏 Пара</SelectItem>
                      <SelectItem value="Две пары">🃏🃏 Две пары</SelectItem>
                      <SelectItem value="Стрит">🎯 Стрит</SelectItem>
                      <SelectItem value="Флеш">♠️ Флеш</SelectItem>
                      <SelectItem value="Фулл хаус">🏠 Фулл хаус</SelectItem>
                      <SelectItem value="Каре">👑 Каре</SelectItem>
                      <SelectItem value="Стрит флеш">🔥 Стрит флеш</SelectItem>
                      <SelectItem value="Флеш рояль">💎 Флеш рояль</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Комментарий к раунду</Label>
                  <Textarea
                    placeholder="Дополнительная информация..."
                    value={roundForm.comment}
                    onChange={(e) =>
                      setRoundForm({ ...roundForm, comment: e.target.value })
                    }
                    className="bg-poker-dark border-poker-gold/30"
                  />
                </div>

                <Button
                  onClick={addRound}
                  disabled={
                    roundForm.winners.length === 0 ||
                    !roundForm.dealer ||
                    !roundForm.combination
                  }
                  className="w-full bg-poker-gold hover:bg-poker-gold/80 text-black font-semibold"
                >
                  ✅ Записать данные о раунде
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const DashboardView = () => {
    const winnerStats = getWinnerStats();
    const combinationStats = getCombinationStats();
    const bestDealerStats = getBestDealerStats();
    const { chips, rubles } = getTotalChips();

    // Данные для столбчатых диаграмм комбинаций
    const combinationBarStats = combinationStats.map((stat) => ({
      name: stat.name,
      value: stat.value,
      percentage: currentGame?.rounds.length
        ? Math.round((stat.value / currentGame.rounds.length) * 100)
        : 0,
    }));

    return (
      <div className="min-h-screen" style={{ backgroundColor: "#000000" }}>
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
                onClick={() => setCurrentView("dashboard")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Дашборд
              </Button>
              <Button
                onClick={() => setCurrentView("admin")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-4 py-2 rounded-md"
              >
                Админ панель
              </Button>
            </div>
          </div>

          <h2 className="text-white text-3xl font-bold mb-8">Dashboard</h2>

          <Button
            onClick={() => setCurrentView("admin")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md mb-8 float-right"
          >
            🔧 Сбросить настройки
          </Button>

          {/* Верхние карточки статистики */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Всего фишек</p>
                  <p className="text-white text-2xl font-bold">
                    {(chips / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-green-400 text-xs">
                    {rubles.toFixed(0)} Р
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Trophy" size={16} className="text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-green-400 text-xs">📈 +8%</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Всего раундов</p>
                  <p className="text-white text-2xl font-bold">
                    {currentGame?.rounds.length || 0}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Target" size={16} className="text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-green-400 text-xs">📈 +12%</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Время игры</p>
                  <p className="text-white text-2xl font-bold">
                    {formatTime(gameTimer)}
                  </p>
                  {currentGame && (
                    <p className="text-gray-400 text-xs">
                      Блайнды: {currentGame.smallBlind}/{currentGame.bigBlind}
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Icon name="Clock" size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Основные диаграммы */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Топ победителей */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Crown" size={20} className="text-yellow-500" />
                <h3 className="text-white text-lg font-semibold">
                  Топ победителей
                </h3>
              </div>
              <div className="space-y-4">
                {winnerStats.slice(0, 5).map((player, index) => (
                  <div key={player.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {player.name}
                      </p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-none"
                          style={{ width: `${player.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-bold">
                        {player.wins} побед
                      </p>
                      <p className="text-green-400 text-xs">
                        {player.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Выигрышные комбинации */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Star" size={20} className="text-green-500" />
                <h3 className="text-white text-lg font-semibold">
                  Выигрышные комбинации
                </h3>
              </div>
              <div className="space-y-3">
                {combinationBarStats.slice(0, 9).map((combo, index) => {
                  const colors = [
                    "bg-green-500",
                    "bg-green-400",
                    "bg-green-300",
                    "bg-green-200",
                    "bg-gray-500",
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <div
                      key={combo.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-white text-sm w-24 truncate">
                          {combo.name}
                        </span>
                        <div className="flex-1 max-w-24">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`${color} h-2 rounded-full transition-none`}
                              style={{ width: `${combo.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <span className="text-white text-sm font-bold">
                          {combo.value}
                        </span>
                        <span className="text-green-400 text-xs ml-2">
                          {combo.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Комментарии к раундам */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Icon
                  name="MessageSquare"
                  size={20}
                  className="text-orange-500"
                />
                <h3 className="text-white text-lg font-semibold">
                  Комментарии к раундам
                </h3>
              </div>
              <div className="space-y-4">
                {currentGame?.rounds
                  .slice(-3)
                  .reverse()
                  .map((round, index) => (
                    <div key={round.id} className="">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded">
                          Раунд #{currentGame.rounds.length - index}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(round.timestamp).toLocaleTimeString("ru", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-white text-sm">
                        {round.comment ||
                          round.combination + " у " + round.winners.join(", ")}
                      </p>
                    </div>
                  )) || (
                  <p className="text-gray-400 text-sm text-center py-8">
                    Нет комментариев к раундам
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Лучшие дилеры */}
          {Object.keys(bestDealerStats).length > 0 && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Users" size={20} className="text-green-500" />
                <h3 className="text-white text-lg font-semibold">
                  Лучшие дилеры для игроков
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(bestDealerStats).map(([player, stats]) => (
                  <div
                    key={player}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-600"
                  >
                    <h4 className="text-white font-medium mb-2">{player}</h4>
                    <p className="text-green-400 text-sm mb-1">Лучший дилер:</p>
                    <p className="text-white text-lg font-bold">
                      {stats.dealers.join(", ")}
                    </p>
                    <div className="mt-3">
                      <span className="text-green-400 text-sm font-bold">
                        {stats.wins} побед
                      </span>
                      <span className="text-gray-400 text-sm ml-4">
                        {stats.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
