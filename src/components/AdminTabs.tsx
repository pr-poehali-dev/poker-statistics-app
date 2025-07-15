import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { GameData, Round } from "@/types";

interface GameSettingsTabProps {
  gameSettings: any;
  setGameSettings: any;
  updateGameSettings: () => void;
  timerRunning: boolean;
  setTimerRunning: (running: boolean) => void;
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  addPlayerToGame: () => void;
  gameTimer: number;
  setGameTimer: (timer: number) => void;
  formatTime: (seconds: number) => string;
}

export const GameSettingsTab = ({ 
  gameSettings, 
  setGameSettings, 
  updateGameSettings, 
  timerRunning, 
  setTimerRunning, 
  newPlayerName, 
  setNewPlayerName, 
  addPlayerToGame, 
  gameTimer, 
  setGameTimer, 
  formatTime 
}: GameSettingsTabProps) => (
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

interface BuyInsTabProps {
  selectedForBuyIn: string[];
  setSelectedForBuyIn: (players: string[]) => void;
  buyInAmounts: { [key: string]: number };
  setBuyInAmounts: (amounts: { [key: string]: number }) => void;
  addBuyIns: () => void;
  currentGame: GameData;
}

export const BuyInsTab = ({ 
  selectedForBuyIn, 
  setSelectedForBuyIn, 
  buyInAmounts, 
  setBuyInAmounts, 
  addBuyIns, 
  currentGame 
}: BuyInsTabProps) => (
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
                      setBuyInAmounts({ ...buyInAmounts, [player]: currentGame.startingStack });
                    } else {
                      setSelectedForBuyIn(selectedForBuyIn.filter(p => p !== player));
                      const newAmounts = { ...buyInAmounts };
                      delete newAmounts[player];
                      setBuyInAmounts(newAmounts);
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
                onChange={(e) => setBuyInAmounts({ ...buyInAmounts, [player]: Number(e.target.value) })}
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

interface RoundTabProps {
  currentRound: any;
  setCurrentRound: any;
  addRound: () => void;
  currentGame: GameData;
}

export const RoundTab = ({ currentRound, setCurrentRound, addRound, currentGame }: RoundTabProps) => (
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

interface ResultsTabProps {
  finalChips: { [key: string]: number };
  setFinalChips: (chips: { [key: string]: number }) => void;
  showResults: boolean;
  calculateResults: () => any[];
  finishGame: () => void;
  currentGame: GameData;
}

export const ResultsTab = ({ 
  finalChips, 
  setFinalChips, 
  showResults, 
  calculateResults, 
  finishGame, 
  currentGame 
}: ResultsTabProps) => (
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
                onChange={(e) => setFinalChips({ ...finalChips, [player]: Number(e.target.value) })}
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