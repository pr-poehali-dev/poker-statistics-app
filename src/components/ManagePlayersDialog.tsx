import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Player } from "@/types";

interface ManagePlayersDialogProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  createPlayerStats: (name: string) => Player;
}

export const ManagePlayersDialog = ({ players, setPlayers, createPlayerStats }: ManagePlayersDialogProps) => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const addPlayer = () => {
    if (newPlayerName.trim() && !players.find(p => p.name === newPlayerName.trim())) {
      setPlayers([...players, createPlayerStats(newPlayerName.trim())]);
      setNewPlayerName("");
    }
  };

  const updatePlayerName = (oldName: string, newName: string) => {
    if (newName.trim() && !players.find(p => p.name === newName.trim())) {
      setPlayers(players.map(player => 
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