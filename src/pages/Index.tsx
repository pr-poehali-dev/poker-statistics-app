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
    players: "",
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

  const createGame = () => {
    const playerList = newGameForm.players
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    const newGame: GameData = {
      id: Date.now().toString(),
      name: newGameForm.name,
      players: playerList,
      chipToRuble: newGameForm.chipToRuble,
      startingStack: newGameForm.startingStack,
      smallBlind: newGameForm.smallBlind,
      bigBlind: newGameForm.bigBlind,
      isActive: false,
      rounds: [],
      buyins: playerList.reduce((acc, player) => ({ ...acc, [player]: 1 }), {}),
    };
    setGames([...games, newGame]);
    setNewGameForm({
      name: "",
      players: "",
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
              <Textarea
                placeholder="Игроки (через запятую)"
                value={newGameForm.players}
                onChange={(e) =>
                  setNewGameForm({ ...newGameForm, players: e.target.value })
                }
                className="bg-poker-dark border-poker-gold/30"
              />
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
                disabled={!newGameForm.name || !newGameForm.players}
                className="w-full bg-poker-green hover:bg-poker-green/80"
              >
                🚀 Создать игру
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

    return (
      <div className="min-h-screen bg-poker-dark p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-poker-gold flex items-center gap-2">
              📊 {currentGame?.name || "Дашборд игры"}
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentView("admin")}
                variant="outline"
                className="border-poker-gold text-poker-gold text-sm"
              >
                ⚙️ Админ
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-poker-gray border-poker-gold/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-poker-gold font-semibold mb-2">
                  🎯 Раундов сыграно
                </h3>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {currentGame?.rounds.length || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-poker-gray border-poker-gold/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-poker-gold font-semibold mb-2">
                  💰 Фишек в игре
                </h3>
                <p className="text-xl md:text-2xl font-bold text-white">
                  {chips.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">≈ {rubles.toFixed(0)}₽</p>
              </CardContent>
            </Card>

            <Card className="bg-poker-gray border-poker-gold/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-poker-gold font-semibold mb-2">
                  ⏱️ Время игры
                </h3>
                <p className="text-2xl md:text-3xl font-bold text-white font-mono">
                  {formatTime(gameTimer)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-poker-gray border-poker-gold/20">
              <CardHeader>
                <CardTitle className="text-poker-gold">
                  🏆 Гистограмма победителей
                </CardTitle>
              </CardHeader>
              <CardContent>
                {winnerStats.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={winnerStats}>
                        <XAxis dataKey="name" stroke="#D4A428" />
                        <YAxis stroke="#D4A428" />
                        <Bar
                          dataKey="wins"
                          fill="#D4A428"
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
              </CardContent>
            </Card>

            <Card className="bg-poker-gray border-poker-gold/20">
              <CardHeader>
                <CardTitle className="text-poker-gold">
                  🃏 Победные комбинации
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          {Object.keys(bestDealerStats).length > 0 && (
            <Card className="bg-poker-gray border-poker-gold/20">
              <CardHeader>
                <CardTitle className="text-poker-gold">
                  🎰 Лучшие дилеры для каждого игрока
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(bestDealerStats).map(([player, stats]) => (
                    <div
                      key={player}
                      className="p-4 bg-poker-dark rounded-lg border border-poker-gold/30"
                    >
                      <h3 className="text-white font-semibold mb-2">
                        {player}
                      </h3>
                      <p className="text-poker-gold">
                        Лучший дилер: {stats.dealers.join(" / ")}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Побед с этим дилером: {stats.wins} ({stats.percentage}%)
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
