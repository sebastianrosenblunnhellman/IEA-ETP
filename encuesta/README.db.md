# Database and survey schema

This app uses Prisma with PostgreSQL. The survey is stored in a single table `SurveyResponse` with one row per submission. Key areas captured:

- Sociodemographic and academic info (edad, genero, anio_inicio, situacion_academica, etc.)
- Attitudes towards PSA and TCC (preferencia −3..3; conocimiento 1..5)
- Context-specific learning events per approach with frequencies (0..6) and emotional valence (1..5)
- Optional distribution of time across activities (teórico, formación, redes) for PSA, TCC, and OTRO
- Consent flag and raw payload stored as JSON for traceability

Commands:

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

Set `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` in your environment.
