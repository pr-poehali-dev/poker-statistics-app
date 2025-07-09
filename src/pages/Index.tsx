import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

const Index = () => {
  const [currentView, setCurrentView] = useState("lobby");
  const [gameTimer, setGameTimer] = useState("00:00:00");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [blindsEnabled, setBlindsEnabled] = useState(false);

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
    <div className="min-h-screen bg-poker-dark p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-montserrat font-bold text-poker-gold mb-4 flex items-center justify-center gap-4">
            🃏 Lozo Poker 🎰
          </h1>
          <p className="text-xl text-gray-300 font-open-sans">
            Профессиональный покерный трекер
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-poker-gray border-poker-gold/20">
            <CardHeader>
              <CardTitle className="text-poker-gold font-montserrat flex items-center gap-2">
                <Icon name="Trophy" size={24} />
                Текущие игры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-poker-green/20 rounded-lg border border-poker-green/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">
                        Пятничная игра 🎲
                      </h3>
                      <p className="text-sm text-gray-400">
                        4 игрока • Блайнды: 50/100
                      </p>
                    </div>
                    <Button
                      onClick={() => setCurrentView("admin")}
                      className="bg-poker-gold hover:bg-poker-gold/80 text-black font-medium"
                    >
                      Войти
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-poker-gray border-poker-gold/20">
            <CardHeader>
              <CardTitle className="text-poker-gold font-montserrat flex items-center gap-2">
                <Icon name="Plus" size={24} />
                Создать игру
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Название игры"
                className="bg-poker-dark border-poker-gold/30"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Стартовый банк"
                  className="bg-poker-dark border-poker-gold/30"
                />
                <Input
                  placeholder="Курс фишек"
                  className="bg-poker-dark border-poker-gold/30"
                />
              </div>
              <Button className="w-full bg-poker-green hover:bg-poker-green/80">
                🚀 Создать игру
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-poker-gray border-poker-gold/20">
            <CardContent className="p-6 text-center">
              <Icon
                name="Users"
                size={48}
                className="mx-auto mb-3 text-poker-gold"
              />
              <h3 className="text-xl font-semibold text-white mb-2">
                Игроки онлайн
              </h3>
              <p className="text-3xl font-bold text-poker-gold">12</p>
            </CardContent>
          </Card>

          <Card className="bg-poker-gray border-poker-gold/20">
            <CardContent className="p-6 text-center">
              <Icon
                name="GamepadIcon"
                size={48}
                className="mx-auto mb-3 text-poker-green"
              />
              <h3 className="text-xl font-semibold text-white mb-2">
                Активные игры
              </h3>
              <p className="text-3xl font-bold text-poker-green">3</p>
            </CardContent>
          </Card>

          <Card className="bg-poker-gray border-poker-gold/20">
            <CardContent className="p-6 text-center">
              <Icon
                name="Calendar"
                size={48}
                className="mx-auto mb-3 text-poker-red"
              />
              <h3 className="text-xl font-semibold text-white mb-2">
                Игр сегодня
              </h3>
              <p className="text-3xl font-bold text-poker-red">7</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const AdminView = () => (
    <div className="min-h-screen bg-poker-dark p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-montserrat font-bold text-poker-gold flex items-center gap-2">
            ⚙️ Админ панель
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentView("dashboard")}
              variant="outline"
              className="border-poker-gold text-poker-gold"
            >
              📊 Дашборд
            </Button>
            <Button
              onClick={() => setCurrentView("lobby")}
              variant="outline"
              className="border-poker-gold text-poker-gold"
            >
              🏠 Лобби
            </Button>
          </div>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-poker-gray">
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-poker-gold data-[state=active]:text-black"
            >
              🎛️ Настройки
            </TabsTrigger>
            <TabsTrigger
              value="chips"
              className="data-[state=active]:bg-poker-gold data-[state=active]:text-black"
            >
              💰 Закупы
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-poker-gold data-[state=active]:text-black"
            >
              📈 Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card className="bg-poker-gray border-poker-gold/20">
              <CardHeader>
                <CardTitle className="text-poker-gold">
                  Настройка игры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Игроки (через запятую)</Label>
                    <Input
                      placeholder="Игрок 1, Игрок 2, Игрок 3"
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Курс фишек к рублям</Label>
                    <Input
                      placeholder="1₽ = 0.5 фишек"
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Стартовый банк</Label>
                    <Input
                      placeholder="5000"
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Малый блайнд</Label>
                    <Input
                      placeholder="25"
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Большой блайнд</Label>
                    <Input
                      placeholder="50"
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-poker-dark rounded-lg border border-poker-gold/30">
                  <div>
                    <h3 className="text-white font-semibold">
                      ⏱️ Секундомер игры
                    </h3>
                    <p className="text-gray-400">Время: {gameTimer}</p>
                  </div>
                  <Button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={
                      isTimerRunning
                        ? "bg-poker-red hover:bg-poker-red/80"
                        : "bg-poker-green hover:bg-poker-green/80"
                    }
                  >
                    {isTimerRunning ? "⏸️ Стоп" : "▶️ Старт"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-poker-dark rounded-lg border border-poker-gold/30">
                  <div>
                    <h3 className="text-white font-semibold">
                      📈 Повышение блайндов
                    </h3>
                    <p className="text-gray-400">
                      Автоматическое увеличение ставок
                    </p>
                  </div>
                  <Switch
                    checked={blindsEnabled}
                    onCheckedChange={setBlindsEnabled}
                  />
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
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {["Игрок 1", "Игрок 2", "Игрок 3", "Игрок 4"].map(
                    (player, index) => (
                      <div
                        key={index}
                        className="p-4 bg-poker-dark rounded-lg border border-poker-gold/30"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-white font-semibold">{player}</h3>
                          <span className="text-poker-gold">
                            💰 {index + 1} закуп
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-poker-green hover:bg-poker-green/80"
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-poker-red text-poker-red"
                          >
                            -
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Победитель(и)</Label>
                    <Input
                      placeholder="Выберите победителя"
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Дилер</Label>
                    <Input
                      placeholder="Кто раздавал"
                      className="bg-poker-dark border-poker-gold/30"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Выигрышная комбинация</Label>
                  <Input
                    placeholder="Пара, Стрит, Флеш..."
                    className="bg-poker-dark border-poker-gold/30"
                  />
                </div>

                <div>
                  <Label className="text-white">Комментарий к раунду</Label>
                  <Input
                    placeholder="Дополнительная информация"
                    className="bg-poker-dark border-poker-gold/30"
                  />
                </div>

                <Button className="w-full bg-poker-gold hover:bg-poker-gold/80 text-black font-semibold">
                  ✅ Записать данные о раунде
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="min-h-screen bg-poker-dark p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-montserrat font-bold text-poker-gold flex items-center gap-2">
            📊 Дашборд игры
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentView("admin")}
              variant="outline"
              className="border-poker-gold text-poker-gold"
            >
              ⚙️ Админ
            </Button>
            <Button
              onClick={() => setCurrentView("lobby")}
              variant="outline"
              className="border-poker-gold text-poker-gold"
            >
              🏠 Лобби
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-poker-gray border-poker-gold/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-poker-gold font-semibold mb-2">
                🎯 Раунды сыграно
              </h3>
              <p className="text-4xl font-bold text-white">24</p>
            </CardContent>
          </Card>

          <Card className="bg-poker-gray border-poker-gold/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-poker-gold font-semibold mb-2">
                💰 Фишек в игре
              </h3>
              <p className="text-2xl font-bold text-white">85,420</p>
              <p className="text-sm text-gray-400">≈ 42,710₽</p>
            </CardContent>
          </Card>

          <Card className="bg-poker-gray border-poker-gold/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-poker-gold font-semibold mb-2">
                ⏱️ Время игры
              </h3>
              <p className="text-3xl font-bold text-white">2:15:30</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-poker-gray border-poker-gold/20">
            <CardHeader>
              <CardTitle className="text-poker-gold">
                🏆 Гистограмма победителей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={winnerData}>
                    <XAxis dataKey="name" stroke="#D4A428" />
                    <YAxis stroke="#D4A428" />
                    <Bar dataKey="wins" fill="#D4A428" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-poker-gray border-poker-gold/20">
            <CardHeader>
              <CardTitle className="text-poker-gold">
                🃏 Победные комбинации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={combinationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {combinationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-poker-gray border-poker-gold/20">
          <CardHeader>
            <CardTitle className="text-poker-gold">
              🎰 Лучшие дилеры для каждого игрока
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {winnerData.map((player, index) => (
                <div
                  key={index}
                  className="p-4 bg-poker-dark rounded-lg border border-poker-gold/30"
                >
                  <h3 className="text-white font-semibold mb-2">
                    {player.name}
                  </h3>
                  <p className="text-poker-gold">
                    Лучший дилер: Игрок {((index + 2) % 4) + 1}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Побед с этим дилером: {Math.floor(player.wins * 0.6)} (
                    {Math.floor(((player.wins * 0.6) / player.wins) * 100)}%)
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="dark">
      {currentView === "lobby" && <LobbyView />}
      {currentView === "admin" && <AdminView />}
      {currentView === "dashboard" && <DashboardView />}
    </div>
  );
};

export default Index;
