const { request } = require('express');
const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function chatbot(mensaje, usuarioActual) {
  const input = mensaje ? mensaje.toLowerCase().trim() : "";
  const nombreParaMostrar = usuarioActual || "Aprendiz";

  let respuesta = "";

  try {

    if (input.includes("hola") || input.includes("buenos días")) {
      respuesta = `¡Hola ${nombreParaMostrar}! Soy el asistente del SENA. ¿En qué puedo ayudarte hoy?`;
    }
    else if (input.includes("inscripciones") || input.includes("inscribir")) {
      respuesta = "Para inscribirte, ve a la sección de 'Programas', elige uno y presiona el botón 'Inscribirme'.";
    }
    else if (input.includes("certificados")) {
      respuesta = "Los certificados los puedes descargar desde la plataforma SofiaPlus con tu número de documento.";
    }
    else {
      respuesta = "Lo siento, no entendí tu pregunta. ¿Podrías intentar de otra forma? (Ej: 'inscripciones', 'programas', 'hola')";
    }

    return { success: true, respuesta };

  } catch (error) {
    console.error("Error en el chatbot:", error.message);
    return { success: false, respuesta: "Ups, tuve un error interno. Intenta más tarde." };
  }
}

module.exports = { chatbot }