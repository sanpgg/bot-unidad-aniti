export type DenunciaState = {
  tipo?: "anonima" | "identificada";
  nombre?: string;
  hechos?: string;

  // Adjuntos
  adjuntos?: Array<{ kind: string; url?: string; id?: string; caption?: string }>;

  // Info adicional
  infoAdicional?: string[];

  // Contacto
  contactoConfirmadoWhatsapp?: boolean;
  medioContacto?: string;

  // Flags
  esperandoAdjunto?: boolean;
  esperandoInfoAdicional?: boolean;
  esperandoMedioContacto?: boolean;
};

export const ASK_HECHOS =
  "c) Describe los hechos de tu denuncia.\n\n" +
  "AVISO IMPORTANTE 1: Tu relato debe responder a:\n" +
  "¿Qué pasó?, ¿Cómo pasó?, ¿Cuándo pasó? y ¿Dónde pasó?.\n" +
  "Procura ser claro y preciso.\n\n" +
  "AVISO IMPORTANTE 2: Relata la denuncia en *UN solo mensaje*, no importa que sea largo.";
