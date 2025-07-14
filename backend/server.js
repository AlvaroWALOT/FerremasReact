const express = require('express');
const mysql = require('mysql2/promise'); // Usamos la versión promise-based
const path = require('path');
const cors = require('cors'); // Añade esta línea para importar cors

const app = express();
const PORT = 3006;

// Configuración de middleware
app.use(cors());
app.use(express.json());
// Servir archivos estáticos desde la carpeta public
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Configuración de la base de datos Ferremas
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tienda', // Asegúrate que este es el nombre de tu BD
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión a la base de datos
pool.getConnection()
    .then(connection => {
        console.log('Conectado a la base de datos MySQL - Ferremas');
        connection.release();
    })
    .catch(err => {
        console.error('Error de conexión a MySQL:', err);
        process.exit(1);
    });

// Endpoint para obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.codigo_producto,
        c.nombre AS categoria,
        p.marca,
        p.nombre,
        p.descripcion,
        ROUND(p.precio, 0) AS precio,
        p.cantidad,
        p.imagen,
        DATE_FORMAT(p.fecha_actualizacion, '%d/%m/%Y') AS fecha_actualizacion
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.nombre
    `);

        res.json(rows);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Endpoint para buscar productos
app.get('/api/productos/buscar', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
    }

    try {
        const [rows] = await pool.query(`
      SELECT 
        id,
        codigo_producto,
        marca,
        nombre,
        precio,
        cantidad,
        imagen
      FROM productos
      WHERE nombre LIKE ? OR marca LIKE ? OR codigo_producto LIKE ?
      LIMIT 20
    `, [`%${q}%`, `%${q}%`, `%${q}%`]);

        res.json(rows);
    } catch (err) {
        console.error('Error al buscar productos:', err);
        res.status(500).json({ error: 'Error al buscar productos' });
    }
});

// Endpoint para obtener productos por categoría
app.get('/api/productos/categoria/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(`
      SELECT 
        id,
        codigo_producto,
        marca,
        nombre,
        precio,
        cantidad,
        imagen
      FROM productos
      WHERE categoria_id = ?
    `, [id]);

        res.json(rows);
    } catch (err) {
        console.error('Error al obtener productos por categoría:', err);
        res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
});

// Endpoint para obtener un producto específico
app.get('/api/productos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(`
      SELECT 
        p.*,
        c.nombre AS categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error al obtener producto:', err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// Endpoint para obtener categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        id,
        nombre,
        descripcion
      FROM categorias
      ORDER BY nombre
    `);

        res.json(rows);
    } catch (err) {
        console.error('Error al obtener categorías:', err);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Ferremas escuchando en http://localhost:${PORT}`);
});