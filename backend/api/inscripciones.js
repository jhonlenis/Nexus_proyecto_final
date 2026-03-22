// cspell:disable
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

interface MySqlError {
  message: string;
}

// GET: Obtener solo las inscripciones DEL USUARIO QUE INICIÓ SESIÓN
export async function GET(request: Request) {
  let connection;
  try {
    // 1. Extraemos el usuario_id de la URL (ej: /api/inscripciones?usuario_id=5)
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuario_id');

    // Si no mandan el ID, no sabemos qué mostrar
    if (!usuarioId) {
      return NextResponse.json({ error: "No se proporcionó ID de usuario" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // 2. FILTRADO CRÍTICO: Agregamos el WHERE id_usuario = ?
    const [rows] = await connection.execute(
      'SELECT * FROM inscripciones WHERE id_usuario = ? ORDER BY fecha_inscripcion DESC',
      [usuarioId]
    );
    
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}

// POST: Crear inscripción vinculada al usuario real
export async function POST(request: Request) {
  let connection;
  try {
    const { programa, usuario_id } = await request.json();
    
    if (!usuario_id) {
      return NextResponse.json({ error: "Sesión no válida" }, { status: 401 });
    }

    connection = await mysql.createConnection(dbConfig);

    // Validación: ¿Este usuario específico ya tiene este programa?
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM inscripciones WHERE id_usuario = ? AND programa = ?',
      [usuario_id, programa]
    );

    if (rows.length > 0) {
      await connection.end();
      return NextResponse.json({ error: "Ya estás registrado en este programa" }, { status: 400 });
    }

    // Inserción con el ID real
    await connection.execute(
      'INSERT INTO inscripciones (id_usuario, programa, estado) VALUES (?, ?, ?)',
      [usuario_id, programa, 'Inscrito']
    );

    await connection.end();
    return NextResponse.json({ message: "Inscripción exitosa" });

  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}