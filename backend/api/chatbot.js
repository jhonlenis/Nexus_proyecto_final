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
  if (query === "3") return "ADMINISTRATIVO_FIN";
  if (query === "4") return "INDUSTRIAL_CONSTRUCCION"
  if (query === "5" || query.includes("Salud") || query.includes("Servicios Sociales")) return "SALUD_SERVICIOS";
  if (query === "6" || query.includes("Agropecuario") || query.includes("Ambiental")) return "AGROPECUARIO_AMBIENTAL";
  if (query === "7"|| query.includes("Gastronomía") || query.includes("Turismo")) return "GASTRONOMIA_TURISMO";
  if (query === "8" || query.includes("Idiomas") || query.includes("Educación")) return "IDIOMAS_EDUCACION";
  if (query === "9") return "INSCRIPCION";
  if (query === "10" || query.includes("editar perfil")) return "EDITAR_PERFIL";

  if (query.includes("perfil") || query.includes("mis datos")) return "PERFIL";

  if (query.includes("andministracion") || query.includes("finaciero")) return "ADMINISTRATIVO_FIN";

  if (query.includes("industrial") || query.includes("construcion")) return "INDUSTRIAL_CONSTRUCCION";

  return "GENERAL";
}

// =============================
// 📋 MENÚ
// =============================
function generarMenu() {
  return `📋 *MENÚ PRINCIPAL SENA*

1️⃣ Ver mi perfil  
2️⃣ Programas de tecnología
3️⃣ Programas de Administrativo y Financiero
4️⃣ Programas de Industrial y Construcción
5️⃣ Programas de Salud y Servicios Sociales
6️⃣ Programas de Agropecuario y Ambiental
7️⃣ Programas de Gastronomía y Turismo
8️⃣ Programas de Idiomas y Educación
9️⃣ Incríbete a un programa
🔟 Editar mi perfil 

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

        if (rows.length === 0) {
          return "No hay programas disponibles en la base de datos.";
        }

        return `💻 *Programas de Tecnología*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}
🔙 Escribe "menu" para volver`;
      }

      // 🔹 PROGRAMAS ADMINISTRATIVO Y FINANCIERO
      case "ADMINISTRATIVO_FIN": {
        const [rows] = await pool.execute(
          "SELECT nombre FROM programas WHERE sector = ?",
          ["Administrativo y Financiero"]
        );

        if (rows.length === 0) {
          return "No hay programas disponibles en la base de datos.";
        }

        return `💻 *Programas de Administrativo y Financiero*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}
🔙 Escribe "menu" para volver`;
      }

      // 🔹 PROGRAMAS INDUSTRIAL Y CONSTRUCCIÓN
      case "INDUSTRIAL_CONSTRUCCION": {
        const [rows] = await pool.execute(
          "SELECT nombre FROM programas WHERE sector = ?",
          ["Industrial y Construcción"]
        );

        if (rows.length === 0) {
          return "No hay programas disponibles en la base de datos.";
        }

        return `🏗️ *Programas de Industrial y Construcción*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}
🔙 Escribe "menu" para volver`;
      }
      case "SALUD_SERVICIOS": {
        const [rows] = await pool.execute(
          "SELECT nombre FROM programas WHERE sector = ?",
          ["Salud y Servicios Sociales"]
        );
        if (rows.length === 0) {
          return "No hay programas disponibles en la base de datos.";
        }

        return `🏥 *Programas de Salud y Servicios Sociales*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}
🔙 Escribe "menu" para volver`;
      }

      case "AGROPECUARIO_AMBIENTAL": {
        const [rows] = await pool.execute(
          "SELECT nombre FROM programas WHERE sector = ?",
          ["Agropecuario y Ambiental"]
        );
        if (rows.length === 0) {
          return "No hay programas disponibles en la base de datos.";
        }

        return `� *Programas de Agropecuario y Ambiental*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}
🔙 Escribe "menu" para volver`;
      }

      case "GASTRONOMIA_TURISMO": {
        const [rows] = await pool.execute(
          "SELECT nombre FROM programas WHERE sector = ?",
          ["Gastronomía y Turismo"]
        );
        if (rows.length === 0) {
          return "No hay programas disponibles en la base de datos.";
        }

        return `�️ *Programas de Gastroonomía y Turismo*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}
🔙 Escribe "menu" para volver`;
      }

      case "IDIOMAS_EDUCACION": {
        const [rows] = await pool.execute(
          "SELECT nombre FROM programas WHERE sector = ?",
          ["Idiomas y Educación"]
        );
        if (rows.length === 0) {
          return "No hay programas disponibles en la base de datos.";
        }

        return `📚 *Programas de Idiomas y Educación*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}
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