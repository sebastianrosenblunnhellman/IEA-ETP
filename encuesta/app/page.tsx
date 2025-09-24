"use client";

import { useEffect, useMemo, useState } from "react";

type Genero = "Femenino" | "Masculino" | "Otro" | "";

type SituacionAcademica =
  | "CBC"
  | "Grado - Formación General"
  | "Grado - Formación Profesional"
  | "Etapa de finalización"
  | "Graduado/a (<3 años)"
  | "";

type SiNo = "Sí" | "No" | "";

type Enfoque = string; // texto libre por ahora
type ContactoParesOpcion = "psicoanalisis" | "tcc" | "otro" | "";

type SectionA = {
  edad: string;
  genero: Genero;
  generoOtro?: string;
  anioInicio: string;
  situacion: SituacionAcademica;
  participacionDocencia: SiNo;
  participacionDetalle?: string;
  influenciaDocente: SiNo;
  influenciaMateria?: string;
  influenciaEnfoque?: Enfoque;
  contactoParesOpcion?: ContactoParesOpcion;
  contactoParesOtro?: string;
  contactoPrevio: SiNo;
  contactoPrevioEnfoque?: Enfoque;
  materiasElectivas: SiNo;
  materiasElectivasDetalle?: string;
  // nuevas preguntas
  enfoquesConocidos?: string; // lista separada por comas
  adscripcionTeorica?: SiNo;
  adscripcionCual?: string;
  adscripcionCambio?: 1 | 2 | 3 | 4 | 5;
};

type ContItem = {
  docentePos?: number;
  docenteNeg?: number;
  califAlta?: number;
  califBaja?: number;
  obsDocentePos?: number;
  obsDocenteNeg?: number;
  paresPos?: number;
  paresNeg?: number;
  obsParesPos?: number;
  obsParesNeg?: number;
  teoriaPos?: number;
  teoriaNeg?: number;
  teoricoClaro?: number;
  teoricoConfuso?: number;
  clinicoPos?: number;
  clinicoNeg?: number;
  relatosPos?: number;
  relatosNeg?: number;
  familiaPos?: number;
  familiaNeg?: number;
  // Valencia 5 puntos (1..5) para cada ítem, solo aplica cuando frecuencia > 0
  docentePosVal?: 1 | 2 | 3 | 4 | 5;
  docenteNegVal?: 1 | 2 | 3 | 4 | 5;
  califAltaVal?: 1 | 2 | 3 | 4 | 5;
  califBajaVal?: 1 | 2 | 3 | 4 | 5;
  obsDocentePosVal?: 1 | 2 | 3 | 4 | 5;
  obsDocenteNegVal?: 1 | 2 | 3 | 4 | 5;
  paresPosVal?: 1 | 2 | 3 | 4 | 5;
  paresNegVal?: 1 | 2 | 3 | 4 | 5;
  obsParesPosVal?: 1 | 2 | 3 | 4 | 5;
  obsParesNegVal?: 1 | 2 | 3 | 4 | 5;
  teoriaPosVal?: 1 | 2 | 3 | 4 | 5;
  teoriaNegVal?: 1 | 2 | 3 | 4 | 5;
  teoricoClaroVal?: 1 | 2 | 3 | 4 | 5;
  teoricoConfusoVal?: 1 | 2 | 3 | 4 | 5;
  clinicoPosVal?: 1 | 2 | 3 | 4 | 5;
  clinicoNegVal?: 1 | 2 | 3 | 4 | 5;
  relatosPosVal?: 1 | 2 | 3 | 4 | 5;
  relatosNegVal?: 1 | 2 | 3 | 4 | 5;
  familiaPosVal?: 1 | 2 | 3 | 4 | 5;
  familiaNegVal?: 1 | 2 | 3 | 4 | 5;
};

// Claves numéricas de frecuencia (todas requieren valencia 5 puntos cuando frecuencia > 0)
type NumericContKey =
  | "docentePos"
  | "docenteNeg"
  | "califAlta"
  | "califBaja"
  | "obsDocentePos"
  | "obsDocenteNeg"
  | "paresPos"
  | "paresNeg"
  | "obsParesPos"
  | "obsParesNeg"
  | "teoriaPos"
  | "teoriaNeg"
  | "teoricoClaro"
  | "teoricoConfuso"
  | "clinicoPos"
  | "clinicoNeg"
  | "relatosPos"
  | "relatosNeg"
  | "familiaPos"
  | "familiaNeg";

type SurveyState = {
  step: number; // 0=Intro, 1=Sección A, ...
  consent?: boolean;
  sectionA: SectionA;
  teoricos: {
    enfoques: {
      nombre: string;
      preferencia?: number; // -3..3
      conocimiento?: number; // 1..5
    }[];
  };
  contingencias: {
    // Se guarda por índice de enfoque (0..4)
  porEnfoque: Array<ContItem>;
  };
  actividades: {
    teorico: [number, number, number];
    formacion: [number, number, number];
    redes: [number, number, number];
    noTeorico?: boolean;
    noFormacion?: boolean;
    noRedes?: boolean;
    otroLabel?: string;
  };
};

const emptyA: SectionA = {
  edad: "",
  genero: "",
  anioInicio: "",
  situacion: "",
  participacionDocencia: "",
  influenciaDocente: "",
  contactoParesOpcion: "",
  contactoParesOtro: "",
  contactoPrevio: "",
  materiasElectivas: "",
  enfoquesConocidos: "",
  adscripcionTeorica: "",
  adscripcionCual: "",
  adscripcionCambio: undefined,
};

