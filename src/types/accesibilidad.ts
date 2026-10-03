/**
 * ══════════════════════════════════════════════════════
 * Tipos de accesibilidad — espejo de:
 *   modules/accesibilidad/dto/*
 * ══════════════════════════════════════════════════════
 */

/** Preferencias de un usuario (GET /accesibilidad/me o /usuario/:id) */
export interface PreferenciasAccesibilidad {
  id_preferencia: number;
  id_usuario: number;
  voz_habilitada: boolean;
  /** 0–100 */
  volumen_voz: number;
  /** 0.5–3.0 */
  velocidad_voz: number;
  alertas_sonoras: boolean;
  vibracion_habilitada: boolean;
  /** 0–100 */
  intensidad_vibracion: number;
  confirmaciones_por_voz: boolean;
  modo_bajo_consumo: boolean;
}

/** PATCH /accesibilidad/me — actualización parcial */
export interface ActualizarPreferenciasPayload {
  voz_habilitada?: boolean;
  volumen_voz?: number;
  velocidad_voz?: number;
  alertas_sonoras?: boolean;
  vibracion_habilitada?: boolean;
  intensidad_vibracion?: number;
  confirmaciones_por_voz?: boolean;
  modo_bajo_consumo?: boolean;
}