export interface GameData {
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

export interface Round {
  id: string;
  winners: string[];
  dealer: string;
  combination: string;
  comment: string;
  timestamp: Date;
}

export interface Player {
  id: string;
  name: string;
  totalGames: number;
  totalWins: number;
  winRate: number;
  favoriteCombination: string;
  bestDealer: string;
  totalBuyIns: number;
  totalBuyInChips: number;
}

export type ViewType = "lobby" | "admin" | "dashboard" | "create-game" | "manage-players";