const express = require('express');
const app = express();
const path = require('path');
const productsRouter = require('./routes/products');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json'); // Plik wygenerowany przez swagger-autogen

app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Użyj routera produktów
app.use('/products', productsRouter);

// Trasa domyślna
app.get('/', (req, res) => {
    res.send('Witaj w aplikacji Express!');
});

// Obsługa błędów
app.use((req, res) => {
    res.status(404).json({ message: 'Nie znaleziono' });
});

// Uruchomienie serwera
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
