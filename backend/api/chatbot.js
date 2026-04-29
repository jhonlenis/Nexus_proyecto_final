require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const mysql = require('mysql2/promise');

// Pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'senadb',
  waitForConnections: true,
  connectionLimit: 10,
});

// IA
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

let estadoUsuario = {}; // Mantiene el estado/flujo de cada usuario

// =============================
// 🧠 INTENCIONES
// =============================
function detectarIntencion(query) {
  const mensaje = (query || "").toLowerCase().trim();
  if (!mensaje) return "GENERAL";

  if (mensaje === "menu") return "MENU";
  if (mensaje === "1") return "PERFIL";
  if (mensaje === "2" || mensaje.includes("tecnologia")) return "PROGRAMAS_TEC";
  if (mensaje === "3" || mensaje.includes("idiomas") || mensaje.includes("educación")) return "IDIOMAS";
  if (mensaje === "4") return "VER_INSCRIPCION";
  if (mensaje === "5" || mensaje.includes("inscribir")) return "INSCRIBIRSE";
  if (mensaje === "6" || mensaje.includes("editar perfil")) return "EDITAR_PERFIL";
  if (mensaje === "0" || mensaje === "salir") return "SALIR";

  if (mensaje.includes("perfil") || mensaje.includes("mis datos")) return "PERFIL";
  return "GENERAL";
}

// =============================
// 📋 MENÚS
// =============================
function generarMenu() {
  return `📋 *MENÚ PRINCIPAL SENA*

1️⃣ Ver mi perfil  
2️⃣ Programas de tecnología
3️⃣ Programas de Idiomas
4️⃣ Ver mis inscripciones
5️⃣ Inscribirme en un programa
6️⃣ Editar mi perfil 
0️⃣ Salir

✍️ Escribe el número o la opción.`;
}

function generarSubMenuEditar() {
  return `✍️ *¿Qué campo deseas editar?*

1️⃣ Nombres
2️⃣ Apellidos
3️⃣ Correo Personal
4️⃣ Número de Documento
5️⃣ Tipo de Documento
0️⃣ Volver al menú principal

Escribe el número de la opción que quieres cambiar.`;
}

