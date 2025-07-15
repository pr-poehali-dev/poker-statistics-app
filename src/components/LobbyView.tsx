import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { GameData, Player } from "@/types";
import { ManagePlayersDialog } from "./ManagePlayersDialog";
import { CreateGameDialog } from "./CreateGameDialog";

interface LobbyViewProps {
  games: GameData[];
  players: Player[];
  setPlayers: (players: Player[]) => void;
  setGames: (games: GameData[]) => void;
  setCurrentGame: (game: GameData) => void;
  setCurrentView: (view: string) => void;
  createPlayerStats: (name: string) => Player;
}

export const LobbyView = ({ 
  games, 
  players, 
  setPlayers, 
  setGames, 
  setCurrentGame, 
  setCurrentView, 
  createPlayerStats 
}: LobbyViewProps) => {
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
                <ManagePlayersDialog 
                  players={players}
                  setPlayers={setPlayers}
                  createPlayerStats={createPlayerStats}
                />
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
                <CreateGameDialog 
                  players={players}
                  setPlayers={setPlayers}
                  setGames={setGames}
                  setCurrentGame={setCurrentGame}
                  setCurrentView={setCurrentView}
                  onClose={() => setIsCreateGameOpen(false)}
                  createPlayerStats={createPlayerStats}
                />
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