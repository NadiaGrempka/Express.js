const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

const doc = {
    info: {
        title: 'Product API',
        description: 'API for managing products.',
    },
    host: 'localhost:3002', // Zmień na odpowiednią domenę/port
    schemes: ['http'], // Możesz użyć 'https' w środowisku produkcyjnym
    basePath: '/', // Jeśli masz jakieś prefiksy, dostosuj to
};

// Ścieżka do plików, w których są trasy (np. router), które mają być dokumentowane
const outputFile = path.join(__dirname, 'swagger_output.json');
const endpointsFiles = [path.join(__dirname, 'app.js')]; // Ścieżka do głównego pliku z trasami (lub plików routerów)

swaggerAutogen(outputFile, endpointsFiles, doc);
