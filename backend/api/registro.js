const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Carga las variables del archivo .env

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function RegistrarUsuarios(params) {
  const { nombres, apellidos, tipo_documento, numero_documento, correo_personal, password, rol } = params;
  let connection;
  try {
    // conectar base de datos
    connection = await mysql.createConnection(dbConfig);

    // encriptar contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const valorRol = rol || 'Aprendiz'; // Si no se proporciona un rol, asignar 'Aprendiz' por defecto

    //insertar usuario
    const query = `INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, correo_personal, password_hash, rol) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await connection.execute(query, [
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      correo_personal.trim(),
      password_hash,
      valorRol
    ]);

    return { success: true, message: "Usuario registrado exitosamente", Id: result.insertId };

  } catch (error) {
    // Error común: El correo o documento ya existen (si tienes llaves únicas)
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: "El usuario o correo ya están registrados.", status: 409 };
    }
    console.error("Error al registrar usuario:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = {RegistrarUsuarios};