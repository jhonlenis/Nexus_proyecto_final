// cspell:disable
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

// 1. CONFIGURACIÓN DE DB (Usa tus variables de .env.local)
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// 2. FUNCIÓN GENERADORA (Unificada)
function generarCodigo(longitud: number): string {
  const caracteres = '0123456789';
  let codigo = '';
  for (let i = 0; i < longitud; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

interface UsuarioDB { nombres: string; }

export async function POST(request: Request) {
  let connection;
  try {
    const { correo } = await request.json();
    
    // 3. CONEXIÓN A MYSQL
    connection = await mysql.createConnection(dbConfig);

    // Verificamos si el usuario existe
    const [rows] = await connection.execute(
      'SELECT nombres FROM usuarios WHERE correo_personal = ?', 
      [correo]
    );
    const usuarios = rows as UsuarioDB[];

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Correo no registrado" }, { status: 404 });
    }

    // 4. GENERAR CÓDIGO Y EXPIRACIÓN
    const codigoGenerado = generarCodigo(6);
    const expiracion = new Date(Date.now() + 10 * 60000); // 10 minutos

    // 5. GUARDAR EN BASE DE DATOS (Crucial para validar después)
    await connection.execute(
      'UPDATE usuarios SET codigo_2fa = ?, expiracion_2fa = ? WHERE correo_personal = ?',
      [codigoGenerado, expiracion, correo]
    );

    // 6. CONFIGURACIÓN DE NODEMAILER (Tu configuración de app.js)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: "senaaunclic5@gmail.com", // Tu cuenta emisora
        pass: "fcznoxhitxclstkq" // Tu clave de aplicación
      },
      tls: {
        rejectUnauthorized: false // Evita errores de certificado
      }
    });

    // 7. CONTENIDO DEL CORREO
    const mailOptions = {
      from: '"SENA UN CLIC" <senaaunclic5@gmail.com>',
      to: correo, // Se envía al correo que el usuario puso en el input
      subject: `Tu código de verificación: ${codigoGenerado}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px; border: 1px solid #eee; border-radius: 20px; max-width: 500px; margin: auto;">
          <h2 style="color: #16a34a; text-align: center;">SENA UN CLIC</h2>
          <p>Hola <b>${usuarios[0].nombres}</b>,</p>
          <p>Usa el siguiente código para restablecer tu contraseña:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="color: #16a34a; font-size: 45px; letter-spacing: 10px; margin: 0;">${codigoGenerado}</h1>
          </div>
          <p style="font-size: 12px; color: #777; text-align: center;">Este código vence en 10 minutos.</p>
        </div>
      `
    };

    // 8. ENVÍO FINAL
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: "Código enviado correctamente al correo" 
    });

  } catch (error: unknown) {
    console.error("Error detallado:", (error as Error).message);
    return NextResponse.json({ 
      success: false, 
      error: "Error en el servidor: " + (error as Error).message 
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}