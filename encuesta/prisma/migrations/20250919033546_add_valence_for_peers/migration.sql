-- AlterTable
ALTER TABLE "public"."SurveyResponse" ADD COLUMN     "psa_obsParesNeg_valence" INTEGER,
ADD COLUMN     "psa_obsParesPos_valence" INTEGER,
ADD COLUMN     "psa_paresNeg_valence" INTEGER,
ADD COLUMN     "psa_paresPos_valence" INTEGER,
ADD COLUMN     "tcc_obsParesNeg_valence" INTEGER,
ADD COLUMN     "tcc_obsParesPos_valence" INTEGER,
ADD COLUMN     "tcc_paresNeg_valence" INTEGER,
ADD COLUMN     "tcc_paresPos_valence" INTEGER;
