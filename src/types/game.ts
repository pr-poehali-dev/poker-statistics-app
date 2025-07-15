// Backend интеграция - типы данных для API
export interface Player {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Статистика игрока
  totalGames: number;
  totalWins: number;
  winRate: number;
  favoriteCombination: string;
  bestDealer: string;
  totalBuyIns: number;
  totalBuyInChips: number;
}

export interface GameRound {
  id: string;
  gameId: string;
  winners: string[];
  dealer: string;
  combination: string;
  comment: string;
  timestamp: string;
  roundNumber: number;
}

export interface Game {
  id: string;
  name: string;
  players: Player[];
  startingStack: number;
  smallBlind: number;
  bigBlind: number;
  chipToRuble: number;
  buyins: Record<string, number>;
  rounds: GameRound[];
  startTime: string;
  endTime?: string;
  status: "active" | "finished" | "paused";
  createdAt: string;
  updatedAt: string;
}

// API методы для future backend интеграции
export interface GameAPI {
  createGame: (
    data: Omit<Game, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Game>;
  updateGame: (id: string, data: Partial<Game>) => Promise<Game>;
  deleteGame: (id: string) => Promise<void>;
  getGame: (id: string) => Promise<Game>;
  getGames: () => Promise<Game[]>;
  addPlayer: (
    gameId: string,
    player: Omit<Player, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Player>;
  removePlayer: (gameId: string, playerId: string) => Promise<void>;
  addRound: (
    gameId: string,
    round: Omit<GameRound, "id" | "gameId" | "timestamp" | "roundNumber">,
  ) => Promise<GameRound>;
  updateBuyin: (
    gameId: string,
    playerId: string,
    count: number,
  ) => Promise<void>;
}

// Локальное состояние приложения (до подключения backend)
export interface AppState {
  games: Game[];
  players: Player[];
  currentGame: Game | null;
  currentView: "lobby" | "admin" | "dashboard" | "create-game" | "manage-players";
}