const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mysql = require('mysql2/promise');

dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME

};

// funcion para el receteo de contraseña, se le pasara el correo del usuario y se le enviara un correo con un codigo para restablecer la contraseña
async function resetPassword(correo_personal) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Verificar si el correo existe en la base de datos
    const [rows] = await connection.execute('SELECT id FROM usuarios WHERE correo_personal = ?', [correo_personal]);
    if (rows.length === 0) {
      return { success: false, error: "Correo no esta registrado.", status: 404 };
    }

    // Generar un código de restablecimiento (puedes usar una librería como uuid o generar un código aleatorio)
    const codeToken = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos

    await connection.execute('UPDATE usuarios SET codigo_2fa = ? WHERE correo_personal = ?', [codeToken, correo_personal]);

    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configurar el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo_personal,
      subject: "Recuperación de Contraseña - Sena un Clic",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px; border: 1px solid #eee; border-radius: 20px; max-width: 500px; margin: auto;">
          <h2 style="color: #16a34a; text-align: center;">SENA UN CLIC</h2>
          <p>Usa el siguiente código para restablecer tu contraseña:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="color: #16a34a; font-size: 45px; letter-spacing: 10px; margin: 0;">${codeToken}</h1>
          </div>
          <p style="font-size: 12px; color: #777; text-align: center;">Este código vence en 10 minutos.</p>
        </div>
      `
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Correo de restablecimiento enviado." };

  } catch (error) {
    console.error("Error en resetPassword:", error);
    return { success: false, error: "Error interno en el servidor", status: 500 };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
module.exports = { resetPassword };