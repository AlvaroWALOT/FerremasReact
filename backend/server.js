const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');
const https = require('https'); // Usamos el módulo nativo https
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require('transbank-sdk');

// Configuración de Webpay
const tx = new WebpayPlus.Transaction(
    new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
    )
);
const app = express();
const PORT = 3006;

// Configuración de middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Configuración de la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tienda',
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

// Endpoint para pagar 
app.post('/api/pagar', async (req, res) => {
    const carrito = req.body.carrito;

    if (!carrito || carrito.length === 0) {
        return res.status(400).json({ error: 'El carrito está vacío.' });
    }

    try {
        const total = Math.round(carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0));

        if (total <= 0) {
            return res.status(400).json({ error: 'El monto total debe ser mayor que 0.' });
        }

        const buyOrder = 'ORD' + Date.now();
        const sessionId = 'SESS' + Date.now();
        const returnUrl = 'http://localhost:5173/pago-resultado';

        const response = await tx.create(buyOrder, sessionId, total, returnUrl);

        await pool.query(
            'INSERT INTO transacciones (buy_order, session_id, amount, token, status) VALUES (?, ?, ?, ?, ?)',
            [buyOrder, sessionId, total, response.token, 'CREATED']
        );

        res.json({
            url: response.url,
            token: response.token
        });

    } catch (err) {
        console.error('Error en transacción:', err);
        res.status(500).json({
            error: 'Error al iniciar la transacción',
            details: err.message
        });
    }
});

// Endpoint para manejar la respuesta de Webpay
app.post('/api/webpay/confirm', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token no proporcionado' });
        }

        const tx = new WebpayPlus.Transaction(
            new Options(
                IntegrationCommerceCodes.WEBPAY_PLUS,
                IntegrationApiKeys.WEBPAY,
                Environment.Integration
            )
        );

        const response = await tx.commit(token);

        await pool.query(
            'UPDATE transacciones SET status = ?, response = ? WHERE token = ?',
            [response.status, JSON.stringify(response), token]
        );

        res.json({
            success: response.status === "AUTHORIZED",
            response
        });

    } catch (err) {
        console.error("Error confirmando transacción:", err);
        res.status(500).json({
            error: 'Error confirmando transacción',
            details: err.message
        });
    }
});

// Endpoint optimizado para obtener el tipo de cambio
app.get('/api/tipo-cambio', (req, res) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    const url = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=alv.castroc@duocuc.cl&pass=Puchacabros13&function=GetSeries&timeseries=F073.TCO.PRE.Z.D&firstDate=${formattedDate}&type=json`;

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const parsedData = JSON.parse(data);

                // Verificamos si hay datos y si el código de respuesta es 0 (éxito)
                if (parsedData.Codigo === 0 && parsedData.Series?.Obs?.length > 0) {
                    // Tomamos el último valor disponible (el más reciente)
                    const latestRate = parsedData.Series.Obs[0];
                    res.json({
                        value: parseFloat(latestRate.value),
                        date: latestRate.indexDateString,
                        status: "OK"
                    });
                } else {
                    res.status(404).json({
                        error: "No se encontraron datos de tipo de cambio",
                        details: parsedData.Descripcion || "Respuesta inesperada del servidor"
                    });
                }
            } catch (error) {
                res.status(500).json({
                    error: "Error procesando respuesta",
                    details: error.message
                });
            }
        });
    }).on('error', (error) => {
        res.status(500).json({
            error: "Error en la conexión",
            details: error.message
        });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Ferremas escuchando en http://localhost:${PORT}`);
});