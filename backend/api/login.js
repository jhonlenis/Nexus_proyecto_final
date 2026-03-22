const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Carga las variables del archivo .env

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// AÑADE ESTO PARA DEPURAR:
console.log("Intentando conectar con el usuario:", dbConfig.user);
console.log("Base de datos:", dbConfig.database);


async function ValidarUsuario(datos) {
  const { tipo_documento, numero_documento, correo, password } = datos;
  console.log("Datos recibidos en el Backend:", { tipo_documento, numero_documento, correo });
  let connection;

  try {
    // 1. Conexión a la base de datos
    connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT id, nombres, apellidos, password_hash, rol 
      FROM usuarios 
      WHERE tipo_documento = ? 
        AND numero_documento = ? 
        AND correo_personal = ?
    `;

    // 2. Ejecutar consulta para encontrar al usuario
    const [rows] = await connection.execute(query, [
      tipo_documento,
      numero_documento,
      correo.trim()
    ]);
    console.log("Usuarios encontrados en DB:", rows.length);

    if (rows.length === 0) {
      return { success: false, error: "Usuario no encontrado.", status: 401 };
    }

    const usuario = rows[0];

    // Diagnóstico de contraseña
    console.log("Contraseña escrita por el usuario:", password);
    console.log("Hash recuperado de la DB:", usuario.password_hash);

    // 3. Verificar contraseña con bcrypt
    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) {
      return { success: false, error: "Contraseña incorrecta.", status: 401 };
    }

    return {
      success: true,
      user: {
        id: usuario.id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        rol: usuario.rol
      }
    };
  } catch (error) {
    console.error("Error en ValidarUsuario:", error.message);
    throw error;
  } finally {
    // 4. Siempre cerrar la conexión
    if (connection) await connection.end();
  }
}

// EXPORTACIÓN COMMONJS
module.exports = { ValidarUsuario };