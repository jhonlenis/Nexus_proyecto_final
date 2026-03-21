// cspell:disable
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

interface UsuarioRow extends RowDataPacket {
  id: number;
  nombres: string;
  apellidos: string;
  password_hash: string;
  rol: string;
  correo_personal: string;
}

// 1. Definimos una interfaz para el error de MySQL
interface MySqlError {
  message: string;
}

export async function POST(request: Request) {
  let connection;
  try {
    const { tipo_documento, numero_documento, correo, password } = await request.json();

    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute<UsuarioRow[]>(
      'SELECT id, nombres, apellidos, password_hash, rol FROM usuarios WHERE tipo_documento = ? AND numero_documento = ? AND correo_personal = ?',
      [tipo_documento, numero_documento, correo.trim()]
    );

    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 401 });
    }

    const usuario = rows[0];

    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) {
      await connection.end();
      return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
    }

    await connection.end();

    return NextResponse.json({ 
      message: "Login exitoso",
      user: { 
        id: usuario.id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`, 
        rol: usuario.rol 
      }
    }, { status: 200 });

  } catch (error: unknown) {
    // 2. Cerramos la conexión si existe
    if (connection) await connection.end();
    
    // 3. Convertimos el error de forma segura (Type Casting)
    const err = error as MySqlError;
    console.error("Error en login:", err.message);

    return NextResponse.json(
      { error: "Error en el servidor: " + (err.message || "Error desconocido") }, 
      { status: 500 }
    );
  }
}