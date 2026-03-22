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

// GET: Obtener programas
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, nombre, sector FROM programas ORDER BY id DESC');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as DBError;
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}

// POST: Crear programa
export async function POST(request: Request) {
  let connection;
  try {
    const { nombre, sector } = await request.json();
    connection = await mysql.createConnection(dbConfig);
    await connection.execute('INSERT INTO programas (nombre, sector) VALUES (?, ?)', [nombre, sector]);
    await connection.end();
    return NextResponse.json({ message: "Creado" });
  } catch (error: unknown) {
    if (connection) await connection.end();
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}

// PUT: Modificar programa existente
export async function PUT(request: Request) {
  let connection;
  try {
    const { id, nombre, sector } = await request.json();
    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE programas SET nombre = ?, sector = ? WHERE id = ?',
      [nombre, sector, id]
    );
    await connection.end();
    return NextResponse.json({ message: "Actualizado" });
  } catch (error: unknown) {
    if (connection) await connection.end();
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE: Eliminar programa
export async function DELETE(request: Request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM programas WHERE id = ?', [id]);
    await connection.end();
    return NextResponse.json({ message: "Eliminado" });
  } catch (error: unknown) {
    if (connection) await connection.end();
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}