import express from "express";
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from "path";
import { results as agents } from './data/agentes.js';
const app = express();
const port = 3000;
const SECRET_KEY = "clave_secreta"; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/SignIn', (req, res) => {
    const { email, password } = req.body;
    console.log('Datos recibidos:', req.body); 
    const agent = agents.find(a => a.email === email && a.password === password);

    if (agent) {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '2m' });
        res.redirect(`/dashboard?token=${token}`);
    } else {
        res.status(401).send('Credenciales incorrectas');
    }
});


app.get('/dashboard', (req, res) => {
    const token = req.query.token;

    if (token) {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>FBI System - Dashboard</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
              </head>
              <body>
                <h1>&#128374; FBI System &#128374;</h1>
                <div class="card bg-dark text-center">
                  <div class="card-body">
                    <p style=>Email autorizado: ${jwt.decode(token).email}</p>
                    <script>
                        sessionStorage.setItem('token', '${token}');
                        setTimeout(() => sessionStorage.removeItem('token'), 2 * 60 * 1000); // Expira en 2 minutos
                    </script>
                    <a href="/restricted?token=${token}" class="btn bg-light my-3">Ir a ruta restringida</a>
                  </div>
                </div>
              </body>
               <style>
                    * {
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        background: black;
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        height: 60vh;
                    }
                </style>
            </html>
        `);
    } else {
        res.status(401).send('Token no proporcionado.');
    }
});

app.get('/restricted', (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(401).send('Token no proporcionado');
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send('Token inválido');
        }
        res.send(`Bienvenido, Agente Especial ${decoded.email}. Misión Cumplida`);
    });
});


app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));