// cspell:disable
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Interfaz para manejar el tipado del error de MySQL
interface MySqlError {
  message: string;
}

export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, nombres, apellidos, correo_personal, rol FROM usuarios'
    );
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: unknown) {
    if (connection) await connection.end();
    // Convertimos el error unknown a nuestro tipo MySqlError
    const dbError = error as MySqlError;
    return NextResponse.json({ error: dbError.message || "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let connection;
  try {
    const { id, nuevoRol } = await request.json();
    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE usuarios SET rol = ? WHERE id = ?',
      [nuevoRol, id]
    );
    await connection.end();
    return NextResponse.json({ message: "Rol actualizado" });
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    return NextResponse.json({ error: dbError.message || "Error al actualizar el rol" }, { status: 500 });
  }
}