import { supabase } from './supabase';

// Интерфейсы для API
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
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  startingStack: number;
  smallBlind: number;
  bigBlind: number;
  chipToRuble: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'finished' | 'paused';
  gameDuration: number;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}

export interface Round {
  id: string;
  gameId: string;
  roundNumber: number;
  dealerId: string;
  dealerName: string;
  combination: string;
  comment?: string;
  winners: Player[];
  createdAt: string;
}

export interface BuyIn {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  chipsAmount: number;
  rubleAmount: number;
  buyInNumber: number;
  createdAt: string;
}

export interface GameResult {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  finalChips: number;
  totalBuyIns: number;
  totalBuyInChips: number;
  totalBuyInRubles: number;
  finalRubles: number;
  profitLoss: number;
  createdAt: string;
}

// API для работы с игроками
export const playersApi = {
  async getAll(): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(player => ({
      id: player.id,
      name: player.name,
      totalGames: player.total_games,
      totalWins: player.total_wins,
      winRate: player.win_rate,
      favoriteCombination: player.favorite_combination || 'Не определена',
      bestDealer: player.best_dealer || 'Не определен',
      totalBuyIns: player.total_buy_ins,
      totalBuyInChips: player.total_buy_in_chips,
      createdAt: player.created_at,
      updatedAt: player.updated_at,
    }));
  },

  async create(name: string): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      totalGames: data.total_games,
      totalWins: data.total_wins,
      winRate: data.win_rate,
      favoriteCombination: data.favorite_combination || 'Не определена',
      bestDealer: data.best_dealer || 'Не определен',
      totalBuyIns: data.total_buy_ins,
      totalBuyInChips: data.total_buy_in_chips,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async update(id: string, name: string): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      totalGames: data.total_games,
      totalWins: data.total_wins,
      winRate: data.win_rate,
      favoriteCombination: data.favorite_combination || 'Не определена',
      bestDealer: data.best_dealer || 'Не определен',
      totalBuyIns: data.total_buy_ins,
      totalBuyInChips: data.total_buy_in_chips,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateStats(playerId: string): Promise<void> {
    const { error } = await supabase.rpc('update_player_stats', {
      player_uuid: playerId
    });
    
    if (error) throw error;
  }
};

