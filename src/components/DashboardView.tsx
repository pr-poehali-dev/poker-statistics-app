import { Button } from "@/components/ui/button";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Icon from "@/components/ui/icon";
import { GameData, Player } from "@/types";

interface DashboardViewProps {
  currentGame: GameData;
  setCurrentView: (view: string) => void;
  gameTimer: number;
  formatTime: (seconds: number) => string;
  getPlayerGameStats: (playerName: string) => any;
}

export const DashboardView = ({ 
  currentGame, 
  setCurrentView, 
  gameTimer, 
  formatTime, 
  getPlayerGameStats 
}: DashboardViewProps) => {
  if (!currentGame) return null;

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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