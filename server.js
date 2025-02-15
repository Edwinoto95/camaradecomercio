const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');
const session = require('express-session');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave_secreta',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Middleware de autenticación
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Usuario simulado para pruebas
const users = [
    { username: 'camara', password: 'CoM3RCIO_25' }
];

// Conectar a MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB'))
  .catch(error => console.error('Error al conectar a MongoDB:', error));

// Middleware para redirigir intentos de acceso directo a archivos .html
app.use((req, res, next) => {
    if (req.path.endsWith('.html') && req.path !== '/login.html') {
        const newPath = req.path.replace('.html', '');
        return res.redirect(newPath);
    }
    next();
});

// Configurar archivos estáticos (solo para archivos CSS, JS, imágenes, etc.)
app.use(express.static(__dirname, {
    index: false,
    extensions: ['css', 'js', 'jpg', 'png', 'gif', 'ico'],
}));

// Ruta raíz - redirige según el estado de autenticación
app.get('/', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Ruta para el index (protegida)
app.get('/index', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de login
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/index');
    }
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Autenticación
app.post('/auth', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).send('<script>alert("Credenciales incorrectas"); window.location.href="/login";</script>');
    }

    req.session.user = username;
    res.redirect('/index');
});

// Cerrar sesión
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login');
    });
});

// Rutas protegidas (sin .html)
app.get('/asistentes', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'asistentes.html'));
});

app.get('/eventos', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'eventos.html'));
});

app.get('/premio', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'premio.html'));
});

// Ruta de captura para cualquier intento de acceso no autorizado
app.get('*.html', (req, res) => {
    res.redirect('/login');
});

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD
    }
});

// Ruta para enviar correos (protegida)
app.post('/enviar-correo', requireAuth, (req, res) => {
    const { email, evento, fecha } = req.body;
    
    const mailOptions = {
        from: process.env.EMAIL_HOST_USER,
        to: email,
        subject: `Notificación de la Camara De Comercio De Latacunga : ${evento}`,
        text: `🔔 Hola,Le enviamos un cordial saludo  \n\nLe informamos sobre un evento: ${evento}\nFecha: ${fecha}\n\n¡Esperamos contar con tu participación! Si necesitas más información, contáctanos.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Error al enviar correo' });
        }
        console.log('Correo enviado: ' + info.response);
        res.status(200).json({ message: 'Correo enviado con éxito' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});