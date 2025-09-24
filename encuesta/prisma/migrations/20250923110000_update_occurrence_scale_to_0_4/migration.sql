-- Update occurrence scale from 0..6 to 0..4
-- Strategy: clamp any values >4 down to 4; keep nulls as-is

DO $$
DECLARE
  col TEXT;
  cols TEXT[] := ARRAY[
    'psa_docentePos_frequency','psa_docenteNeg_frequency','psa_califAlta_frequency','psa_califBaja_frequency',
    'psa_obsDocentePos_frequency','psa_obsDocenteNeg_frequency',
    'tcc_docentePos_frequency','tcc_docenteNeg_frequency','tcc_califAlta_frequency','tcc_califBaja_frequency',
    'tcc_obsDocentePos_frequency','tcc_obsDocenteNeg_frequency',
    'psa_paresPos_frequency','psa_paresNeg_frequency','psa_obsParesPos_frequency','psa_obsParesNeg_frequency',
    'tcc_paresPos_frequency','tcc_paresNeg_frequency','tcc_obsParesPos_frequency','tcc_obsParesNeg_frequency',
    'psa_teoriaPos_frequency','psa_teoriaNeg_frequency','psa_teoricoClaro_frequency','psa_teoricoConfuso_frequency',
    'tcc_teoriaPos_frequency','tcc_teoriaNeg_frequency','tcc_teoricoClaro_frequency','tcc_teoricoConfuso_frequency',
    'psa_clinicoPos_frequency','psa_clinicoNeg_frequency','psa_relatosPos_frequency','psa_relatosNeg_frequency',
    'tcc_clinicoPos_frequency','tcc_clinicoNeg_frequency','tcc_relatosPos_frequency','tcc_relatosNeg_frequency',
    'psa_familiaPos_frequency','psa_familiaNeg_frequency','tcc_familiaPos_frequency','tcc_familiaNeg_frequency'
  ];
BEGIN
  FOREACH col IN ARRAY cols LOOP
    EXECUTE format('UPDATE "SurveyResponse" SET %I = LEAST(4, GREATEST(0, %I)) WHERE %I IS NOT NULL;', col, col, col);
  END LOOP;
END $$;
