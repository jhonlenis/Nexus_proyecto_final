import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

/* cSpell:disable */

// Configuración de conexión directa desde .env.local
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Interfaz para el error de MySQL
interface MySqlError {
  code?: string;
  message?: string;
}

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { nombres, apellidos, tipo_documento, numero_documento, correo_personal, password, rol } = body;

    // Abrimos la conexión con MySQL
    connection = await mysql.createConnection(dbConfig);

    // 1. Encriptar la contraseña (Seguridad ADSO)
    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Insertar en la tabla 'usuarios'
    await connection.execute(
      'INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, correo_personal, password_hash, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombres, apellidos, tipo_documento, numero_documento, correo_personal, passwordHash, rol || 'Aprendiz']
    );

    // Cerramos la conexión antes de responder
    await connection.end();

    return NextResponse.json({ message: "Usuario creado con éxito" }, { status: 201 });

  } catch (error: unknown) {
    // Cerramos la conexión si quedó abierta en caso de error
    if (connection) await connection.end();
    
    // Tipamos el error para evitar el 'any'
    const dbError = error as MySqlError;
    console.error("Error en registro:", dbError.message);

    // Validación de duplicados (Documento o Correo)
    if (dbError.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: "El correo o documento ya están registrados en la base de datos." }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error técnico al crear la cuenta. Inténtalo más tarde." }, 
      { status: 500 }
    );
  }
}