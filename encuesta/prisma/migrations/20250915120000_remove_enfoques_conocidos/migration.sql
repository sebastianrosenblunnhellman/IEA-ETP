-- Drop the column associated with the removed survey question (old pregunta 11)
-- Adjust if your SQL dialect or naming differs.
ALTER TABLE "SurveyResponse" DROP COLUMN IF EXISTS "enfoques_conocidos_list";