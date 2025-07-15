import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { GameData, Player } from "@/types";

interface CreateGameDialogProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  setGames: (games: GameData[]) => void;
  setCurrentGame: (game: GameData) => void;
  setCurrentView: (view: string) => void;
  onClose: () => void;
  createPlayerStats: (name: string) => Player;
}

export const CreateGameDialog = ({ 
  players, 
  setPlayers, 
  setGames, 
  setCurrentGame, 
  setCurrentView, 
  onClose, 
  createPlayerStats 
}: CreateGameDialogProps) => {
  const [gameName, setGameName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [startingStack, setStartingStack] = useState(1000);
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [chipToRuble, setChipToRuble] = useState(1);
  const [newPlayerName, setNewPlayerName] = useState("");

  const addNewPlayer = () => {
    if (newPlayerName.trim() && !players.find(p => p.name === newPlayerName.trim())) {
      setPlayers([...players, createPlayerStats(newPlayerName.trim())]);
      setSelectedPlayers([...selectedPlayers, newPlayerName.trim()]);
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
                    setSelectedPlayers([...selectedPlayers, player.name]);
                  } else {
                    setSelectedPlayers(selectedPlayers.filter(name => name !== player.name));
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