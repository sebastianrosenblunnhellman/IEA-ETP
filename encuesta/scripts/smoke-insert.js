/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const created = await prisma.surveyResponse.create({
      data: {
        consent: true,
        raw_payload: { test: true, ts: new Date().toISOString() },
        edad: 25,
        genero: 'Masculino',
        anio_inicio: 2022,
        situacion_academica: 'CBC',
        psa_preferencia: 1,
        tcc_preferencia: -1,
        psa_conocimiento: 3,
        tcc_conocimiento: 2,
      },
    });
    console.log('Inserted SurveyResponse id:', created.id);
  } catch (e) {
    console.error('Smoke insert failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