export default function Home() {
  const [state, setState] = useState<SurveyState>({
    step: 0,
  consent: false,
    sectionA: emptyA,
    teoricos: {
      enfoques: [
        { nombre: "Psicoanálisis (Freudiano, Lacaniano y otros)" },
    { nombre: "Terapia Cognitivo Conductual (conductual, cognitivo o contextual)" },
      ],
    },
  contingencias: { porEnfoque: Array.from({ length: 2 }, () => ({})) },
  actividades: { teorico: [0, 0, 0], formacion: [0, 0, 0], redes: [0, 0, 0], noTeorico: false, noFormacion: false, noRedes: false, otroLabel: "" },
  });

  // Envío al backend
  const submitSurvey = async () => {
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: state.consent,
          sectionA: state.sectionA,
          teoricos: state.teoricos,
          contingencias: state.contingencias,
          actividades: state.actividades,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const json = await res.json();
      if (json?.ok) setState((s) => ({ ...s, step: 5 }));
    } catch {
      alert('Hubo un problema al enviar la encuesta. Intente nuevamente.');
    }
  };

  // Persistencia local (no sensible, anónimo)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("encuesta-psico-state");
      if (raw) {
        const parsed = JSON.parse(raw) as SurveyState;
        setState((prev) => ({
          step: parsed.step ?? 0,
          consent: Boolean(parsed.consent),
          sectionA: { ...emptyA, ...(parsed.sectionA || {}) },
          teoricos: {
            enfoques: [
              {
                nombre: "Psicoanálisis (Freudiano, Lacaniano y otros)",
                preferencia: parsed.teoricos?.enfoques?.[0]?.preferencia,
                conocimiento: parsed.teoricos?.enfoques?.[0]?.conocimiento,
              },
              {
        nombre: "Terapia Cognitivo Conductual (conductual, cognitivo o contextual)",
                preferencia: parsed.teoricos?.enfoques?.[1]?.preferencia,
                conocimiento: parsed.teoricos?.enfoques?.[1]?.conocimiento,
              },
            ],
          },
          contingencias: {
            porEnfoque:
              parsed.contingencias?.porEnfoque?.length
                ? [...Array(2)].map((_, i) => parsed.contingencias!.porEnfoque[i] || {})
                : prev.contingencias.porEnfoque,
          },
          actividades: {
            teorico: normalizeTriple(parsed.actividades?.teorico, [0, 0, 0]),
            formacion: normalizeTriple(parsed.actividades?.formacion, [0, 0, 0]),
            redes: normalizeTriple(parsed.actividades?.redes, [0, 0, 0]),
          },
        }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("encuesta-psico-state", JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const next = () => setState((s) => ({ ...s, step: s.step + 1 }));
  const back = () => setState((s) => ({ ...s, step: Math.max(0, s.step - 1) }));

  const updateA = <K extends keyof SectionA>(key: K, value: SectionA[K]) => {
    setState((s) => ({ ...s, sectionA: { ...s.sectionA, [key]: value } }));
  };

  // Actualizadores Sección Teóricos

  const updatePreferencia = (index: number, preferencia: number) => {
    setState((s) => {
      const enfoques = s.teoricos.enfoques.map((e, i) => (i === index ? { ...e, preferencia } : e));
      return { ...s, teoricos: { enfoques } };
    });
  };

  const updateConocimiento = (index: number, conocimiento: number) => {
    setState((s) => {
      const enfoques = s.teoricos.enfoques.map((e, i) => (i === index ? { ...e, conocimiento } : e));
      return { ...s, teoricos: { enfoques } };
    });
  };

  // Validaciones mínimas para avanzar desde Sección A
  const canContinueA = useMemo(() => {
    const a = state.sectionA;
    if (!a.edad || !a.genero || !a.anioInicio || !a.situacion) return false;
    if (a.genero === "Otro" && !a.generoOtro) return false;
    if (a.participacionDocencia === "Sí" && !a.participacionDetalle) return false;
    if (a.influenciaDocente === "Sí" && (!a.influenciaMateria || !a.influenciaEnfoque)) return false;
    if (a.contactoPrevio === "Sí" && !a.contactoPrevioEnfoque) return false;
    if (a.materiasElectivas === "Sí" && !a.materiasElectivasDetalle) return false;
  if (a.adscripcionTeorica === "Sí" && !(a.adscripcionCual && a.adscripcionCual.trim())) return false;
    return true;
  }, [state.sectionA]);

  // Validación Sección Teóricos
  const canContinueTeoricos = useMemo(() => {
    const list = state.teoricos.enfoques.filter((e) => e.nombre && e.nombre.trim().length > 0);
    if (list.length < 1) return false;
    for (const e of list) {
      const prefOk = typeof e.preferencia === "number" && e.preferencia >= -3 && e.preferencia <= 3;
      const conOk = typeof e.conocimiento === "number" && e.conocimiento >= 1 && e.conocimiento <= 5;
      if (!prefOk || !conOk) return false;
    }
    return true;
  }, [state.teoricos.enfoques]);

  // Validación Sección Contingencias: solo para enfoques con conocimiento >= 2 (Familiaridad+)
  const canContinueContingencias = useMemo(() => {
    const indices = state.teoricos.enfoques
      .map((e, i) => ({ i, e }))
      .filter(({ e }) => (e.nombre || "").trim() && (e.conocimiento || 0) >= 2)
      .map(({ i }) => i);
    // Si no hay enfoques incluidos, no se exige esta sección
    if (indices.length === 0) return true;
    const numericKeys: NumericContKey[] = [
      "docentePos",
      "docenteNeg",
      "califAlta",
      "califBaja",
      "obsDocentePos",
      "obsDocenteNeg",
      "paresPos",
      "paresNeg",
      "obsParesPos",
      "obsParesNeg",
      "teoriaPos",
      "teoriaNeg",
      "teoricoClaro",
      "teoricoConfuso",
      "clinicoPos",
      "clinicoNeg",
      "relatosPos",
      "relatosNeg",
      "familiaPos",
      "familiaNeg",
    ];
    const valenceKeyMap: Record<NumericContKey, keyof ContItem> = {
      docentePos: "docentePosVal",
      docenteNeg: "docenteNegVal",
      califAlta: "califAltaVal",
      califBaja: "califBajaVal",
      obsDocentePos: "obsDocentePosVal",
      obsDocenteNeg: "obsDocenteNegVal",
      paresPos: "paresPosVal",
      paresNeg: "paresNegVal",
      obsParesPos: "obsParesPosVal",
      obsParesNeg: "obsParesNegVal",
      teoriaPos: "teoriaPosVal",
      teoriaNeg: "teoriaNegVal",
      teoricoClaro: "teoricoClaroVal",
      teoricoConfuso: "teoricoConfusoVal",
      clinicoPos: "clinicoPosVal",
      clinicoNeg: "clinicoNegVal",
      relatosPos: "relatosPosVal",
      relatosNeg: "relatosNegVal",
      familiaPos: "familiaPosVal",
      familiaNeg: "familiaNegVal",
    } as const;
    for (const i of indices) {
      const c = state.contingencias.porEnfoque[i] || {};
      for (const k of numericKeys) {
        const v = c[k as keyof ContItem] as unknown as number | undefined;
        if (typeof v !== "number" || v < 0 || v > 4) return false;
        // Si la frecuencia es > 0, exigir valencia 1..5
        if (v > 0) {
          const vk = valenceKeyMap[k];
          const vv = c[vk] as unknown as number | undefined;
          if (typeof vv !== "number" || vv < 1 || vv > 5) return false;
        }
      }
    }
    return true;
  }, [state.contingencias.porEnfoque, state.teoricos.enfoques]);

  const stepLabels = [
    "Introducción",
    "Sociodemográfico",
    "Actitudes",
    "Aprendizaje",
    "Actividades",
  ];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="mx-auto w-full max-w-4xl">
        <StepHeader current={state.step} labels={stepLabels} />
        <div className="mt-4">
          {state.step === 0 ? (
            <Card>
              <Intro
                consent={!!state.consent}
                onConsentChange={(v: boolean) => setState((s) => ({ ...s, consent: v }))}
                onNext={next}
              />
            </Card>
          ) : state.step === 1 ? (
            <Card>
              <SectionAForm
                data={state.sectionA}
                onChange={updateA}
                onBack={back}
                onNext={next}
                canContinue={canContinueA}
              />
            </Card>
          ) : state.step === 2 ? (
            <Card>
              <SectionTeoricos
                enfoques={state.teoricos.enfoques}
                onChangePreferencia={updatePreferencia}
                onChangeConocimiento={updateConocimiento}
                onBack={back}
                onNext={next}
                canContinue={canContinueTeoricos}
              />
            </Card>
          ) : state.step === 3 ? (
            <Card>
              <SectionContingencias
                enfoques={state.teoricos.enfoques}
                data={state.contingencias.porEnfoque}
                onChange={(idx: number, changes: Partial<ContItem>) =>
                  setState((s) => {
                    const arr = s.contingencias.porEnfoque.slice();
                    arr[idx] = { ...arr[idx], ...changes };
                    return { ...s, contingencias: { porEnfoque: arr } };
                  })
                }
                onBack={back}
                onNext={next}
                canContinue={canContinueContingencias}
              />
            </Card>
          ) : (
            <Card>
              {state.step === 4 ? (
                <SectionActividades
                  data={state.actividades}
                  onChange={(cat: "teorico" | "formacion" | "redes", idx: 0 | 1 | 2, value: number) =>
                    setState((s) => {
                      const next: SurveyState["actividades"] = { ...s.actividades };
                      const apply = (arr: [number, number, number]) => {
                        const triple: [number, number, number] = [...arr];
                        triple[idx] = clampPercent(value);
                        return triple;
                      };
                      switch (cat) {
                        case 'teorico':
                          next.teorico = apply(next.teorico);
                          break;
                        case 'formacion':
                          next.formacion = apply(next.formacion);
                          break;
                        case 'redes':
                          next.redes = apply(next.redes);
                          break;
                      }
                      return { ...s, actividades: next };
                    })
                  }
                  onToggleNone={(cat: "teorico" | "formacion" | "redes", none: boolean) =>
                    setState((s) => {
                      const next: SurveyState["actividades"] = { ...s.actividades };
                      switch (cat) {
                        case 'teorico':
                          next.noTeorico = none;
                          if (none) next.teorico = [0, 0, 0];
                          break;
                        case 'formacion':
                          next.noFormacion = none;
                          if (none) next.formacion = [0, 0, 0];
                          break;
                        case 'redes':
                          next.noRedes = none;
                          if (none) next.redes = [0, 0, 0];
                          break;
                      }
                      return { ...s, actividades: next };
                    })
                  }
                  onChangeOtroLabel={(label: string) =>
                    setState((s) => ({ ...s, actividades: { ...s.actividades, otroLabel: label } }))
                  }
                  onBack={back}
                  onSubmit={submitSurvey}
                />
              ) : (
                <ThankYou />
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function clampPercent(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

function normalizeTriple(arr: unknown, fallback: [number, number, number]): [number, number, number] {
  if (Array.isArray(arr) && arr.length === 3) {
    const a = Number(arr[0]);
    const b = Number(arr[1]);
    const c = Number(arr[2]);
    return [Number.isFinite(a) ? a : 0, Number.isFinite(b) ? b : 0, Number.isFinite(c) ? c : 0];
  }
  return fallback;
}

function Intro({ onNext, consent, onConsentChange }: { onNext: () => void; consent: boolean; onConsentChange: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
      <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">HISTORIA DE APRENDIZAJE COMO PREDICTOR DE LAS ACTITUDES HACIA LOS ENFOQUES TEÓRICOS EN PSICOLOGÍA</h1>
      <p className="text-sm text-neutral-600">
        Sebastian Rosenblunn Helman, Universidad de Buenos Aires<br />
        Thomas Balaceda, Universidad de Buenos Aires
      </p>
      </header>

      <section className="bg-white rounded-lg p-4 sm:p-5 border border-neutral-200 space-y-2">
        <h2 className="font-medium">Introducción al participante</h2>
        <p className="text-sm leading-6 text-neutral-700">
          Estimado/a participante, le agradecemos su interés en colaborar con esta investigación. El objetivo del
          estudio es comprender mejor los factores contextuales y las experiencias formativas que influyen en la afinidad
          de los estudiantes de Psicología hacia diferentes enfoques teóricos. Su participación es voluntaria y anónima.
          Los datos recolectados serán utilizados únicamente con fines de investigación, garantizando la confidencialidad
          de sus respuestas.
        </p>
      </section>

      {/* Consentimiento informado */}
      <section className="bg-white rounded-lg p-4 sm:p-5 border border-neutral-200">
        <label className="inline-flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-neutral-900"
            checked={!!consent}
            onChange={(e) => onConsentChange(e.target.checked)}
          />
          <span>
            Declaro haber leído el consentimiento informado y acepto participar de manera voluntaria. <span className="text-red-600">*</span>
          </span>
        </label>
      </section>

      <div className="flex justify-end">
        <button
          className="inline-flex items-center gap-2 rounded-md bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800"
          onClick={onNext}
          disabled={!consent}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium mb-1">
      {children} {required && <span className="text-red-600">*</span>}
    </label>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
  className={`w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 ${className}`}
    />
  );
}

function TextArea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
  className={`w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 ${className}`}
    />
  );
}

function Radio({ label, name, value, checked, onChange }: {
  label: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
  className="h-4 w-4 accent-neutral-800"
      />
      {label}
    </label>
  );
}

function SectionAForm({
  data,
  onChange,
  onBack,
  onNext,
  canContinue,
}: {
  data: SectionA;
  onChange: <K extends keyof SectionA>(key: K, value: SectionA[K]) => void;
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <header className="mb-2">
        <h2 className="text-xl font-semibold text-neutral-900">Información Sociodemográfica y Académica</h2>
      </header>


      {/* 1. Edad */}
    <div>
        <FieldLabel required>1. Edad</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={15}
            max={100}
            inputMode="numeric"
            value={data.edad}
            onChange={(e) => onChange("edad", e.target.value)}
            placeholder="______"
            className="max-w-28"
          />
      <span className="text-sm text-neutral-600">años</span>
        </div>
      </div>

      {/* 2. Género */}
      <div>
        <FieldLabel required>2. Género / Identidad de género</FieldLabel>
        <div className="flex flex-wrap gap-4">
          {(["Femenino", "Masculino", "Otro"] as Genero[]).map(
            (g) => (
              <Radio
                key={g}
                name="genero"
                label={g}
                value={g}
                checked={data.genero === g}
                onChange={(e) => {
                  onChange("genero", e.target.value as Genero);
                  if ((e.target.value as Genero) !== "Otro") onChange("generoOtro", "");
                }}
              />
            )
          )}
        </div>
        {data.genero === "Otro" && (
          <div className="mt-2">
            <Input
              placeholder="Especifique"
              value={data.generoOtro || ""}
              onChange={(e) => onChange("generoOtro", e.target.value)}
            />
          </div>
        )}
      </div>

      {/* 3. Año de inicio */}
      <div>
  <FieldLabel required>3. Año en que inició la carrera de Psicología</FieldLabel>
        <Input
          type="number"
          min={1990}
          max={new Date().getFullYear()}
          value={data.anioInicio}
          onChange={(e) => onChange("anioInicio", e.target.value)}
          placeholder="YYYY"
          className="max-w-32"
        />
      </div>

      {/* 4. Situación académica */}
      <div>
        <FieldLabel required>4. Situación académica actual</FieldLabel>
  <div className="grid gap-2">
          {(
            [
              "CBC",
              "Grado - Formación General",
              "Grado - Formación Profesional",
              "Etapa de finalización",
              "Graduado/a (<3 años)",
            ] as SituacionAcademica[]
          ).map((s) => (
            <Radio
              key={s}
              name="situacion"
              label={s}
              value={s}
              checked={data.situacion === s}
              onChange={(e) => onChange("situacion", e.target.value as SituacionAcademica)}
            />
          ))}
        </div>
      </div>

      {/* 5. Participación en docencia/investigación */}

  {/* 6. Influencia docente */}
      <div>
        <FieldLabel required>
          5. Participación en docencia o investigación (ayudantías / proyectos)
        </FieldLabel>
        <div className="flex gap-6">
          {(["Sí", "No"] as SiNo[]).map((v) => (
            <Radio
              key={v}
              name="participacionDocencia"
              label={v}
              value={v}
              checked={data.participacionDocencia === v}
              onChange={(e) => onChange("participacionDocencia", e.target.value as SiNo)}
            />
          ))}
        </div>
        {data.participacionDocencia === "Sí" && (
          <div className="mt-2">
            <Input
              placeholder="Materia o nombre del proyecto"
              value={data.participacionDetalle || ""}
              onChange={(e) => onChange("participacionDetalle", e.target.value)}
            />
          </div>
        )}
      </div>

  {/* 6. Influencia docente */}
      <div>
        <FieldLabel required>6. Influencia docente</FieldLabel>
  <p className="text-sm text-neutral-600 mb-2">
          ¿Hubo algún/a docente, tutor/a o supervisor/a particularmente influyente?
        </p>
        <div className="flex gap-6">
          {(["Sí", "No"] as SiNo[]).map((v) => (
            <Radio
              key={v}
              name="influenciaDocente"
              label={v}
              value={v}
              checked={data.influenciaDocente === v}
              onChange={(e) => onChange("influenciaDocente", e.target.value as SiNo)}
            />
          ))}
        </div>
        {data.influenciaDocente === "Sí" && (
          <div className="mt-2 grid gap-2">
            <Input
              placeholder="Materia / Área"
              value={data.influenciaMateria || ""}
              onChange={(e) => onChange("influenciaMateria", e.target.value)}
            />
            <Input
              placeholder="Enfoque teórico percibido"
              value={data.influenciaEnfoque || ""}
              onChange={(e) => onChange("influenciaEnfoque", e.target.value)}
            />
          </div>
        )}
      </div>

  {/* 7. Contacto con pares */}
      <div>
        <FieldLabel>7. Contacto con pares</FieldLabel>
        <p className="text-sm text-neutral-600 mb-2">
          Piense en su círculo cercano de amigos/as de la facultad. Señale a qué enfoque pertenecen mayoritariamente.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-6">
            <Radio
              name="contactoPares"
              label="Psicoanálisis"
              value="psicoanalisis"
              checked={data.contactoParesOpcion === "psicoanalisis"}
              onChange={(e) => onChange("contactoParesOpcion", e.target.value as ContactoParesOpcion)}
            />
            <Radio
              name="contactoPares"
              label="Terapia Cognitivo-Conductual"
              value="tcc"
              checked={data.contactoParesOpcion === "tcc"}
              onChange={(e) => onChange("contactoParesOpcion", e.target.value as ContactoParesOpcion)}
            />
            <Radio
              name="contactoPares"
              label="Otro"
              value="otro"
              checked={data.contactoParesOpcion === "otro"}
              onChange={(e) => onChange("contactoParesOpcion", e.target.value as ContactoParesOpcion)}
            />
          </div>
          {data.contactoParesOpcion === "otro" && (
            <Input
              placeholder="Especifique (opcional)"
              value={data.contactoParesOtro || ""}
              onChange={(e) => onChange("contactoParesOtro", e.target.value)}
              className="max-w-sm"
            />
          )}
        </div>
      </div>

  {/* 8. Contacto previo con psicología */}
      <div>
        <FieldLabel required>8. Contacto previo con psicología antes de la carrera</FieldLabel>
  <p className="text-sm text-neutral-600 mb-2">
          ¿Tuvo un contacto significativo (familiares, amigos/as, como paciente, influencers, etc.) que influyera en su visión inicial?
        </p>
        <div className="flex gap-6">
          {(["Sí", "No"] as SiNo[]).map((v) => (
            <Radio
              key={v}
              name="contactoPrevio"
              label={v}
              value={v}
              checked={data.contactoPrevio === v}
              onChange={(e) => onChange("contactoPrevio", e.target.value as SiNo)}
            />
          ))}
        </div>
        {data.contactoPrevio === "Sí" && (
          <div className="mt-2">
            <Input
              placeholder="Enfoque teórico principal del contacto previo"
              value={data.contactoPrevioEnfoque || ""}
              onChange={(e) => onChange("contactoPrevioEnfoque", e.target.value)}
            />
          </div>
        )}
      </div>

  {/* 9. Materias electivas */}
      <div>
        <FieldLabel required>9. Materias electivas</FieldLabel>
        <div className="flex gap-6">
          {(["Sí", "No"] as SiNo[]).map((v) => (
            <Radio
              key={v}
              name="materiasElectivas"
              label={v}
              value={v}
              checked={data.materiasElectivas === v}
              onChange={(e) => onChange("materiasElectivas", e.target.value as SiNo)}
            />
          ))}
        </div>
        {data.materiasElectivas === "Sí" && (
          <div className="mt-2">
            <TextArea
              rows={2}
              placeholder="Indique cuáles"
              value={data.materiasElectivasDetalle || ""}
              onChange={(e) => onChange("materiasElectivasDetalle", e.target.value)}
            />
          </div>
        )}
      </div>

  {/* (La pregunta original 11 sobre conocimiento general de enfoques fue eliminada) */}

  {/* 10. Adscripción teórica personal */}
      <div>
  <FieldLabel>10. Adscripción teórica personal</FieldLabel>
        <p className="text-sm text-neutral-600 mb-2">¿Considera usted que adscribe a un determinado enfoque teórico?</p>
        <div className="flex gap-6">
          {(["Sí", "No"] as SiNo[]).map((v) => (
            <Radio
              key={v}
              name="adscripcionTeorica"
              label={v}
              value={v}
              checked={data.adscripcionTeorica === v}
              onChange={(e) => onChange("adscripcionTeorica", e.target.value as SiNo)}
            />
          ))}
        </div>
        {data.adscripcionTeorica === "Sí" && (
          <div className="mt-2">
            <Input
              placeholder='Si respondió "Sí", indique cuál'
              value={data.adscripcionCual || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange("adscripcionCual", e.target.value)
              }
            />
            {data.adscripcionCual && data.adscripcionCual.trim() && (
              <div className="mt-3">
                <div className="text-sm mb-1">¿Qué tan probable es que cambie de posición?</div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {([1,2,3,4,5] as const).map((n) => (
                    <label key={n} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="adscripcionCambio"
                        value={n}
                        checked={data.adscripcionCambio === n}
                        onChange={() => onChange("adscripcionCambio", n)}
                        className="h-4 w-4"
                      />
                      {n === 1
                        ? "Nada probable"
                        : n === 2
                        ? "Improbable"
                        : n === 3
                        ? "Ni probable ni improbable"
                        : n === 4
                        ? "Probable"
                        : n === 5
                        ? "Muy probable"
                        : `Probabilidad ${n}`}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    <div className="flex items-center justify-between pt-2">
        <button
          type="button"
      className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
          onClick={onBack}
        >
          Anterior
        </button>
        <button
          type="submit"
          disabled={!canContinue}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
}

function SectionTeoricos({
  enfoques,
  onChangePreferencia,
  onChangeConocimiento,
  onBack,
  onNext,
  canContinue,
}: {
  enfoques: { nombre: string; preferencia?: number; conocimiento?: number }[];
  onChangePreferencia: (index: number, preferencia: number) => void;
  onChangeConocimiento: (index: number, conocimiento: number) => void;
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  const filled = enfoques.map((e, i) => ({ e, i, nombre: e.nombre.trim() }));
  const prefScale = [-3, -2, -1, 0, 1, 2, 3];
  const knowledgeScale = [1, 2, 3, 4, 5];
  const short = (i: number) => (i === 0 ? "PSA" : "TCC");

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Actitudes Hacia Enfoques Teóricos.</h2>
      </header>

      {/* Enfoques a evaluar */}
      <section className="space-y-3">
        <h3 className="font-medium">Enfoques a evaluar</h3>
        <p className="text-sm text-neutral-600">
          A continuación aclaramos que las siguientes preguntas serán en referencia al Psicoanálisis (PSA) y Terapia Cognitivo Conductual (TCC) en un sentido amplio, tal y como se refiere a continuación.
        </p>
        <ul className="list-disc list-inside text-sm">
          <li>Psicoanálisis = Freudiano, Lacaniano y otros</li>
          <li>Terapia Cognitivo Conductual = conductual, cognitivo o contextual</li>
        </ul>
      </section>

      {/* Preferencia de uso (preguntas separadas) */}
      <section className="space-y-3">
        <h3 className="font-medium">Preferencia de uso</h3>
    <div className="space-y-4">
      {filled.map(({ i }) => (
            <div key={`pref-block-${i}`} className="border rounded-lg p-3 bg-white">
              <div className="text-sm mb-2">
        Preferiría utilizar <strong>{short(i)}</strong> en comparación con otros enfoques teóricos.
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {prefScale.map((n) => (
                  <label key={n} className="inline-flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name={`pref-${i}`}
                      value={n}
          checked={enfoques[i]?.preferencia === n}
                      onChange={() => onChangePreferencia(i, n)}
                      className="h-4 w-4"
                    />
                    {n > 0 ? `+${n}` : n}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nivel de conocimiento */}
      <section className="space-y-3">
        <h3 className="font-medium">Nivel de conocimiento declarado</h3>
        <div className="text-sm text-neutral-700">
          Use la siguiente escala:
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>
              <strong>1 — Reconocimiento</strong> (He escuchado sobre él, pero no podría explicarlo)
            </li>
            <li>
              <strong>2 — Familiaridad</strong> (Tengo una comprensión general de sus fundamentos)
            </li>
            <li>
              <strong>3 — Intermedio</strong> (Puedo explicar sus conceptos y técnicas principales)
            </li>
            <li>
              <strong>4 — Avanzado</strong> (Tengo conocimiento profundo y puedo aplicarlo)
            </li>
            <li>
              <strong>5 — Experto</strong> (Domino el enfoque a nivel de enseñarlo o supervisar)
            </li>
          </ul>
        </div>
        {filled.length === 0 ? (
          <p className="text-sm text-neutral-500">Complete al menos un enfoque para evaluar su conocimiento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Enfoque</th>
                  {knowledgeScale.map((n) => (
                    <th key={n} className="p-2 text-center font-normal text-gray-600">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filled.map(({ i }) => (
                  <tr key={`row-${i}`} className="border-t">
          <td className="p-2 pr-4 align-middle"><strong>{short(i)}</strong></td>
                    {knowledgeScale.map((n) => (
                      <td key={n} className="p-2 text-center">
                        <input
                          type="radio"
                          name={`know-${i}`}
                          value={n}
                          checked={enfoques[i]?.conocimiento === n}
                          onChange={() => onChangeConocimiento(i, n)}
                          className="h-4 w-4"
                          aria-label={`Conocimiento ${n}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between pt-2">
        <button type="button" className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50" onClick={onBack}>
          Anterior
        </button>
        <button
          type="submit"
          disabled={!canContinue}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
}

function SectionContingencias({
  enfoques,
  data,
  onChange,
  onBack,
  onNext,
  canContinue,
}: {
  enfoques: { nombre: string; preferencia?: number; conocimiento?: number }[];
  data: ContItem[];
  onChange: (idx: number, changes: Partial<ContItem>) => void;
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  const includeIdx = enfoques
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => (e.nombre || "").trim() && (e.conocimiento || 0) >= 2)
    .map(({ i }) => i);

  // Semilla por sesión para orden aleatorio estable dentro de la vista
  const [sessionSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));

  const FrequencySelect = ({
    value,
    onChange,
    label,
  }: {
    value?: number;
    onChange: (n: number) => void;
    label?: string;
  }) => (
    <select
      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      value={typeof value === "number" ? Math.max(0, Math.min(4, value)) : ""}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="" disabled>
        {label || "Seleccione"}
      </option>
      <option value={0}>0 Nunca: no me pasó.</option>
      <option value={1}>1 Raramente / Alguna vez: me pasó en muy pocas ocasiones, de forma aislada.</option>
      <option value={2}>2 A veces: me pasa de vez en cuando, pero no es lo más común.</option>
      <option value={3}>3 Frecuentemente: me pasa seguido, con bastante regularidad.</option>
      <option value={4}>4 Casi siempre: me pasa la gran mayoría de las veces.</option>
    </select>
  );

  const ValenciaRadios5 = ({
    value,
    onChange,
    name,
  }: {
    value?: 1 | 2 | 3 | 4 | 5;
    onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
    name: string;
  }) => (
    <div className="flex flex-wrap gap-4">
      {([
        { v: 5 as const, lbl: "muy positivos" },
        { v: 4 as const, lbl: "positivos" },
        { v: 3 as const, lbl: "neutros" },
        { v: 2 as const, lbl: "negativos" },
        { v: 1 as const, lbl: "muy negativos" },
      ]).map(({ v, lbl }) => (
        <label key={v} className="inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="h-4 w-4"
          />
          {lbl}
        </label>
      ))}
    </div>
  );

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <header className="space-y-3">
        <h2 className="text-xl font-semibold">Aprendizaje en Contextos Específicos</h2>
        <div className="rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-800 space-y-2">
          <p><strong>Instrucciones:</strong> Para cada enfoque teórico, por favor, indica la frecuencia con la que has experimentado cada una de las siguientes situaciones. Usa la siguiente escala de ocurrencia:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>0 — Nunca:</strong> no me pasó.</li>
            <li><strong>1 — Raramente / Alguna vez:</strong> me pasó en muy pocas ocasiones, de forma aislada.</li>
            <li><strong>2 — A veces:</strong> me pasa de vez en cuando, pero no es lo más común.</li>
            <li><strong>3 — Frecuentemente:</strong> me pasa seguido, con bastante regularidad.</li>
            <li><strong>4 — Casi siempre:</strong> me pasa la gran mayoría de las veces.</li>
          </ul>
          <p>Si alguno de estos eventos ocurrió (frecuencia &gt; 0), se te preguntará por el <em>valor emocional</em> que representó (muy positivos, positivos, neutros, negativos o muy negativos).</p>
        </div>
      </header>

      {includeIdx.length === 0 ? (
  <p className="text-sm text-neutral-500">
          Esta sección no aplica si no indicó familiaridad con al menos un enfoque.
        </p>
      ) : (
        <div className="space-y-8">
          {(() => {
              const contexts: {
                id: string;
                title: string;
                items: { key: NumericContKey; label: string; needsValence?: boolean }[];
              }[] = [
              {
                id: "docentes",
                title: "Contexto Académico - Docentes",
                items: [
                  { key: "docentePos", label: `Al hablar, preguntar o comentar, sobre el enfoque [X] en clase, la respuesta del docente fue amigable y estimulante.` },
                  { key: "docenteNeg", label: `Al hablar, preguntar o comentar, sobre el enfoque [X] en clase, la respuesta del docente fue de hostilidad o desinterés.` },
                  { key: "califAlta", label: `Recibí una calificación alta en un trabajo donde utilicé conceptos del enfoque [X].`, needsValence: true },
                  { key: "califBaja", label: `Recibí una calificación baja o una corrección negativa en un trabajo donde utilicé conceptos del enfoque [X].`, needsValence: true },
                  { key: "obsDocentePos", label: `Observé a un docente elogiar o presentar de forma favorable el enfoque [X].` },
                  { key: "obsDocenteNeg", label: `Observé a un docente criticar o presentar de forma desfavorable el enfoque [X].` },
                ],
              },
              {
                id: "pares",
                title: "Contexto Académico - Pares",
                items: [
                  { key: "paresPos", label: `Al conversar con compañeros sobre el enfoque [X], me sentí aceptado e integrado por ellos.` },
                  { key: "paresNeg", label: `Al conversar con compañeros sobre el enfoque [X], me sentí rechazado o criticado por ellos.` },
                  { key: "obsParesPos", label: `He observado que los compañeros que se identifican con el enfoque [X] son valorados positivamente en mi grupo de pares.` },
                  { key: "obsParesNeg", label: `He observado que los compañeros que se identifican con el enfoque [X] son valorados negativamente en mi grupo de pares.` },
                ],
              },
              {
                id: "contenido",
                title: "Contexto Académico - Contenido Teórico",
                items: [
                  { key: "teoriaPos", label: `La exposición al contenido teórico sobre el enfoque [X] me generó motivación o curiosidad.` },
                  { key: "teoriaNeg", label: `La exposición al contenido teórico sobre el enfoque [X] me generó frustración o desinterés.` },
                  { key: "teoricoClaro", label: `Al estudiar los materiales teóricos relacionados con el enfoque [X], me resultaron útiles o interesantes.` },
                  { key: "teoricoConfuso", label: `Al estudiar los materiales teóricos relacionados con el enfoque [X], me resultaron poco útiles o aburridos.` },
                ],
              },
              {
                id: "clinico",
                title: "Contexto Clínico (Experiencias y Relatos)",
                items: [
                  { key: "clinicoPos", label: `He tenido experiencias personales positivas en un proceso terapéutico con un profesional del enfoque [X].` },
                  { key: "clinicoNeg", label: `He tenido experiencias personales negativas en un proceso terapéutico con un profesional del enfoque [X].` },
                  { key: "relatosPos", label: `He escuchado relatos positivos de amigos o familiares con terapeutas del enfoque [X].` },
                  { key: "relatosNeg", label: `He escuchado relatos negativos de amigos o familiares con terapeutas del enfoque [X].` },
                ],
              },
              {
                id: "familiar",
                title: "Contexto Familiar",
                items: [
                  { key: "familiaPos", label: `Al comentar mi interés en el enfoque [X], la reacción de mi familia fue de apoyo o curiosidad.` },
                  { key: "familiaNeg", label: `Al comentar mi interés en el enfoque [X], la reacción de mi familia fue de crítica o incomprensión.` },
                ],
              },
            ];

            return contexts.map((ctx) => {
              // Construye todas las afirmaciones del contexto para todos los enfoques incluidos
              const entries = includeIdx.flatMap((idx) => {
                return ctx.items.map((it) => ({
                  enfoqueIdx: idx,
                  key: it.key,
                  label: it.label, // mantener [X] y reemplazar en render con PSA/TCC en negrita
                  needsValence: it.needsValence,
                }));
              });

              // Mezcla por contexto utilizando semilla de sesión + contexto
              let mixed = seededShuffle(entries, sessionSeed ^ hashToSeed(ctx.id));
              // Evitar duplicados exactos en caso de que existan por error de combinación
              const seen = new Set<string>();
              mixed = mixed.filter((it) => {
                const key = `${ctx.id}|${it.enfoqueIdx}|${String(it.key)}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });

              return (
                <section key={ctx.id} className="border rounded-lg p-4 space-y-3 bg-white">
                  <h3 className="font-medium">{ctx.title}</h3>
                  <div className="grid gap-3">
                    {mixed.map((it) => {
                      const c: Partial<ContItem> = data[it.enfoqueIdx] ?? ({} as Partial<ContItem>);
                      const short = it.enfoqueIdx === 0 ? "PSA" : "TCC";
                      const parts = (it.label || "").split("[X]");
                      const valenceKeyMap: Record<NumericContKey, keyof ContItem> = {
                        docentePos: "docentePosVal",
                        docenteNeg: "docenteNegVal",
                        califAlta: "califAltaVal",
                        califBaja: "califBajaVal",
                        obsDocentePos: "obsDocentePosVal",
                        obsDocenteNeg: "obsDocenteNegVal",
                        paresPos: "paresPosVal",
                        paresNeg: "paresNegVal",
                        obsParesPos: "obsParesPosVal",
                        obsParesNeg: "obsParesNegVal",
                        teoriaPos: "teoriaPosVal",
                        teoriaNeg: "teoriaNegVal",
                        teoricoClaro: "teoricoClaroVal",
                        teoricoConfuso: "teoricoConfusoVal",
                        clinicoPos: "clinicoPosVal",
                        clinicoNeg: "clinicoNegVal",
                        relatosPos: "relatosPosVal",
                        relatosNeg: "relatosNegVal",
                        familiaPos: "familiaPosVal",
                        familiaNeg: "familiaNegVal",
                      } as const;
                      const vKey = valenceKeyMap[it.key as NumericContKey];
                      const freqValue = (c[it.key as NumericContKey] as number | undefined) ?? undefined;
                      return (
                        <div key={`${ctx.id}-${it.enfoqueIdx}-${String(it.key)}`} className="flex flex-col gap-2">
                          <div className="text-sm">
                            {parts.map((p, idx) => (
                              <span key={idx}>
                                {p}
                                {idx < parts.length - 1 && <strong>{short}</strong>}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2">
                            <FrequencySelect
                              value={c[it.key] as number | undefined}
                              onChange={(v) => {
                                onChange(it.enfoqueIdx, { [it.key]: v } as Partial<ContItem>);
                                if (v === 0 && vKey) {
                                  onChange(it.enfoqueIdx, { [vKey]: undefined } as Partial<ContItem>);
                                }
                              }}
                              label="Seleccione"
                            />
                            {vKey && freqValue && freqValue > 0 && (
                              <div className="text-xs text-gray-700">
                                ¿Qué sentimientos o pensamientos le produjo esta situación?
                                <div className="mt-1">
                                  <ValenciaRadios5
                                    name={`val-${ctx.id}-${String(it.key)}-${it.enfoqueIdx}`}
                                    value={c[vKey] as 1 | 2 | 3 | 4 | 5 | undefined}
                                    onChange={(v) => onChange(it.enfoqueIdx, { [vKey]: v } as Partial<ContItem>)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            });
          })()}
        </div>
      )}

    <div className="flex items-center justify-between pt-2">
        <button type="button" className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50" onClick={onBack}>
          Anterior
        </button>
        <button
          type="submit"
          disabled={!canContinue}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
}

function SectionActividades({
  data,
  onChange,
  onToggleNone,
  onChangeOtroLabel,
  onBack,
  onSubmit,
}: {
  data: { teorico: [number, number, number]; formacion: [number, number, number]; redes: [number, number, number]; noTeorico?: boolean; noFormacion?: boolean; noRedes?: boolean; otroLabel?: string };
  onChange: (cat: "teorico" | "formacion" | "redes", idx: 0 | 1 | 2, value: number) => void;
  onToggleNone: (cat: "teorico" | "formacion" | "redes", none: boolean) => void;
  onChangeOtroLabel: (label: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const names: [string, string, string] = ["PSA", "TCC", data.otroLabel?.trim() ? data.otroLabel.trim().toUpperCase() : "OTRO"];

  const sum = (triple: [number, number, number]) => (triple?.[0] || 0) + (triple?.[1] || 0) + (triple?.[2] || 0);
  const okRow = (triple: [number, number, number], none?: boolean) => (none ? true : sum(triple) === 100);

  const canSubmit = okRow(data.teorico, data.noTeorico) && okRow(data.formacion, data.noFormacion) && okRow(data.redes, data.noRedes);

  const Row = ({
    title,
    hint,
    cat,
    triple,
  }: {
    title: string;
    hint: string;
    cat: "teorico" | "formacion" | "redes";
    triple: [number, number, number];
  }) => (
    <section className="border rounded-lg p-4 bg-white space-y-3">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-neutral-600">{hint}</p>
      <div className="flex items-center gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={cat === 'teorico' ? !!data.noTeorico : cat === 'formacion' ? !!data.noFormacion : !!data.noRedes}
            onChange={(e) => onToggleNone(cat, e.target.checked)}
          />
          {cat === 'formacion' ? 'No participo' : 'No consumo'}
        </label>
      </div>
      <div className="hidden sm:grid sm:grid-cols-4 text-xs text-neutral-500">
        <div>Enfoque</div>
        <div className="sm:col-span-3 sm:text-right">Porcentaje de tiempo dedicado</div>
      </div>
      <div className="grid gap-3">
        {names.map((n, i) => (
          <div key={n} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
            <div className="text-sm font-medium"><strong>{n}</strong></div>
            <div className="sm:col-span-3 flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={triple?.[i] ?? 0}
                onChange={(e) => onChange(cat, i as 0 | 1 | 2, Number(e.target.value))}
                disabled={cat === 'teorico' ? !!data.noTeorico : cat === 'formacion' ? !!data.noFormacion : !!data.noRedes}
                className="max-w-28"
                placeholder="0"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1 border-t mt-2">
          <div className="text-sm text-neutral-700">Total</div>
          <div className={`text-sm ${okRow(triple, cat === 'teorico' ? data.noTeorico : cat === 'formacion' ? data.noFormacion : data.noRedes) ? "text-neutral-900" : "text-red-600"}`}>
            {sum(triple)} % {okRow(triple, cat === 'teorico' ? data.noTeorico : cat === 'formacion' ? data.noFormacion : data.noRedes) ? "" : "(debe sumar 100%)"}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <header className="space-y-2">
        <h2 className="text-xl font-semibold">Distribución de Tiempo y Dedicación</h2>
        <p className="text-sm text-neutral-600">
          Instrucciones: Esta sección se refiere exclusivamente a actividades NO OBLIGATORIAS de la facultad; es decir, actividades que realiza por propia voluntad o preferencia. Para cada categoría, distribuya el 100% entre los enfoques. Si no consume/participa, marque la casilla correspondiente.
        </p>
      </header>

      <Row
        title="Consumo de Material Teórico"
        hint="(Lectura de libros/artículos, ver videos, escuchar podcasts, etc.)"
        cat="teorico"
        triple={data.teorico}
      />

      <Row
        title="Participación en Actividades de Formación"
        hint="(Asistencia a charlas, seminarios, talleres, grupos de estudio, debates etc.)"
        cat="formacion"
        triple={data.formacion}
      />

      <Row
        title="Consumo Cultural en Redes Sociales"
        hint="(Seguimiento de cuentas en redes sociales (p. ej., Instagram, YouTube, TikTok, X, Facebook) o participación en grupos (p. ej., WhatsApp, Telegram) relacionados con los enfoques)"
        cat="redes"
        triple={data.redes}
      />

      {(((data.teorico?.[2] || 0) > 0) || ((data.formacion?.[2] || 0) > 0) || ((data.redes?.[2] || 0) > 0)) && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm">Etiqueta para &quot;OTRO&quot;:</span>
          <Input
            placeholder="Especifique (opcional)"
            value={data.otroLabel || ""}
            onChange={(e) => onChangeOtroLabel(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button type="button" className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50" onClick={onBack}>
          Anterior
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800"
        >
          Enviar Encuesta
        </button>
      </div>
    </form>
  );
}

function ThankYou() {
  return (
    <div className="space-y-4 text-center">
      <p className="text-xl font-semibold">¡Muchas gracias por su valiosa colaboración!</p>
    </div>
  );
}

// — Utilidades para aleatorización determinística —
function hashToSeed(str: string): number {
  let h = 2166136261 >>> 0; // FNV-1a base
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simple card wrapper for consistent spacing and clarity
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 sm:p-6">{children}</div>
  );
}

// Step header with simple progress indicator
function StepHeader({ current, labels }: { current: number; labels: string[] }) {
  const total = labels.length;
  return (
    <div className="w-full">
      <div className="hidden sm:block">
        <ol className="flex items-center gap-3 text-xs text-neutral-600">
          {labels.map((label, i) => (
            <li key={i} className="flex items-center gap-2">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                  i === current ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-300"
                }`}
              >
                {i + 1}
              </span>
              <span className={i === current ? "text-neutral-900" : ""}>{label}</span>
              {i < total - 1 && <span className="mx-1 text-neutral-300">›</span>}
            </li>
          ))}
        </ol>
      </div>
      <div className="sm:hidden">
        <div className="text-sm text-neutral-700">
          Paso {Math.min(current + 1, total)} de {total}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
          <div
            className="h-2 rounded-full bg-neutral-900"
            style={{ width: `${((Math.min(current, total - 1) + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
