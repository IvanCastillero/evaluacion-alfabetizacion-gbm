export type StepId =
  | 'P1' // Bienvenida
  | 'P2' // Privacidad
  | 'P3' // Edad (+18)
  | 'P4' // Rango de edad
  | 'P5' // Trabajo / Ocupación
  | 'P6' // Nivel de estudios
  | 'P7' // Residencia
  | 'P8' // Práctica
  | 'P9' // Reto 1: Imagen y texto (2 ítems)
  | 'P10' // Reto 2: Completa la frase (2 ítems)
  | 'P11' // Transición
  | 'P12' // Reto 3: Íconos del celular (2 ítems)
  | 'P13' // Reto 4: Riesgo o Seguro (3 tarjetas)
  | 'P14' // Celebración
  | 'P15' // Satisfacción
  | 'P16' // Premio
  | 'P17'; // Cierre

export type EmploymentStatus =
  | 'FORMAL'
  | 'INFORMAL'
  | 'UNEMPLOYED'
  | 'STUDENT'
  | 'HOME'
  | 'RETIRED'
  | 'NA';

export type EducationLevel =
  | 'PRIMARY_INCOMPLETE'
  | 'PRIMARY'
  | 'SECONDARY'
  | 'TERTIARY'
  | 'NA';

export type AgeGroup =
  | '18_24'
  | '25_34'
  | '35_44'
  | '45_59'
  | '60_PLUS'
  | 'NA';

export type ResidenceMethod = 'CHIP' | 'SEARCH' | 'DECLINED';

export type InputMethod = 'TAP' | 'SWIPE' | 'DRAG';

export type Category = 'ROJO' | 'AMARILLO' | 'VERDE';

export interface AnswerRecord {
  item_id: string;
  choice: string;
  correct: boolean;
  ms: number;
  audio_used: boolean;
  input: InputMethod;
}

export interface Demographics {
  age_group?: AgeGroup;
  employment_status?: EmploymentStatus;
  education_level?: EducationLevel;
}

export interface RewardRecord {
  eligible: boolean;
  code: string;
  repeat_device: boolean;
}

export interface ScoresRecord {
  s_lit: number;
  s_dig: number;
  s_total: number;
  category: Category;
}

export type SessionStatus = 'COMPLETED' | 'ABANDONED';

export interface SessionData {
  session_id: string;
  kiosk_origin_id: string; // 'PTYK001' | 'PTYK002' | 'PTYK003' | 'UNKNOWN'
  anon_device_id: string;
  assisted: boolean;
  consent_version: string; // 'CONS_PROTO_01'
  status: SessionStatus;
  last_step: StepId;
  demographics?: Demographics;
  residence_zone_id?: string;
  residence_method?: ResidenceMethod;
  answers: AnswerRecord[];
  step_times_ms: Record<string, number>;
  scores?: ScoresRecord;
  satisfaction?: number; // 1, 2, or 3
  reward?: RewardRecord;
  started_at: string;
  finished_at?: string;
  synced: boolean;
}

export interface SignData {
  title: string;
  schedule?: string;
  highlight?: string;
  icon?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  icon?: string;
}

export interface QuestionItem {
  id: string;
  reto: number;
  type: 'IMAGE_TEXT' | 'COMPLETE_SENTENCE' | 'PHONE_ICONS' | 'RISK_SAFE';
  prompt: string;
  audio: string;
  sentence_parts?: string[];
  sign?: SignData;
  options?: QuestionOption[];
  correct: string;
}

export interface Zone {
  id: string;
  name: string;
}

export interface KioskConfig {
  id: string;
  name: string;
  chips: string[];
}
