-- Alter SurveyResponse table according to new schema
-- Note: Adjust SQL to your actual DB names if needed

ALTER TABLE "SurveyResponse"
  DROP COLUMN IF EXISTS "promedio",
  DROP COLUMN IF EXISTS "contacto_pares_text",
  ADD COLUMN IF NOT EXISTS "contacto_pares_opcion" TEXT,
  ADD COLUMN IF NOT EXISTS "contacto_pares_otro" TEXT,
  ADD COLUMN IF NOT EXISTS "adscripcion_teorica_cambio" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_docentePos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_docenteNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_califAlta_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_califBaja_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_obsDocentePos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_obsDocenteNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_docentePos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_docenteNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_califAlta_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_califBaja_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_obsDocentePos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_obsDocenteNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_teoriaPos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_teoriaNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_teoricoClaro_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_teoricoConfuso_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_teoriaPos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_teoriaNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_teoricoClaro_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_teoricoConfuso_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_clinicoPos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_clinicoNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_relatosPos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_relatosNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_clinicoPos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_clinicoNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_relatosPos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_relatosNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_familiaPos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "psa_familiaNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_familiaPos_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "tcc_familiaNeg_valence" INTEGER,
  ADD COLUMN IF NOT EXISTS "no_teorico" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "no_formacion" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "no_redes" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "otro_label" TEXT;

-- Convert existing enum-typed valence columns to INTEGER (mapping: positivos=5, neutros=3, negativos=1)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SurveyResponse'
      AND column_name IN ('psa_califAlta_valence','psa_califBaja_valence','tcc_califAlta_valence','tcc_califBaja_valence')
  ) THEN
    ALTER TABLE "public"."SurveyResponse"
      ALTER COLUMN "psa_califAlta_valence" TYPE INTEGER USING CASE "psa_califAlta_valence"
        WHEN 'positivos'::"public"."Valencia" THEN 5
        WHEN 'neutros'::"public"."Valencia" THEN 3
        WHEN 'negativos'::"public"."Valencia" THEN 1
        ELSE NULL END,
      ALTER COLUMN "psa_califBaja_valence" TYPE INTEGER USING CASE "psa_califBaja_valence"
        WHEN 'positivos'::"public"."Valencia" THEN 5
        WHEN 'neutros'::"public"."Valencia" THEN 3
        WHEN 'negativos'::"public"."Valencia" THEN 1
        ELSE NULL END,
      ALTER COLUMN "tcc_califAlta_valence" TYPE INTEGER USING CASE "tcc_califAlta_valence"
        WHEN 'positivos'::"public"."Valencia" THEN 5
        WHEN 'neutros'::"public"."Valencia" THEN 3
        WHEN 'negativos'::"public"."Valencia" THEN 1
        ELSE NULL END,
      ALTER COLUMN "tcc_califBaja_valence" TYPE INTEGER USING CASE "tcc_califBaja_valence"
        WHEN 'positivos'::"public"."Valencia" THEN 5
        WHEN 'neutros'::"public"."Valencia" THEN 3
        WHEN 'negativos'::"public"."Valencia" THEN 1
        ELSE NULL END;
  END IF;
END $$;

-- Drop enum Valencia if exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Valencia') THEN
    DROP TYPE "Valencia";
  END IF;
END $$;
