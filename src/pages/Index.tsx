import { useState, useEffect } from "react";
import { GameData, Round, Player, ViewType } from "@/types";
import { LobbyView } from "@/components/LobbyView";
import { AdminView } from "@/components/AdminView";
import { DashboardView } from "@/components/DashboardView";

const Index = () => {
  const [games, setGames] = useState<GameData[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("lobby");
  const [gameTimer, setGameTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentGame && currentGame.isActive && timerRunning) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentGame, timerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dark">
      {currentView === "lobby" && (
        <LobbyView
          games={games}
          players={players}
          setPlayers={setPlayers}
          setGames={setGames}
          setCurrentGame={setCurrentGame}
          setCurrentView={setCurrentView}
          createPlayerStats={createPlayerStats}
        />
      )}
      {currentView === "admin" && currentGame && (
        <AdminView
          currentGame={currentGame}
          setCurrentGame={setCurrentGame}
          setCurrentView={setCurrentView}
          gameTimer={gameTimer}
          setGameTimer={setGameTimer}
          formatTime={formatTime}
          updatePlayerStats={updatePlayerStats}
        />
      )}
      {currentView === "dashboard" && currentGame && (
        <DashboardView
          currentGame={currentGame}
          setCurrentView={setCurrentView}
          gameTimer={gameTimer}
          formatTime={formatTime}
          getPlayerGameStats={getPlayerGameStats}
        />
      )}
    </div>
  );
};

export default Index;