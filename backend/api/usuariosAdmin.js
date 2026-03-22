// cspell:disable
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

interface DBError { message: string; }

export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, nombres, apellidos, correo_personal, rol FROM usuarios');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as DBError;
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let connection;
  try {
    const { id, nuevoRol } = await request.json();
    connection = await mysql.createConnection(dbConfig);
    
    // Actualizamos al nuevo rol (sea Administrador, Aprendiz o Coordinador)
    await connection.execute('UPDATE usuarios SET rol = ? WHERE id = ?', [nuevoRol, id]);
    
    await connection.end();
    return NextResponse.json({ message: "Rol actualizado con éxito" });
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as DBError;
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}