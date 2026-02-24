-- Migration: rename perceptions table to prescriptions (safe for Postgres)
-- Usage: psql "postgres://<user>:<pass>@<host>:<port>/<db>" -f scripts/rename_perceptions_to_prescriptions.sql

BEGIN;

-- Only proceed if the perceptions table exists and prescriptions does not
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'perceptions')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prescriptions') THEN

    -- Rename the table
    ALTER TABLE public.perceptions RENAME TO prescriptions;

    -- If a sequence with the conventional name exists, rename it and attach to prescriptions.id
    IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'perceptions_id_seq') THEN
      ALTER SEQUENCE perceptions_id_seq RENAME TO prescriptions_id_seq;
      EXECUTE 'ALTER TABLE public.prescriptions ALTER COLUMN id SET DEFAULT nextval(''prescriptions_id_seq'')';
    END IF;

    -- Rename indexes that follow a perceptions_* naming convention (best-effort)
    FOR idx IN SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'perceptions_%' LOOP
      EXECUTE format('ALTER INDEX %I RENAME TO %s', idx.indexname, replace(idx.indexname, 'perceptions_', 'prescriptions_'));
    END LOOP;

  END IF;
END$$;

COMMIT;

-- Note: This migration attempts to rename sequences and indexes with conventional names.
-- If you have other objects (views, functions, triggers, foreign keys) referencing the old
-- table name, review and update them manually after running this script.
