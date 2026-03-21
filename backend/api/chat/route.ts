// cspell:disable
import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
};

export async function POST(request: Request) {
  let connection;
  try {
    const { mensaje, usuarioActual } = await request.json();
    const input = mensaje.toLowerCase().trim();
    const nombreParaMostrar = usuarioActual || "Aprendiz";

    // 1. MENÚ PRINCIPAL Y RETORNO
    const comandosRegresar = ["atras", "regresar", "menu", "volver", "sectores", "inicio"];
    if (comandosRegresar.some(c => input === c) || input === "hola") {
      return NextResponse.json({ 
        respuesta: `👋 ¡Hola, ${nombreParaMostrar}!\n\nEscribe un sector para ver los programas o escribe el nombre de una carrera para ver su detalle:\n\n💻 TECNOLOGÍA\n💼 ADMINISTRATIVO\n🏗️ INDUSTRIAL\n🏥 SALUD\n🌱 AGROPECUARIO\n🍳 GASTRONOMÍA\n🗣️ IDIOMAS`,
        mostrarBoton: false 
      });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // 2. BÚSQUEDA DETALLADA (Triple JOIN: Programas + Descripciones + Horarios)
    const [exactMatch] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        p.nombre, 
        p.sector, 
        d.breve_descripcion, 
        h.modalidad, 
        h.jornada, 
        h.horario_detalle
       FROM programas p 
       LEFT JOIN descripcion_programas d ON p.id = d.id_programa
       LEFT JOIN horarios_programas h ON p.id = h.id_programa
       WHERE p.nombre COLLATE utf8mb4_general_ci = ?`, 
      [input]
    );

    if (exactMatch.length > 0) {
      const p = exactMatch[0];
      
      // Construimos la sección de horario solo si existe en la base de datos
      const seccionHorario = p.modalidad 
        ? `📍 **MODALIDAD:** ${p.modalidad}\n⏰ **JORNADA:** ${p.jornada}\n🗓️ **HORARIO:** ${p.horario_detalle}`
        : `📍 **HORARIO:** Información de horario pendiente por asignar.`;

      return NextResponse.json({ 
        respuesta: `📖 **DETALLES DEL PROGRAMA**\n\n✅ **NOMBRE:** ${p.nombre}\n📂 **SECTOR:** ${p.sector}\n\n📝 **DESCRIPCIÓN:**\n${p.breve_descripcion || 'Descripción no disponible.'}\n\n${seccionHorario}\n\n────────────────────\n¿Te gustaría inscribirte? Usa el botón de abajo o escribe "atrás" para volver al menú.`,
        mostrarBoton: true,
        esDetalle: true 
      });
    }

    // 3. BÚSQUEDA DE LISTA (Si no es nombre exacto)
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT nombre FROM programas 
       WHERE sector COLLATE utf8mb4_general_ci LIKE ? 
       OR nombre COLLATE utf8mb4_general_ci LIKE ?
       ORDER BY sector ASC`,
      [`%${input}%`, `%${input}%`]
    );

    if (rows.length > 0) {
      let respuestaFinal = `🔍 **PROGRAMAS ENCONTRADOS:**\n`;
      rows.forEach((p) => {
        respuestaFinal += `🔹 ${p.nombre}\n`;
      });
      
      return NextResponse.json({ 
        respuesta: respuestaFinal + `\n────────────────────\n💡 **Copia el nombre** del programa que te guste y pégalo aquí para ver su **horario y descripción**.`,
        mostrarBoton: false 
      });
    }

    return NextResponse.json({ 
      respuesta: `🤔 No encontré información sobre "${mensaje}".\n\nEscribe "menú" para ver todas las áreas.`,
      mostrarBoton: false 
    });

  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ respuesta: "❌ Error de conexión con la base de datos." });
  } finally {
    if (connection) await connection.end();
  }
}