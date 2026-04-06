const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function ObtenerProgramasUser() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, nombre, sector FROM programas');
    await connection.end();
    return rows;
  } catch (error) {
    console.error("Error al obtener programas:", error);
    throw error;
  }

}


async function obtenerDetallesPrograma(programaId) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM programas WHERE id = ?', [programaId]);
    await connection.end();
    return rows[0];
  } catch (error) {
    console.error("Error al obtener detalles del programa:", error);
    throw error;
  }
}

//exportaciones globales de esta API
module.exports = {
  ObtenerProgramasUser,
  obtenerDetallesPrograma
}