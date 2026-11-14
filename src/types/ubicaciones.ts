/**
 * ══════════════════════════════════════════════════════
 * Tipos CU21 — Ubicación compartida (Sprint 3).
 * ══════════════════════════════════════════════════════
 */

/** Contacto de confianza autorizado para recibir la ubicación */
export interface ContactoUbicable {
  nombre: string;
  parentesco: string | null;
  telefono: string;
  correo: string | null;
}

/** Usuario con ping GPS reciente ("en vivo" para el mapa) */
export interface UsuarioUbicacion {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
  telefono: string | null;
  latitud: number;
  longitud: number;
  precision_metros: number | null;
  fecha_registro: string;
  minutos_desde: number;
  contactos_autorizados: ContactoUbicable[];
}

/** Respuesta de GET /ayuda/ubicaciones-activas */
export interface UbicacionesActivasRespuesta {
  ok: boolean;
  ventana_min: number;
  total: number;
  datos: UsuarioUbicacion[];
}

/** Punto de la ruta GPS de un usuario */
export interface PuntoUbicacion {
  id_ubicacion: number;
  latitud: number;
  longitud: number;
  precision_metros: number | null;
  fecha_registro: string;
}

/** Respuesta de GET /ayuda/ubicaciones/usuario/:id */
export interface RutaUbicacionRespuesta {
  usuario: {
    id_usuario: number;
    nombre: string;
    telefono: string | null;
  };
  contactos_autorizados: ContactoUbicable[];
  puntos: PuntoUbicacion[];
}