// =============================
// 🗄️ LÓGICA DE BASE DE DATOS Y FLUJOS
// =============================
async function buscarInformacionEnDb(query, userId, mensajeOriginal) {
  const input = (query || "").toLowerCase().trim();

  try {
    // 1. SI ESCRIBE "MENU" - RESETEAR ESTADO Y MOSTRAR
    if (input === "menu") {
      estadoUsuario[userId] = { paso: "menu_activo" };
      return generarMenu();
    }

    const estado = estadoUsuario[userId];

    // 2. MANEJO DE FLUJOS ACTIVOS (PASO A PASO)
    
    // --- FLUJO: INSCRIPCIÓN ---
    if (estado === "esperando_programa") {
      const [rows] = await pool.execute(
        `SELECT * FROM programas WHERE LOWER(nombre) = LOWER(?)`,
        [mensajeOriginal.trim()]
      );
      if (rows.length === 0) return "❌ Programa no encontrado. Escribe el nombre exacto.";
      
      estadoUsuario[userId] = { paso: "confirmar_inscripcion", programaNombre: rows[0].nombre };
      return `✅ Encontré el programa "${rows[0].nombre}".\n\n¿Deseas inscribirte? Responde "si" o "no".`;
    }

    if (estado?.paso === "confirmar_inscripcion") {
      if (input === "si") {
        await pool.execute(
          "INSERT INTO inscripciones (id_usuario, programa, estado, fecha_inscripcion) VALUES (?, ?, 'Inscrito', NOW())",
          [userId, estado.programaNombre]
        );
        estadoUsuario[userId] = { paso: "menu_activo" };
        return `✅ ¡Te has inscrito exitosamente en ${estado.programaNombre}!`;
      }
      estadoUsuario[userId] = { paso: "menu_activo" };
      return "❌ Inscripción cancelada. Escribe 'menu' para ver opciones.";
    }

    // --- FLUJO: EDITAR PERFIL (Selección de opción) ---
    if (estado?.paso === "editando_perfil_seleccion") {
      const opciones = {
        "1": { campo: "nombres", label: "Nombres" },
        "2": { campo: "apellidos", label: "Apellidos" },
        "3": { campo: "correo_personal", label: "Correo Personal" },
        "4": { campo: "numero_documento", label: "Número de Documento" },
        "5": { campo: "tipo_documento", label: "Tipo de Documento" }
      };

      if (input === "0") {
        estadoUsuario[userId] = { paso: "menu_activo" };
        return generarMenu();
      }

      if (opciones[input]) {
        estadoUsuario[userId] = { paso: "esperando_nuevo_valor", campo: opciones[input].campo, label: opciones[input].label };
        return `✍️ Has seleccionado editar: *${opciones[input].label}*.\nPor favor, escribe el nuevo valor:`;
      }
      return "⚠️ Opción no válida. Elige un número del 1 al 5 o 0 para salir.";
    }

    // --- FLUJO: EDITAR PERFIL (Guardar nuevo valor) ---
    if (estado?.paso === "esperando_nuevo_valor") {
      const { campo, label } = estado;
      await pool.execute(
        `UPDATE usuarios SET ${campo} = ? WHERE id = ?`,
        [mensajeOriginal.trim(), userId]
      );
      estadoUsuario[userId] = { paso: "menu_activo" };
      return `✅ ¡Tu *${label}* ha sido actualizado con éxito!\n\nEscribe "menu" para volver.`;
    }

    // 3. VALIDACIÓN DE ACCESO AL MENÚ
    if (!estado || estado === "fuera_de_menu") {
      return "⚠️ Hola. Para ver las opciones disponibles y poder ayudarte, primero necesitas escribir la palabra *'menu'*";
    }

    // 4. SWITCH DE INTENCIONES (Menú principal)
    const intencion = detectarIntencion(input);
    switch (intencion) {
      case "MENU":
        return generarMenu();

      case "PERFIL": {
        const [rows] = await pool.execute("SELECT nombres, apellidos, correo_personal FROM usuarios WHERE id = ?", [userId]);
        if (rows.length === 0) return "No encontré tu perfil.";
        const u = rows[0];
        return `👤 *Tu perfil*\nNombre: ${u.nombres} ${u.apellidos}\nEmail: ${u.correo_personal}\n\n🔙 Escribe "menu" para volver.`;
      }

      case "PROGRAMAS_TEC": {
        const [rows] = await pool.execute("SELECT nombre FROM programas WHERE sector = 'Tecnología'");
        return `💻 *Programas de Tecnología*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}\n\n🔙 Escribe "menu" para volver.`;
      }

      case "IDIOMAS": {
        const [rows] = await pool.execute("SELECT nombre FROM programas WHERE sector = 'Idiomas y Educación'");
        return `📚 *Programas de Idiomas*\n${rows.map((r, i) => `${i + 1}. ${r.nombre}`).join("\n")}\n\n🔙 Escribe "menu" para volver.`;
      }

      case "VER_INSCRIPCION": {
        const [rows] = await pool.execute("SELECT programa FROM inscripciones WHERE id_usuario = ?", [userId]);
        if (rows.length === 0) return "No tienes inscripciones activas.";
        return `✅ *Tus Inscripciones*\n${rows.map((r, i) => `${i + 1}. ${r.programa}`).join("\n")}\n\n🔙 Escribe "menu" para volver.`;
      }

      case "INSCRIBIRSE":
        estadoUsuario[userId] = "esperando_programa";
        return "✍️ ¿A qué programa deseas inscribirte? (Escribe el nombre completo)";

      case "EDITAR_PERFIL": {
        const [rows] = await pool.execute("SELECT * FROM usuarios WHERE id = ?", [userId]);
        const u = rows[0];
        estadoUsuario[userId] = { paso: "editando_perfil_seleccion" };
        return `👤 *Datos Actuales:*\n1. Nombres: ${u.nombres}\n2. Apellidos: ${u.apellidos}\n3. Email: ${u.correo_personal}\n4. Doc: ${u.numero_documento}\n5. Tipo: ${u.tipo_documento}\n\n` + generarSubMenuEditar();
      }

      case "SALIR":
        estadoUsuario[userId] = "fuera_de_menu";
        return "👋 Has salido del menú. Cuando me necesites, escribe 'menu'.";

      default:
        return null; // Si no hay intención clara, pasa a la IA
    }

  } catch (error) {
    console.error("❌ Error en DB:", error.message);
    return "⚠️ Lo siento, tuve un problema al procesar tu solicitud en la base de datos.";
  }
}

// =============================
// 🤖 IA (Gemini)
// =============================
async function consultarAPI_IA(userMessage) {
  try {
    if (!process.env.GEMINI_API_KEY) return "👋 Soy el asistente del SENA.";
    const prompt = `Asistente SENA. Responde claro y breve, si no entiendes algo, pregunta. Usuario dice: ${userMessage}`;
    const result = await ai.getGenerativeModel({ model: MODEL }).generateContent(prompt);
    const response = await result.response;
    return response.text().trim() || "No pude generar una respuesta.";
  } catch (error) {
    return "⚠️ IA no disponible temporalmente.";
  }
}

// =============================
// 🚀 CHATBOT PRINCIPAL
// =============================
async function chatbot(mensaje, userId) {
  const input = mensaje?.toLowerCase().trim();

  try {
    const informacionDB = await buscarInformacionEnDb(input, userId, mensaje);

    if (informacionDB) {
      return { success: true, respuesta: informacionDB, fuente: 'Base de Datos' };
    }

    const respuestaIA = await consultarAPI_IA(input);
    return { success: true, respuesta: respuestaIA, fuente: 'IA' };

  } catch (error) {
    return { success: false, respuesta: "Error interno del sistema." };
  }
}

module.exports = { chatbot };