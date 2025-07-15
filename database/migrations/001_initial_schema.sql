-- Migration: 001_initial_schema.sql
-- Создание: 2024-01-01
-- Описание: Начальная схема для Lozo Poker

-- Проверка версии миграции
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Применение миграции только если она еще не была применена
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001_initial_schema') THEN
        
        -- Создание основных таблиц
        -- (Код схемы из schema.sql)
        
        -- Вставка записи о применении миграции
        INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');
        
        RAISE NOTICE 'Migration 001_initial_schema applied successfully';
    ELSE
        RAISE NOTICE 'Migration 001_initial_schema already applied, skipping';
    END IF;
END
$$;