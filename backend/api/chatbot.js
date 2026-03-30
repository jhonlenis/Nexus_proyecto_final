require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const mysql = require('mysql2/promise');

// 🔹 Pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'senadb',
  waitForConnections: true,
  connectionLimit: 10,
});

// 🔹 IA
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    apiVersion: 'v1',
    timeout: 10000,
  },
});

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

// =============================
// 🧠 INTENCIONES
// =============================
function detectarIntencion(query) {
  if (!query) return "GENERAL";

  // 🔥 menú
  if (query === "menu") return "MENU";

  // 🔥 opciones numéricas
  if (query === "1") return "PERFIL";
  if (query === "2" || query.includes("tecnologia")) return "PROGRAMAS_TEC";

  if (query.includes("perfil") || query.includes("mis datos")) return "PERFIL";

  return "GENERAL";
}

// =============================
// 📋 MENÚ
// =============================
function generarMenu() {
  return `📋 *MENÚ PRINCIPAL SENA*

1️⃣ Ver mi perfil  
2️⃣ Programas de tecnología  

✍️ Escribe el número o la opción.

🔙 Escribe "menu" para volver`;
}

// =============================
// 🗄️ CONSULTAS DB
// =============================
async function buscarInformacionEnDb(query, userId) {
  console.log("🔍 DB:", query, "| Usuario ID:", userId);

  try {
    const intencion = detectarIntencion(query);

    switch (intencion) {

      // 🔹 MENÚ
      case "MENU":
        return generarMenu();

      // 🔹 PERFIL
      case "PERFIL": {
        if (!userId) return "⚠️ Usuario no autenticado.";

        const [rows] = await pool.execute(
          `SELECT nombres, apellidos, correo_personal 
           FROM usuarios 
           WHERE id = ?`,
          [userId]
        );

        if (rows.length === 0) {
          return "No encontré información de tu perfil.";
        }

        const user = rows[0];

        return `👤 *Tu perfil*
Nombre: ${user.nombres} ${user.apellidos}
Email: ${user.correo_personal}`;
      }

      // 🔹 PROGRAMAS TECNOLOGÍA
      case "PROGRAMAS_TEC": {
        const [rows] = await pool.execute(
          "SELECT nombre FROM programas WHERE sector = ?",
          ["Tecnología"]
        );

        if (rows.length === 0) return "No hay programas disponibles.";

        return `💻 *Programas de Tecnología*

${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}

🔙 Escribe "menu" para volver`;
      }

      default:
        return null;
    }

  } catch (error) {
    console.error("❌ Error en DB:", error.message);
    return "⚠️ Error consultando la base de datos.";
  }
}

// =============================
// 🤖 IA (Gemini)
// =============================
async function consultarAPI_IA(userMessage, informacionDB = "") {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "👋 Soy el asistente del SENA (modo sin IA).";
    }

    if (!userMessage) {
      return "Por favor escribe un mensaje válido.";
    }

    const prompt = `
Asistente SENA. Responde claro y breve.
Usuario: ${userMessage}
Info BD: ${informacionDB || "No hay"}
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 80,
      },
    });

    return response?.text?.trim() || "No pude generar respuesta.";

  } catch (error) {
    console.error("❌ Gemini:", error.message);

    if (error.message.includes("quota") || error.message.includes("429")) {
      return informacionDB
        ? `📌 ${informacionDB}`
        : "⚠️ IA no disponible en este momento.";
    }

    return "⚠️ Error con la IA.";
  }
}

// =============================
// 🚀 CHATBOT PRINCIPAL
// =============================
async function chatbot(mensaje, userId) {
  const input = mensaje?.toLowerCase().trim();

  try {
    const informacionDB = await buscarInformacionEnDb(input, userId);

    // 🔥 PRIORIDAD: DB primero
    if (informacionDB) {
      return {
        success: true,
        respuesta: informacionDB,
        fuente: 'Base de Datos',
        timestamp: new Date().toISOString()
      };
    }

    // 🔹 fallback IA
    const respuestaIA = await consultarAPI_IA(input);

    return {
      success: true,
      respuesta: respuestaIA,
      fuente: 'IA',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Chatbot:", error.message);

    return {
      success: false,
      respuesta: "Error interno del servidor.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}


module.exports = { chatbot };