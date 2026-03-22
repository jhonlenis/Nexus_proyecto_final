// cspell:disable
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

interface MySqlError { message: string; }

// GET: Obtener todos los programas para el Admin y el Catálogo
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // Traemos todos los campos necesarios para las tarjetas del frontend
    const [rows] = await connection.execute('SELECT id, nombre, descripcion, fecha_inicio, estado FROM programa ORDER BY id DESC');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}

// POST: Para que tú como Admin agregues nuevos programas
export async function POST(request: Request) {
  let connection;
  try {
    const { nombre, descripcion, fecha_inicio } = await request.json();
    
    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Insertamos con estado 'Disponible' por defecto
    await connection.execute(
      'INSERT INTO programa (nombre, descripcion, fecha_inicio, estado) VALUES (?, ?, ?, ?)', 
      [nombre, descripcion || 'Sin descripción', fecha_inicio || 'Por definir', 'Disponible']
    );

    await connection.end();
    return NextResponse.json({ message: "Programa creado con éxito" });
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}

// DELETE: Para eliminar programas definitivamente
export async function DELETE(request: Request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM programa WHERE id = ?', [id]);
    await connection.end();

    return NextResponse.json({ message: "Programa eliminado correctamente" });
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}