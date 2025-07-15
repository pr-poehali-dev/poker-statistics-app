-- Lozo Poker Database Schema for Supabase
-- Создание таблиц для покерного приложения

-- Таблица игроков
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    favorite_combination VARCHAR(100),
    best_dealer VARCHAR(255),
    total_buy_ins INTEGER DEFAULT 0,
    total_buy_in_chips INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица игр
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    starting_stack INTEGER NOT NULL DEFAULT 1000,
    small_blind INTEGER NOT NULL DEFAULT 5,
    big_blind INTEGER NOT NULL DEFAULT 10,
    chip_to_ruble DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'finished', 'paused')),
    game_duration INTEGER DEFAULT 0, -- в секундах
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица участников игры (связь многие-ко-многим между играми и игроками)
CREATE TABLE IF NOT EXISTS game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, player_id)
);

-- Таблица раундов
CREATE TABLE IF NOT EXISTS rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    dealer_id UUID NOT NULL REFERENCES players(id),
    combination VARCHAR(100) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, round_number)
);

-- Таблица победителей раундов (связь многие-ко-многим между раундами и игроками)
CREATE TABLE IF NOT EXISTS round_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(round_id, player_id)
);

-- Таблица закупов
CREATE TABLE IF NOT EXISTS buy_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    chips_amount INTEGER NOT NULL DEFAULT 1000,
    ruble_amount DECIMAL(10,2) NOT NULL,
    buy_in_number INTEGER NOT NULL DEFAULT 1, -- номер закупа для игрока в данной игре
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица итогов игры
CREATE TABLE IF NOT EXISTS game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    final_chips INTEGER NOT NULL DEFAULT 0,
    total_buy_ins INTEGER NOT NULL DEFAULT 0,
    total_buy_in_chips INTEGER NOT NULL DEFAULT 0,
    total_buy_in_rubles DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    final_rubles DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    profit_loss DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- прибыль/убыток
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, player_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_buy_ins_game_player ON buy_ins(game_id, player_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON game_results(game_id);

-- Триггеры для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для пересчета статистики игрока
CREATE OR REPLACE FUNCTION update_player_stats(player_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_games_count INTEGER;
    total_wins_count INTEGER;
    win_rate_calc DECIMAL(5,2);
    total_buy_ins_count INTEGER;
    total_buy_in_chips_count INTEGER;
    favorite_combo VARCHAR(100);
    best_dealer_name VARCHAR(255);
BEGIN
    -- Подсчет общего количества игр
    SELECT COUNT(DISTINCT gp.game_id) INTO total_games_count
    FROM game_players gp
    JOIN games g ON gp.game_id = g.id
    WHERE gp.player_id = player_uuid AND g.status = 'finished';
    
    -- Подсчет общего количества побед в раундах
    SELECT COUNT(*) INTO total_wins_count
    FROM round_winners rw
    JOIN rounds r ON rw.round_id = r.id
    JOIN games g ON r.game_id = g.id
    WHERE rw.player_id = player_uuid AND g.status = 'finished';
    
    -- Вычисление процента побед
    win_rate_calc := CASE 
        WHEN total_games_count > 0 THEN (total_wins_count::DECIMAL / total_games_count) * 100
        ELSE 0
    END;
    
    -- Подсчет общего количества закупов
    SELECT COUNT(*), COALESCE(SUM(chips_amount), 0) INTO total_buy_ins_count, total_buy_in_chips_count
    FROM buy_ins bi
    JOIN games g ON bi.game_id = g.id
    WHERE bi.player_id = player_uuid AND g.status = 'finished';
    
    -- Поиск любимой комбинации
    SELECT combination INTO favorite_combo
    FROM (
        SELECT r.combination, COUNT(*) as combo_count
        FROM round_winners rw
        JOIN rounds r ON rw.round_id = r.id
        JOIN games g ON r.game_id = g.id
        WHERE rw.player_id = player_uuid AND g.status = 'finished'
        GROUP BY r.combination
        ORDER BY combo_count DESC
        LIMIT 1
    ) AS combo_stats;
    
    -- Поиск лучшего дилера
    SELECT p.name INTO best_dealer_name
    FROM (
        SELECT r.dealer_id, COUNT(*) as dealer_wins
        FROM round_winners rw
        JOIN rounds r ON rw.round_id = r.id
        JOIN games g ON r.game_id = g.id
        WHERE rw.player_id = player_uuid AND g.status = 'finished'
        GROUP BY r.dealer_id
        ORDER BY dealer_wins DESC
        LIMIT 1
    ) AS dealer_stats
    JOIN players p ON dealer_stats.dealer_id = p.id;
    
    -- Обновление статистики игрока
    UPDATE players SET
        total_games = total_games_count,
        total_wins = total_wins_count,
        win_rate = win_rate_calc,
        favorite_combination = COALESCE(favorite_combo, 'Не определена'),
        best_dealer = COALESCE(best_dealer_name, 'Не определен'),
        total_buy_ins = total_buy_ins_count,
        total_buy_in_chips = total_buy_in_chips_count,
        updated_at = NOW()
    WHERE id = player_uuid;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления статистики после завершения игры
CREATE OR REPLACE FUNCTION update_all_players_stats_on_game_finish()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
        -- Обновляем статистику всех игроков, участвовавших в игре
        PERFORM update_player_stats(gp.player_id)
        FROM game_players gp
        WHERE gp.game_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_game_finish AFTER UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_all_players_stats_on_game_finish();

-- Включение Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE buy_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Политики безопасности (для публичного доступа в демо-версии)
CREATE POLICY "Enable all operations for all users" ON players FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON games FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON game_players FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON rounds FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON round_winners FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON buy_ins FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON game_results FOR ALL USING (true);

-- Примеры данных для тестирования
INSERT INTO players (name) VALUES 
('Алексей'),
('Мария'),
('Дмитрий'),
('Анна'),
('Игорь')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE players IS 'Таблица игроков с их статистикой';
COMMENT ON TABLE games IS 'Таблица игр с настройками и статусом';
COMMENT ON TABLE game_players IS 'Связь между играми и игроками';
COMMENT ON TABLE rounds IS 'Таблица раундов в играх';
COMMENT ON TABLE round_winners IS 'Победители каждого раунда';
COMMENT ON TABLE buy_ins IS 'Закупы игроков в играх';
COMMENT ON TABLE game_results IS 'Финальные результаты игроков по играм';