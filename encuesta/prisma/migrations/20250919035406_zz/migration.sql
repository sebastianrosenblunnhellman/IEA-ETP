-- AlterTable
ALTER TABLE "public"."SurveyResponse" ADD COLUMN     "consent" BOOLEAN,
ADD COLUMN     "raw_payload" JSONB;
