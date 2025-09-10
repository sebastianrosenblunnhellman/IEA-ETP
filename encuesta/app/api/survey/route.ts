import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Payload = any;

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

export async function POST(req: Request) {
  try {
    const body: Payload = await req.json();

    const a = body.sectionA ?? {};
    const enfoques = body.teoricos?.enfoques ?? [];
    const cont = body.contingencias?.porEnfoque ?? [];
    const act = body.actividades ?? {};

    const data: any = {
      // A
      edad: a.edad ? Number(a.edad) : null,
      genero: a.genero || null,
      genero_otro: a.generoOtro || null,
      anio_inicio: a.anioInicio ? Number(a.anioInicio) : null,
      situacion_academica: a.situacion || null,
      promedio: a.promedio ? Number(a.promedio) : null,
      participacion_docencia_occurrence: toBool(a.participacionDocencia),
      participacion_docencia_detalle: a.participacionDetalle || null,
      influencia_docente_occurrence: toBool(a.influenciaDocente),
      influencia_docente_materia: a.influenciaMateria || null,
      influencia_docente_enfoque: a.influenciaEnfoque || null,
      contacto_pares_text: a.contactoPares || null,
      contacto_previo_occurrence: toBool(a.contactoPrevio),
      contacto_previo_enfoque: a.contactoPrevioEnfoque || null,
      materias_electivas_occurrence: toBool(a.materiasElectivas),
      materias_electivas_detalle: a.materiasElectivasDetalle || null,
      enfoques_conocidos_list: a.enfoquesConocidos || null,
      adscripcion_teorica_occurrence: toBool(a.adscripcionTeorica),
      adscripcion_teorica_cual: a.adscripcionCual || null,
    };

    // Teóricos: asumimos index 0=PSA, 1=TCC
    const psa = enfoques[0] || {};
    const tcc = enfoques[1] || {};
    Object.assign(data, {
      psa_preferencia: psa.preferencia ?? null,
      psa_conocimiento: psa.conocimiento ?? null,
      tcc_preferencia: tcc.preferencia ?? null,
      tcc_conocimiento: tcc.conocimiento ?? null,
    });

    // Contingencias helper para copiar campos
    const copyCont = (prefix: 'psa' | 'tcc', c: any) => {
      if (!c) return;
      data[`${prefix}_docentePos_frequency`] = c.docentePos ?? null;
      data[`${prefix}_docenteNeg_frequency`] = c.docenteNeg ?? null;
      data[`${prefix}_califAlta_frequency`] = c.califAlta ?? null;
      data[`${prefix}_califAlta_valence`] = c.califAltaValencia ?? null;
      data[`${prefix}_califBaja_frequency`] = c.califBaja ?? null;
      data[`${prefix}_califBaja_valence`] = c.califBajaValencia ?? null;
      data[`${prefix}_obsDocentePos_frequency`] = c.obsDocentePos ?? null;
      data[`${prefix}_obsDocenteNeg_frequency`] = c.obsDocenteNeg ?? null;

      data[`${prefix}_paresPos_frequency`] = c.paresPos ?? null;
      data[`${prefix}_paresNeg_frequency`] = c.paresNeg ?? null;
      data[`${prefix}_obsParesPos_frequency`] = c.obsParesPos ?? null;
      data[`${prefix}_obsParesNeg_frequency`] = c.obsParesNeg ?? null;

      data[`${prefix}_teoriaPos_frequency`] = c.teoriaPos ?? null;
      data[`${prefix}_teoriaNeg_frequency`] = c.teoriaNeg ?? null;
      data[`${prefix}_teoricoClaro_frequency`] = c.teoricoClaro ?? null;
      data[`${prefix}_teoricoConfuso_frequency`] = c.teoricoConfuso ?? null;

      data[`${prefix}_clinicoPos_frequency`] = c.clinicoPos ?? null;
      data[`${prefix}_clinicoNeg_frequency`] = c.clinicoNeg ?? null;
      data[`${prefix}_relatosPos_frequency`] = c.relatosPos ?? null;
      data[`${prefix}_relatosNeg_frequency`] = c.relatosNeg ?? null;

      data[`${prefix}_familiaPos_frequency`] = c.familiaPos ?? null;
      data[`${prefix}_familiaNeg_frequency`] = c.familiaNeg ?? null;
    };

    copyCont('psa', cont[0]);
    copyCont('tcc', cont[1]);

    // Actividades (pares [psa, tcc])
    const clamp = (n: any) => {
      const v = Number(n);
      if (!Number.isFinite(v)) return null;
      return Math.max(0, Math.min(100, Math.round(v)));
    };
    if (Array.isArray(act.teorico)) {
      data.psa_teorico_percent = clamp(act.teorico[0]);
      data.tcc_teorico_percent = clamp(act.teorico[1]);
    }
    if (Array.isArray(act.formacion)) {
      data.psa_formacion_percent = clamp(act.formacion[0]);
      data.tcc_formacion_percent = clamp(act.formacion[1]);
    }
    if (Array.isArray(act.redes)) {
      data.psa_redes_percent = clamp(act.redes[0]);
      data.tcc_redes_percent = clamp(act.redes[1]);
    }

    const created = await prisma.surveyResponse.create({ data });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    console.error('survey POST error', e);
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}