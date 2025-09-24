import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SectionA = {
  edad?: number | string;
  genero?: string;
  generoOtro?: string;
  anioInicio?: number | string;
  situacion?: string;
  participacionDocencia?: boolean | string | number;
  participacionDetalle?: string;
  influenciaDocente?: boolean | string | number;
  influenciaMateria?: string;
  influenciaEnfoque?: string;
  contactoParesOpcion?: string;
  contactoParesOtro?: string;
  contactoPrevio?: boolean | string | number;
  contactoPrevioEnfoque?: string;
  materiasElectivas?: boolean | string | number;
  materiasElectivasDetalle?: string;
  enfoquesConocidos?: string;
  adscripcionTeorica?: boolean | string | number;
  adscripcionCual?: string;
  adscripcionCambio?: number | string;
};

type Enfoque = {
  preferencia?: number | null;
  conocimiento?: number | null;
};

type ContItem = {
  docentePos?: number | null;
  docenteNeg?: number | null;
  califAlta?: number | null;
  califBaja?: number | null;
  docentePosVal?: number | null;
  docenteNegVal?: number | null;
  califAltaVal?: number | null;
  califBajaVal?: number | null;
  obsDocentePos?: number | null;
  obsDocenteNeg?: number | null;
  obsDocentePosVal?: number | null;
  obsDocenteNegVal?: number | null;
  paresPos?: number | null;
  paresNeg?: number | null;
  paresPosVal?: number | null;
  paresNegVal?: number | null;
  obsParesPos?: number | null;
  obsParesNeg?: number | null;
  obsParesPosVal?: number | null;
  obsParesNegVal?: number | null;
  teoriaPos?: number | null;
  teoriaNeg?: number | null;
  teoricoClaro?: number | null;
  teoricoConfuso?: number | null;
  teoriaPosVal?: number | null;
  teoriaNegVal?: number | null;
  teoricoClaroVal?: number | null;
  teoricoConfusoVal?: number | null;
  clinicoPos?: number | null;
  clinicoNeg?: number | null;
  relatosPos?: number | null;
  relatosNeg?: number | null;
  clinicoPosVal?: number | null;
  clinicoNegVal?: number | null;
  relatosPosVal?: number | null;
  relatosNegVal?: number | null;
  familiaPos?: number | null;
  familiaNeg?: number | null;
  familiaPosVal?: number | null;
  familiaNegVal?: number | null;
};

type Actividades = {
  // Orden: 0=PSA, 1=TCC, 2=OTRO
  teorico?: [number | null, number | null, number | null];
  formacion?: [number | null, number | null, number | null];
  redes?: [number | null, number | null, number | null];
  noTeorico?: boolean | number | string;
  noFormacion?: boolean | number | string;
  noRedes?: boolean | number | string;
  otroLabel?: string;
};

type Payload = {
  sectionA?: SectionA;
  teoricos?: { enfoques?: Enfoque[] };
  contingencias?: { porEnfoque?: ContItem[] };
  actividades?: Actividades;
};

function toBool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'si' || s === 'sí' || s === 'true' || s === '1') return true;
    if (s === 'no' || s === 'false' || s === '0') return false;
  }
  if (typeof v === 'number') return v === 1;
  return null;
}

// Clamp frequency to new 0..4 scale (legacy 5/6 -> 4)
function clampFreq04(v: unknown): number | null {
  const n = Number(v as number);
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return 0;
  if (n >= 4) return 4; // also maps legacy 5/6 to 4
  return Math.max(0, Math.min(4, Math.round(n)));
}

