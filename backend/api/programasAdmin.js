const mysql = require('mysql2/promise');
require('dotenv').config(); // Carga las variables del archivo .env

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function ObtenerProgramasAdmin() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const query = `SELECT id, nombre, sector FROM programas`;
    const [rows] = await connection.execute(query);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error al obtener programas:", error);
    return { success: false, data: [], error: "Error al obtener programas" };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function updatedProgram(id_programa, nombre, sector) {
  
}

async function createdProgram(nombre, sector) {
  
}


async function deletProgram(id_programa) {
  
}

module.exports = { ObtenerProgramasAdmin, updatedProgram, createdProgram, deletProgram };