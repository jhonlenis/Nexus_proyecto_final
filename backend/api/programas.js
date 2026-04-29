const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// ✅ Obtener programas
async function ObtenerProgramasUser() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT id, nombre, sector FROM programas'
    );

    return rows;
  } catch (error) {
    console.error("Error al obtener programas:", error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// ✅ Obtener detalles por nombre
async function obtenerDetallesPrograma(nombre) {
  if (!nombre) throw new Error("Nombre undefined");

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
  SELECT 
    p.nombre,
    d.breve_descripcion,
    h.modalidad,
    h.horario_detalle
  FROM programas p
  LEFT JOIN descripcion_programas d
  ON p.id = d.id_programa
  LEFT JOIN horarios_programas h
  ON p.id = h.id_programa
  WHERE p.nombre = ?
`, [nombre]);

    return rows[0] || null;

  } catch (error) {
    console.error("Error al obtener detalles:", error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = {
  ObtenerProgramasUser,
  obtenerDetallesPrograma
};