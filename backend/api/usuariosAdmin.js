// api/usuarios.js (o donde manejes la lógica de usuarios)
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function ObtenerTodosLosUsuarios() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Seleccionamos los datos necesarios EXCEPTO la contraseña
    const query = 'SELECT id, nombres, apellidos, tipo_documento, numero_documento, correo_personal, rol FROM usuarios';
    
    const [rows] = await connection.execute(query);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { ObtenerTodosLosUsuarios };