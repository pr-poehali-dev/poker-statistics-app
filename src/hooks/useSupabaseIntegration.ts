import { useEffect, useState } from 'react';
import { 
  playersApi, 
  gamesApi, 
  roundsApi, 
  buyInsApi, 
  gameResultsApi,
  Player,
  Game,
  Round,
  BuyIn,
  GameResult
} from '../lib/api';

// Хук для управления состоянием с Supabase
export const useSupabaseIntegration = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при инициализации
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [playersData, gamesData] = await Promise.all([
        playersApi.getAll(),
        gamesApi.getAll()
      ]);
      
      setPlayers(playersData);
      setGames(gamesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  // Методы для работы с игроками
  const createPlayer = async (name: string): Promise<Player> => {
    try {
      const newPlayer = await playersApi.create(name);
      setPlayers(prev => [...prev, newPlayer]);
      return newPlayer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания игрока');
      throw err;
    }
  };

  const updatePlayer = async (id: string, name: string): Promise<Player> => {
    try {
      const updatedPlayer = await playersApi.update(id, name);
      setPlayers(prev => prev.map(p => p.id === id ? updatedPlayer : p));
      return updatedPlayer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления игрока');
      throw err;
    }
  };

  const refreshPlayerStats = async (playerId: string) => {
    try {
      await playersApi.updateStats(playerId);
      // Перезагружаем данные игрока
      const updatedPlayers = await playersApi.getAll();
      setPlayers(updatedPlayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления статистики');
      throw err;
    }
  };

  // Методы для работы с играми
  const createGame = async (gameData: {
    name: string;
    startingStack: number;
    smallBlind: number;
    bigBlind: number;
    chipToRuble: number;
    playerIds: string[];
  }): Promise<Game> => {
    try {
      const newGame = await gamesApi.create(gameData);
      setGames(prev => [newGame, ...prev]);
      return newGame;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания игры');
      throw err;
    }
  };

  const updateGame = async (id: string, updates: {
    name?: string;
    startingStack?: number;
    smallBlind?: number;
    bigBlind?: number;
    chipToRuble?: number;
    status?: 'active' | 'finished' | 'paused';
    gameDuration?: number;
  }): Promise<Game> => {
    try {
      const updatedGame = await gamesApi.update(id, updates);
      setGames(prev => prev.map(g => g.id === id ? updatedGame : g));
      return updatedGame;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления игры');
      throw err;
    }
  };

  const addPlayerToGame = async (gameId: string, playerId: string) => {
    try {
      await gamesApi.addPlayer(gameId, playerId);
      // Перезагружаем игры для обновления списка игроков
      const updatedGames = await gamesApi.getAll();
      setGames(updatedGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления игрока в игру');
      throw err;
    }
  };

  const finishGame = async (gameId: string, gameDuration: number, results: {
    playerId: string;
    finalChips: number;
    totalBuyIns: number;
    totalBuyInChips: number;
    totalBuyInRubles: number;
    finalRubles: number;
    profitLoss: number;
  }[]): Promise<void> => {
    try {
      // Обновляем статус игры
      await updateGame(gameId, { 
        status: 'finished', 
        gameDuration 
      });
      
      // Сохраняем результаты
      await gameResultsApi.create(gameId, results);
      
      // Обновляем статистику всех игроков
      const game = games.find(g => g.id === gameId);
      if (game) {
        await Promise.all(
          game.players.map(player => refreshPlayerStats(player.id))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка завершения игры');
      throw err;
    }
  };

  // Методы для работы с раундами
  const createRound = async (roundData: {
    gameId: string;
    dealerId: string;
    combination: string;
    comment?: string;
    winnerIds: string[];
  }): Promise<Round> => {
    try {
      const newRound = await roundsApi.create(roundData);
      return newRound;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания раунда');
      throw err;
    }
  };

  const getRounds = async (gameId: string): Promise<Round[]> => {
    try {
      return await roundsApi.getByGameId(gameId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки раундов');
      throw err;
    }
  };

  // Методы для работы с закупами
  const createBuyIn = async (buyInData: {
    gameId: string;
    playerId: string;
    chipsAmount: number;
    rubleAmount: number;
  }): Promise<BuyIn> => {
    try {
      const newBuyIn = await buyInsApi.create(buyInData);
      return newBuyIn;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания закупа');
      throw err;
    }
  };

  const getBuyIns = async (gameId: string): Promise<BuyIn[]> => {
    try {
      return await buyInsApi.getByGameId(gameId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки закупов');
      throw err;
    }
  };

  // Методы для работы с результатами
  const getGameResults = async (gameId: string): Promise<GameResult[]> => {
    try {
      return await gameResultsApi.getByGameId(gameId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки результатов');
      throw err;
    }
  };

  // Утилитарные методы
  const clearError = () => setError(null);
  
  const refresh = () => loadInitialData();

  return {
    // Состояние
    players,
    games,
    loading,
    error,
    
    // Методы для игроков
    createPlayer,
    updatePlayer,
    refreshPlayerStats,
    
    // Методы для игр
    createGame,
    updateGame,
    addPlayerToGame,
    finishGame,
    
    // Методы для раундов
    createRound,
    getRounds,
    
    // Методы для закупов
    createBuyIn,
    getBuyIns,
    
    // Методы для результатов
    getGameResults,
    
    // Утилитарные методы
    clearError,
    refresh,
  };
};

// Типы для экспорта
export type { Player, Game, Round, BuyIn, GameResult };