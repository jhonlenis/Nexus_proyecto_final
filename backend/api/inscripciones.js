const mysql = require('mysql2/promise');


const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
// Asegúrate de tener dbConfig definido arriba o importado
async function obtenerInscripciones() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Consulta para traer las inscripciones
    // Tip: Puedes hacer un JOIN si quieres traer el nombre del usuario y el programa
    const query = `
      SELECT i.id, u.nombres AS usuario, i.programa, i.estado, i.fecha_inscripcion 
      FROM inscripciones i
      JOIN usuarios u ON i.id_usuario = u.id
    `;
    
    const [rows] = await connection.execute(query);
    
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error en la función inscripciones:", error.message);
    return { success: false, data: [], error: error.message };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function inscripciones(programa, usuario_id) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const query = `
      INSERT INTO inscripciones (id_usuario, programa, estado, fecha_inscripcion) 
      VALUES (?, ?, 'Inscrito', NOW())
    `;
    
    const [result] = await connection.execute(query, [usuario_id, programa]);
    
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error("Error al crear inscripción:", error.message);
    return { success: false, error: error.message };
  } finally {
    if (connection) await connection.end();
  }
}

// Exportamos todas las funciones para que puedan ser usadas en index.js
module.exports = {
   obtenerInscripciones, 
   inscripciones,
  };