// API для работы с играми
export const gamesApi = {
  async getAll(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        game_players (
          player_id,
          players (*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(game => ({
      id: game.id,
      name: game.name,
      startingStack: game.starting_stack,
      smallBlind: game.small_blind,
      bigBlind: game.big_blind,
      chipToRuble: game.chip_to_ruble,
      startTime: game.start_time,
      endTime: game.end_time,
      status: game.status,
      gameDuration: game.game_duration,
      players: game.game_players.map((gp: any) => ({
        id: gp.players.id,
        name: gp.players.name,
        totalGames: gp.players.total_games,
        totalWins: gp.players.total_wins,
        winRate: gp.players.win_rate,
        favoriteCombination: gp.players.favorite_combination || 'Не определена',
        bestDealer: gp.players.best_dealer || 'Не определен',
        totalBuyIns: gp.players.total_buy_ins,
        totalBuyInChips: gp.players.total_buy_in_chips,
        createdAt: gp.players.created_at,
        updatedAt: gp.players.updated_at,
      })),
      createdAt: game.created_at,
      updatedAt: game.updated_at,
    }));
  },

  async create(gameData: {
    name: string;
    startingStack: number;
    smallBlind: number;
    bigBlind: number;
    chipToRuble: number;
    playerIds: string[];
  }): Promise<Game> {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert([{
        name: gameData.name,
        starting_stack: gameData.startingStack,
        small_blind: gameData.smallBlind,
        big_blind: gameData.bigBlind,
        chip_to_ruble: gameData.chipToRuble,
      }])
      .select()
      .single();
    
    if (gameError) throw gameError;

    // Добавляем игроков в игру
    const gamePlayersData = gameData.playerIds.map(playerId => ({
      game_id: game.id,
      player_id: playerId,
    }));

    const { error: playersError } = await supabase
      .from('game_players')
      .insert(gamePlayersData);
    
    if (playersError) throw playersError;

    // Создаем начальные закупы для всех игроков
    const buyInsData = gameData.playerIds.map(playerId => ({
      game_id: game.id,
      player_id: playerId,
      chips_amount: gameData.startingStack,
      ruble_amount: gameData.startingStack * gameData.chipToRuble,
      buy_in_number: 1,
    }));

    const { error: buyInsError } = await supabase
      .from('buy_ins')
      .insert(buyInsData);
    
    if (buyInsError) throw buyInsError;

    // Получаем созданную игру с игроками
    const { data: gameWithPlayers, error: fetchError } = await supabase
      .from('games')
      .select(`
        *,
        game_players (
          player_id,
          players (*)
        )
      `)
      .eq('id', game.id)
      .single();
    
    if (fetchError) throw fetchError;

    return {
      id: gameWithPlayers.id,
      name: gameWithPlayers.name,
      startingStack: gameWithPlayers.starting_stack,
      smallBlind: gameWithPlayers.small_blind,
      bigBlind: gameWithPlayers.big_blind,
      chipToRuble: gameWithPlayers.chip_to_ruble,
      startTime: gameWithPlayers.start_time,
      endTime: gameWithPlayers.end_time,
      status: gameWithPlayers.status,
      gameDuration: gameWithPlayers.game_duration,
      players: gameWithPlayers.game_players.map((gp: any) => ({
        id: gp.players.id,
        name: gp.players.name,
        totalGames: gp.players.total_games,
        totalWins: gp.players.total_wins,
        winRate: gp.players.win_rate,
        favoriteCombination: gp.players.favorite_combination || 'Не определена',
        bestDealer: gp.players.best_dealer || 'Не определен',
        totalBuyIns: gp.players.total_buy_ins,
        totalBuyInChips: gp.players.total_buy_in_chips,
        createdAt: gp.players.created_at,
        updatedAt: gp.players.updated_at,
      })),
      createdAt: gameWithPlayers.created_at,
      updatedAt: gameWithPlayers.updated_at,
    };
  },

  async update(id: string, updates: {
    name?: string;
    startingStack?: number;
    smallBlind?: number;
    bigBlind?: number;
    chipToRuble?: number;
    status?: 'active' | 'finished' | 'paused';
    gameDuration?: number;
  }): Promise<Game> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.startingStack !== undefined) updateData.starting_stack = updates.startingStack;
    if (updates.smallBlind !== undefined) updateData.small_blind = updates.smallBlind;
    if (updates.bigBlind !== undefined) updateData.big_blind = updates.bigBlind;
    if (updates.chipToRuble !== undefined) updateData.chip_to_ruble = updates.chipToRuble;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.gameDuration !== undefined) updateData.game_duration = updates.gameDuration;

    if (updates.status === 'finished') {
      updateData.end_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        game_players (
          player_id,
          players (*)
        )
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      startingStack: data.starting_stack,
      smallBlind: data.small_blind,
      bigBlind: data.big_blind,
      chipToRuble: data.chip_to_ruble,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      gameDuration: data.game_duration,
      players: data.game_players.map((gp: any) => ({
        id: gp.players.id,
        name: gp.players.name,
        totalGames: gp.players.total_games,
        totalWins: gp.players.total_wins,
        winRate: gp.players.win_rate,
        favoriteCombination: gp.players.favorite_combination || 'Не определена',
        bestDealer: gp.players.best_dealer || 'Не определен',
        totalBuyIns: gp.players.total_buy_ins,
        totalBuyInChips: gp.players.total_buy_in_chips,
        createdAt: gp.players.created_at,
        updatedAt: gp.players.updated_at,
      })),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async addPlayer(gameId: string, playerId: string): Promise<void> {
    const { error } = await supabase
      .from('game_players')
      .insert([{
        game_id: gameId,
        player_id: playerId,
      }]);
    
    if (error) throw error;
  }
};

// API для работы с раундами
export const roundsApi = {
  async getByGameId(gameId: string): Promise<Round[]> {
    const { data, error } = await supabase
      .from('rounds')
      .select(`
        *,
        players!rounds_dealer_id_fkey (name),
        round_winners (
          player_id,
          players (*)
        )
      `)
      .eq('game_id', gameId)
      .order('round_number');
    
    if (error) throw error;
    
    return data.map(round => ({
      id: round.id,
      gameId: round.game_id,
      roundNumber: round.round_number,
      dealerId: round.dealer_id,
      dealerName: round.players.name,
      combination: round.combination,
      comment: round.comment,
      winners: round.round_winners.map((rw: any) => ({
        id: rw.players.id,
        name: rw.players.name,
        totalGames: rw.players.total_games,
        totalWins: rw.players.total_wins,
        winRate: rw.players.win_rate,
        favoriteCombination: rw.players.favorite_combination || 'Не определена',
        bestDealer: rw.players.best_dealer || 'Не определен',
        totalBuyIns: rw.players.total_buy_ins,
        totalBuyInChips: rw.players.total_buy_in_chips,
        createdAt: rw.players.created_at,
        updatedAt: rw.players.updated_at,
      })),
      createdAt: round.created_at,
    }));
  },

  async create(roundData: {
    gameId: string;
    dealerId: string;
    combination: string;
    comment?: string;
    winnerIds: string[];
  }): Promise<Round> {
    // Получаем следующий номер раунда
    const { data: maxRound, error: maxRoundError } = await supabase
      .from('rounds')
      .select('round_number')
      .eq('game_id', roundData.gameId)
      .order('round_number', { ascending: false })
      .limit(1)
      .single();
    
    const nextRoundNumber = maxRound ? maxRound.round_number + 1 : 1;

    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert([{
        game_id: roundData.gameId,
        round_number: nextRoundNumber,
        dealer_id: roundData.dealerId,
        combination: roundData.combination,
        comment: roundData.comment,
      }])
      .select()
      .single();
    
    if (roundError) throw roundError;

    // Добавляем победителей
    const winnersData = roundData.winnerIds.map(playerId => ({
      round_id: round.id,
      player_id: playerId,
    }));

    const { error: winnersError } = await supabase
      .from('round_winners')
      .insert(winnersData);
    
    if (winnersError) throw winnersError;

    // Получаем созданный раунд с данными
    const { data: roundWithData, error: fetchError } = await supabase
      .from('rounds')
      .select(`
        *,
        players!rounds_dealer_id_fkey (name),
        round_winners (
          player_id,
          players (*)
        )
      `)
      .eq('id', round.id)
      .single();
    
    if (fetchError) throw fetchError;

    return {
      id: roundWithData.id,
      gameId: roundWithData.game_id,
      roundNumber: roundWithData.round_number,
      dealerId: roundWithData.dealer_id,
      dealerName: roundWithData.players.name,
      combination: roundWithData.combination,
      comment: roundWithData.comment,
      winners: roundWithData.round_winners.map((rw: any) => ({
        id: rw.players.id,
        name: rw.players.name,
        totalGames: rw.players.total_games,
        totalWins: rw.players.total_wins,
        winRate: rw.players.win_rate,
        favoriteCombination: rw.players.favorite_combination || 'Не определена',
        bestDealer: rw.players.best_dealer || 'Не определен',
        totalBuyIns: rw.players.total_buy_ins,
        totalBuyInChips: rw.players.total_buy_in_chips,
        createdAt: rw.players.created_at,
        updatedAt: rw.players.updated_at,
      })),
      createdAt: roundWithData.created_at,
    };
  }
};

// API для работы с закупами
export const buyInsApi = {
  async getByGameId(gameId: string): Promise<BuyIn[]> {
    const { data, error } = await supabase
      .from('buy_ins')
      .select(`
        *,
        players (name)
      `)
      .eq('game_id', gameId)
      .order('created_at');
    
    if (error) throw error;
    
    return data.map(buyIn => ({
      id: buyIn.id,
      gameId: buyIn.game_id,
      playerId: buyIn.player_id,
      playerName: buyIn.players.name,
      chipsAmount: buyIn.chips_amount,
      rubleAmount: buyIn.ruble_amount,
      buyInNumber: buyIn.buy_in_number,
      createdAt: buyIn.created_at,
    }));
  },

  async create(buyInData: {
    gameId: string;
    playerId: string;
    chipsAmount: number;
    rubleAmount: number;
  }): Promise<BuyIn> {
    // Получаем следующий номер закупа для игрока
    const { data: maxBuyIn, error: maxBuyInError } = await supabase
      .from('buy_ins')
      .select('buy_in_number')
      .eq('game_id', buyInData.gameId)
      .eq('player_id', buyInData.playerId)
      .order('buy_in_number', { ascending: false })
      .limit(1)
      .single();
    
    const nextBuyInNumber = maxBuyIn ? maxBuyIn.buy_in_number + 1 : 1;

    const { data, error } = await supabase
      .from('buy_ins')
      .insert([{
        game_id: buyInData.gameId,
        player_id: buyInData.playerId,
        chips_amount: buyInData.chipsAmount,
        ruble_amount: buyInData.rubleAmount,
        buy_in_number: nextBuyInNumber,
      }])
      .select(`
        *,
        players (name)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      playerName: data.players.name,
      chipsAmount: data.chips_amount,
      rubleAmount: data.ruble_amount,
      buyInNumber: data.buy_in_number,
      createdAt: data.created_at,
    };
  }
};

// API для работы с результатами игр
export const gameResultsApi = {
  async getByGameId(gameId: string): Promise<GameResult[]> {
    const { data, error } = await supabase
      .from('game_results')
      .select(`
        *,
        players (name)
      `)
      .eq('game_id', gameId)
      .order('profit_loss', { ascending: false });
    
    if (error) throw error;
    
    return data.map(result => ({
      id: result.id,
      gameId: result.game_id,
      playerId: result.player_id,
      playerName: result.players.name,
      finalChips: result.final_chips,
      totalBuyIns: result.total_buy_ins,
      totalBuyInChips: result.total_buy_in_chips,
      totalBuyInRubles: result.total_buy_in_rubles,
      finalRubles: result.final_rubles,
      profitLoss: result.profit_loss,
      createdAt: result.created_at,
    }));
  },

  async create(gameId: string, results: {
    playerId: string;
    finalChips: number;
    totalBuyIns: number;
    totalBuyInChips: number;
    totalBuyInRubles: number;
    finalRubles: number;
    profitLoss: number;
  }[]): Promise<GameResult[]> {
    const { data, error } = await supabase
      .from('game_results')
      .insert(results.map(result => ({
        game_id: gameId,
        player_id: result.playerId,
        final_chips: result.finalChips,
        total_buy_ins: result.totalBuyIns,
        total_buy_in_chips: result.totalBuyInChips,
        total_buy_in_rubles: result.totalBuyInRubles,
        final_rubles: result.finalRubles,
        profit_loss: result.profitLoss,
      })))
      .select(`
        *,
        players (name)
      `);
    
    if (error) throw error;
    
    return data.map(result => ({
      id: result.id,
      gameId: result.game_id,
      playerId: result.player_id,
      playerName: result.players.name,
      finalChips: result.final_chips,
      totalBuyIns: result.total_buy_ins,
      totalBuyInChips: result.total_buy_in_chips,
      totalBuyInRubles: result.total_buy_in_rubles,
      finalRubles: result.final_rubles,
      profitLoss: result.profit_loss,
      createdAt: result.created_at,
    }));
  }
};