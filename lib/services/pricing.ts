export const pricingService = {
  calculateSessionCost(params: {
    hasAudio: boolean;
    files: File[];
    reportType?: string; // Nuevo parámetro
  }): { totalCredits: number; details: string[] } {
    let credits = 1; // Base: Sesión Estándar
    const details: string[] = [];

    // Separar audios de documentos
    const audioFiles = params.files.filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|m4a|ogg)$/i));
    const docFiles = params.files.filter(f => !f.type.startsWith('audio/') && !f.name.match(/\.(mp3|wav|m4a|ogg)$/i));

    const totalDocSizeBytes = docFiles.reduce((acc, f) => acc + f.size, 0);
    const totalDocSizeMB = totalDocSizeBytes / (1024 * 1024);
    
    // -----------------------------------------------------------------------
    // REGLA 0: TIPO DE INFORME
    // -----------------------------------------------------------------------
    // Dossier / Alta de Paciente empieza en 2 créditos
    if (params.reportType === 'alta_paciente') {
      credits = 2;
      details.push('Gestión Documental / Dossier (Base: 2 Créditos)');
    } else {
      details.push('Sesión Estándar (Base: 1 Crédito)');
    }

    // -----------------------------------------------------------------------
    // REGLA 1: AUDIOS (1 grabación/audio incluido)
    // -----------------------------------------------------------------------
    // Si hay más de 1 audio (ej: grabó Y subió otro, o subió 2), es Sesión Compleja
    const audioCount = audioFiles.length + (params.hasAudio ? 1 : 0); // hasAudio suele ser el blob del micro
    // OJO: 'hasAudio' en page.tsx es "!!audioBlob || !!transcription".
    // Si subió un archivo y no grabó, hasAudio es false (se asume el archivo es el audio).
    // Ajuste: Contamos Total Fuentes de Audio.
    
    // Si hay MÚLTIPLES fuentes de audio (Bloqueado por UI, pero por seguridad mantenemos lógica defensiva)
    // En UI ya impedimos subir >1 audio, así que esto es safeguards.
    // Si llegara a pasar (ej: bypass), seguimos cobrando 4 para desalentar.
    if (audioFiles.length > 1) {
       credits = Math.max(credits, 4);
       details.push('Múltiples audios (Sesión Compleja: 4 Créditos)');
    }

    // -----------------------------------------------------------------------
    // REGLA 2: DOCUMENTOS
    // -----------------------------------------------------------------------
    
    // TIER 3: Compleja (4 Créditos)
    // - Más de 2 documentos extra
    // - O Volumen total > 50 MB
    if (docFiles.length > 2 || totalDocSizeMB > 50) {
      credits = Math.max(credits, 4);
      if (docFiles.length > 2) details.push(`- ${docFiles.length} documentos adjuntos (>2)`);
      if (totalDocSizeMB > 50) details.push(`- Volumen de datos alto (${totalDocSizeMB.toFixed(1)} MB)`);
      // Sobrescribe anteriores
      details[details.length-1] += ' -> Aplica Tarifa Compleja (4 Créditos)';
    }
    
    // TIER 2: Gestión Documental (2 Créditos)
    // - 2 documentos
    // - O 1 documento mediano (>10 MB y <= 50 MB)
    else if (docFiles.length === 2 || (docFiles.length === 1 && totalDocSizeMB > 10)) {
      credits = Math.max(credits, 2);
      if (docFiles.length === 2) details.push('- 2 Documentos adjuntos');
      if (docFiles.length === 1 && totalDocSizeMB > 10) details.push(`- Documento mediano (${totalDocSizeMB.toFixed(1)} MB)`);
    }

    // TIER 1: Estándar (ya cubierto por base 1)
    // - 1 Documento pequeño (<= 10 MB) incluido.
    
    return { totalCredits: credits, details: [...new Set(details)] };
  }
};
