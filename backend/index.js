require('dotenv').config();

const mysql = require('mysql2')
const cors = require('cors');
const express = require('express');
// IMPORTACIÓN COMMONJS (No necesitas poner .js obligatoriamente aquí)
const { ValidarUsuario } = require('./api/login');
const { RegistrarUsuarios } = require('./api/registro');
const { ObtenerProgramasAdmin } = require('./api/programasAdmin');
const { ObtenerTodosLosUsuarios } = require('./api/usuariosAdmin');
const { resetPassword } = require('./api/resetContrasena');
const { newPassword } = require('./api/newPassword');
const { obtenerInscripciones, inscripciones } = require('./api/inscripciones');
const { chatbot } = require('./api/chatbot');
const { ObtenerProgramasUser } = require('./api/programas');

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

//endpoint principal
app.get('/', async (req, res) => {
  const mensaje = "hola desde ruta principal"
  try {
    return res.status(200).json({
      success: true,
      message: mensaje
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor"
    });

  }
})

// Endpoint para login
app.post('/api/login', async (req, res) => {
  try {
    const resultado = await ValidarUsuario(req.body);

    if (!resultado.success) {
      return res.status(resultado.status).json({
        success: false,
        message: resultado.error
      });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor"
    });
  }
});

// Endpoint para registrar nuevos usuarios
app.post('/api/registro', async (req, res) => {
  try {
    console.log("Recibiendo solicitud para", req.body.correo_personal);

    const resultado = await RegistrarUsuarios(req.body);
    // comprobar si el valor recibido es correcto
    if (!resultado.success) {
      return res.status(resultado.status || 400).json(resultado);
    }

    res.status(201).json(resultado);


  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al registrar usuario"
    });
  }
})

// Endpoint para obtener usuarios (solo para admin)
app.get('/api/usuariosAdmin', async (req, res) => {
  try {
    const resultado = await ObtenerTodosLosUsuarios();

    // Devolvemos la lista de usuarios con estatus 200 (OK)
    res.status(200).json(resultado.data || []);

  } catch (error) {
    res.status(500).json([]);
  }
});

// Endpoint para obtener programas (solo para admin)
app.get('/api/programasAdmin', async (req, res) => {
  try {
    const resultado = await ObtenerProgramasAdmin();

    // Devolvemos la lista de programas con estatus 200 (OK)
    res.status(200).json(resultado.data || []);

  } catch (error) {
    res.status(500).json([])
  }
});

// Endpoint para solicitar restablecimiento de contraseña
app.post('/api/resetContrasena', async (req, res) => {
  // Implement the reset password logic here
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({
      success: false,
      message: "El correo es requerido"
    });
  }
  try {
    const resultado = await resetPassword(correo);
    if (resultado.success) {
      res.status(200).json(resultado);
    } else {
      res.status(400).json(resultado);
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al enviar correo de restablecimiento"
    });
  }
});

// endpoint para actualizar la contraseña después de verificar el código 2FA
app.patch('/api/newPassword', async (req, res) => {
  const { correo_personal, codigo_2fa, nuevaPassword } = req.body;
  try {
    const resultado = await newPassword(correo_personal, codigo_2fa, nuevaPassword);
    if (resultado.success) {
      res.status(200).json(resultado);
    } else {
      res.status(resultado.status || 400).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la contraseña"
    });
  }
});

//endpoint para obtener inscripciones
app.get('/api/inscripciones', async (req, res) => {
  try {
    resultado = await obtenerInscripciones();
    res.status(200).json(resultado);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener inscripciones"
    });
    console.log("✖️  Error al obtener inscripciones:", error);
  }
});

// endpoint para inscribirse a un programa
app.post('/api/inscripciones', async (req, res) => {
  const { programa, usuario_id } = req.body
  try {
    const resultado = await inscripciones(programa, usuario_id);
    if (resultado.success) {
      res.status(200).json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post('/api/chatbot', async (req, res) => {
  const { mensaje, userId } = req.body; // Aquí es donde obtienes los datos del body

  try {
    const resultado = await chatbot(mensaje, userId);
    res.json(resultado);
    console.log("mensaje:", mensaje);
    console.log("userId:", userId);
    console.log(resultado);
    
  } catch (error) {
    res.status(500).json({ success: false, respuesta: "Error en el servidor" });
  }
});

app.get('/api/programas', async (req, res) => {
  try {
    const resultado = await ObtenerProgramasUser();
    res.status(200).json(resultado);

    return { data: resultado, success: true };


  } catch (error) {
    console.error("Error al extraer los programas:", error);
    res.status(500).json({
      success: false,
      respuesta: "Error al extraer los programas"
    });
  }
});

app.get('/api/search', async (req, res) => {
  const { query } = req.query;

  try {
    const resultado = await searchPrograms(query);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al buscar programas:", error);
    res.status(500).json({
      success: false,
      respuesta: "Error al buscar programas"
    });
  }
});

// --- ARRANCAR SERVIDOR ---
const PORT = 9000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`✅ CORS habilitado para el frontend`);
});
