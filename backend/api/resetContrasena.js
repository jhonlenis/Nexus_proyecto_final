// cspell:disable
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// 1. Definimos la configuración (Asegúrate de tener esto en tu .env)
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Interfaz para el resultado del SELECT
interface UsuarioVerificado {
  id: number;
}

// Interfaz para el error
interface MySqlError {
  message: string;
}

export async function PATCH(request: Request) {
  let connection;
  try {
    const { correo, codigo, nuevaPassword } = await request.json();
    connection = await mysql.createConnection(dbConfig);

    // 1. Validar el código y la expiración (Tipado seguro)
    const [resultRows] = await connection.execute(
      'SELECT id FROM usuarios WHERE correo_personal = ? AND codigo_2fa = ? AND expiracion_2fa > NOW()',
      [correo, codigo]
    );
    
    const usuarios = resultRows as UsuarioVerificado[];

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Código incorrecto o expirado" }, { status: 401 });
    }

    // 2. Si el 2FA es correcto, procedemos a cambiar la contraseña y limpiar el código
    // IMPORTANTE: Aquí usamos el ID obtenido del SELECT anterior
    await connection.execute(
      'UPDATE usuarios SET password_hash = ?, codigo_2fa = NULL, expiracion_2fa = NULL WHERE id = ?',
      [nuevaPassword, usuarios[0].id]
    );

    await connection.end();
    return NextResponse.json({ message: "Contraseña actualizada con éxito" });

  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    console.error("Error al resetear password:", dbError.message);
    
    return NextResponse.json(
      { error: dbError.message || "Error interno al resetear la contraseña" }, 
      { status: 500 }
    );
  }
}