export async function POST(req: Request) {
  try {
  const body: Payload & { consent?: boolean } = await req.json();

    const a = body.sectionA ?? {};
    const enfoques = body.teoricos?.enfoques ?? [];
    const cont = body.contingencias?.porEnfoque ?? [];
    const act = body.actividades ?? {};

  const data: Record<string, unknown> = {
    consent: typeof body.consent === 'boolean' ? body.consent : null,
    raw_payload: body ?? null,
      // A
      edad: a.edad ? Number(a.edad) : null,
      genero: a.genero || null,
      genero_otro: a.generoOtro || null,
      anio_inicio: a.anioInicio ? Number(a.anioInicio) : null,
      situacion_academica: a.situacion || null,
  // promedio eliminado
      participacion_docencia_occurrence: toBool(a.participacionDocencia),
      participacion_docencia_detalle: a.participacionDetalle || null,
      influencia_docente_occurrence: toBool(a.influenciaDocente),
      influencia_docente_materia: a.influenciaMateria || null,
      influencia_docente_enfoque: a.influenciaEnfoque || null,
  contacto_pares_opcion: a.contactoParesOpcion || null,
  contacto_pares_otro: a.contactoParesOtro || null,
      contacto_previo_occurrence: toBool(a.contactoPrevio),
      contacto_previo_enfoque: a.contactoPrevioEnfoque || null,
      materias_electivas_occurrence: toBool(a.materiasElectivas),
      materias_electivas_detalle: a.materiasElectivasDetalle || null,
      adscripcion_teorica_occurrence: toBool(a.adscripcionTeorica),
  adscripcion_teorica_cual: a.adscripcionCual || null,
  adscripcion_teorica_cambio: a.adscripcionCambio ? Number(a.adscripcionCambio) : null,
    };

    // Teóricos: asumimos index 0=PSA, 1=TCC
  const psa: Enfoque = enfoques[0] || {};
  const tcc: Enfoque = enfoques[1] || {};
    Object.assign(data, {
      psa_preferencia: psa.preferencia ?? null,
      psa_conocimiento: psa.conocimiento ?? null,
      tcc_preferencia: tcc.preferencia ?? null,
      tcc_conocimiento: tcc.conocimiento ?? null,
    });

    // Contingencias helper para copiar campos
  const copyCont = (prefix: 'psa' | 'tcc', c?: ContItem) => {
      if (!c) return;
      data[`${prefix}_docentePos_frequency`] = clampFreq04(c.docentePos);
      data[`${prefix}_docentePos_valence`] = c.docentePosVal ?? null;
      data[`${prefix}_docenteNeg_frequency`] = clampFreq04(c.docenteNeg);
      data[`${prefix}_docenteNeg_valence`] = c.docenteNegVal ?? null;
      data[`${prefix}_califAlta_frequency`] = clampFreq04(c.califAlta);
      data[`${prefix}_califAlta_valence`] = c.califAltaVal ?? null;
      data[`${prefix}_califBaja_frequency`] = clampFreq04(c.califBaja);
      data[`${prefix}_califBaja_valence`] = c.califBajaVal ?? null;
      data[`${prefix}_obsDocentePos_frequency`] = clampFreq04(c.obsDocentePos);
      data[`${prefix}_obsDocentePos_valence`] = c.obsDocentePosVal ?? null;
      data[`${prefix}_obsDocenteNeg_frequency`] = clampFreq04(c.obsDocenteNeg);
      data[`${prefix}_obsDocenteNeg_valence`] = c.obsDocenteNegVal ?? null;

      data[`${prefix}_paresPos_frequency`] = clampFreq04(c.paresPos);
      data[`${prefix}_paresPos_valence`] = c.paresPosVal ?? null;
      data[`${prefix}_paresNeg_frequency`] = clampFreq04(c.paresNeg);
      data[`${prefix}_paresNeg_valence`] = c.paresNegVal ?? null;
      data[`${prefix}_obsParesPos_frequency`] = clampFreq04(c.obsParesPos);
      data[`${prefix}_obsParesPos_valence`] = c.obsParesPosVal ?? null;
      data[`${prefix}_obsParesNeg_frequency`] = clampFreq04(c.obsParesNeg);
      data[`${prefix}_obsParesNeg_valence`] = c.obsParesNegVal ?? null;

      data[`${prefix}_teoriaPos_frequency`] = clampFreq04(c.teoriaPos);
      data[`${prefix}_teoriaPos_valence`] = c.teoriaPosVal ?? null;
      data[`${prefix}_teoriaNeg_frequency`] = clampFreq04(c.teoriaNeg);
      data[`${prefix}_teoriaNeg_valence`] = c.teoriaNegVal ?? null;
      data[`${prefix}_teoricoClaro_frequency`] = clampFreq04(c.teoricoClaro);
      data[`${prefix}_teoricoClaro_valence`] = c.teoricoClaroVal ?? null;
      data[`${prefix}_teoricoConfuso_frequency`] = clampFreq04(c.teoricoConfuso);
      data[`${prefix}_teoricoConfuso_valence`] = c.teoricoConfusoVal ?? null;

      data[`${prefix}_clinicoPos_frequency`] = clampFreq04(c.clinicoPos);
      data[`${prefix}_clinicoPos_valence`] = c.clinicoPosVal ?? null;
      data[`${prefix}_clinicoNeg_frequency`] = clampFreq04(c.clinicoNeg);
      data[`${prefix}_clinicoNeg_valence`] = c.clinicoNegVal ?? null;
      data[`${prefix}_relatosPos_frequency`] = clampFreq04(c.relatosPos);
      data[`${prefix}_relatosPos_valence`] = c.relatosPosVal ?? null;
      data[`${prefix}_relatosNeg_frequency`] = clampFreq04(c.relatosNeg);
      data[`${prefix}_relatosNeg_valence`] = c.relatosNegVal ?? null;

      data[`${prefix}_familiaPos_frequency`] = clampFreq04(c.familiaPos);
      data[`${prefix}_familiaPos_valence`] = c.familiaPosVal ?? null;
      data[`${prefix}_familiaNeg_frequency`] = clampFreq04(c.familiaNeg);
      data[`${prefix}_familiaNeg_valence`] = c.familiaNegVal ?? null;
    };

    copyCont('psa', cont[0]);
    copyCont('tcc', cont[1]);

  // Actividades (tríos [psa, tcc, otro])
    const clamp = (n: unknown) => {
      const v = Number(n as number);
      if (!Number.isFinite(v)) return null;
      return Math.max(0, Math.min(100, Math.round(v)));
    };
    if (Array.isArray(act.teorico)) {
      data.psa_teorico_percent = clamp(act.teorico[0]);
      data.tcc_teorico_percent = clamp(act.teorico[1]);
      data.otro_teorico_percent = clamp(act.teorico[2]);
    }
    if (Array.isArray(act.formacion)) {
      data.psa_formacion_percent = clamp(act.formacion[0]);
      data.tcc_formacion_percent = clamp(act.formacion[1]);
      data.otro_formacion_percent = clamp(act.formacion[2]);
    }
    if (Array.isArray(act.redes)) {
      data.psa_redes_percent = clamp(act.redes[0]);
      data.tcc_redes_percent = clamp(act.redes[1]);
      data.otro_redes_percent = clamp(act.redes[2]);
    }
    data.no_teorico = toBool(act.noTeorico);
    data.no_formacion = toBool(act.noFormacion);
    data.no_redes = toBool(act.noRedes);
    data.otro_label = act.otroLabel || null;

  // Narrowly cast just this property access to bypass missing type in build without using `any` directly
  const p = prisma as unknown as { surveyResponse: { create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }> } };
  const created = await p.surveyResponse.create({ data });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: unknown) {
    console.error('survey POST error', e);
    const message = (e as Error)?.message ?? 'unknown';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}