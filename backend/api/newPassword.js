const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Carga las variables del archivo .env

dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME

};

async function newPassword(correo_personal, codigo_2fa, nuevaPassword) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Verificar si el correo y el código 2FA coinciden en la base de datos
    const [rows] = await connection.execute('SELECT id FROM usuarios WHERE correo_personal = ? AND codigo_2fa = ?', [correo_personal, codigo_2fa]);
    if (rows.length === 0) {
      return {
        success: false,
        message: "El código de verificación es incorrecto o ha expirado.",
        status: 401
      };
    }

    const userId = rows[0].id;

    // Encriptar la nueva contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(nuevaPassword, saltRounds);

    // Actualizar la contraseña en la base de datos y limpiar el código 2FA
    await connection.execute('UPDATE usuarios SET password_hash = ?, codigo_2fa = NULL WHERE id = ?', [password_hash, userId]);

    return {
      success: true,
      message: "Contraseña actualizada con éxito. Ya puedes iniciar sesión."
    };

  } catch (error) {
    console.error("Error en la función newPassword:", error.message);
    return {
      success: false,
      message: "Error técnico al actualizar la contraseña.",
      status: 500
    };
  } finally {
    if (connection) await connection.end();
  }
}


module.exports = { newPassword };