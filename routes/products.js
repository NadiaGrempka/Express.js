const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const productsFilePath = path.join(__dirname, '../products.json');

const getProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data).products;
};

const saveProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify({ products }, null, 2));
};

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Pobierz listę produktów
 *     description: Zwraca wszystkie dostępne produkty.
 *     responses:
 *       200:
 *         description: Lista wszystkich produktów
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   unitPrice:
 *                     type: number
 *                   quantity:
 *                     type: integer
 *                   supplier:
 *                     type: string
 *       404:
 *         description: Brak produktów
 */
router.get('/', (req, res) => {
    const products = getProducts();
    res.json(products);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Dodaj nowy produkt
 *     description: Tworzy nowy produkt i dodaje go do listy produktów.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nazwa produktu
 *               category:
 *                 type: string
 *                 description: Kategoria produktu
 *               unitPrice:
 *                 type: number
 *                 description: Cena jednostkowa produktu
 *               quantity:
 *                 type: integer
 *                 description: Ilość dostępnych sztuk
 *               supplier:
 *                 type: string
 *                 description: Dostawca produktu
 *             required:
 *               - name
 *               - category
 *               - unitPrice
 *               - quantity
 *               - supplier
 *             example:
 *               name: "Nowy Smartfon XYZ"
 *               category: "Elektronika"
 *               unitPrice: 399.99
 *               quantity: 25
 *               supplier: "TechSupplier Co."
 *     responses:
 *       201:
 *         description: Produkt został pomyślnie dodany
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Unikalne ID nowo utworzonego produktu
 *                 name:
 *                   type: string
 *                 category:
 *                   type: string
 *                 unitPrice:
 *                   type: number
 *                 quantity:
 *                   type: integer
 *                 supplier:
 *                   type: string
 *             example:
 *               id: 5
 *               name: "Nowy Smartfon XYZ"
 *               category: "Elektronika"
 *               unitPrice: 399.99
 *               quantity: 25
 *               supplier: "TechSupplier Co."
 *       400:
 *         description: Błąd walidacji danych wejściowych
 */
router.post('/', (req, res) => {
    const products = getProducts();
    const newProduct = { id: products.length + 1, ...req.body };

    products.push(newProduct);
    saveProducts(products);

    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Usuń produkt
 *     description: Usuwa produkt na podstawie ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID produktu
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produkt został usunięty
 *       404:
 *         description: Produkt nie znaleziony
 */
router.delete('/:id', (req, res) => {
    let products = getProducts();
    const productId = parseInt(req.params.id, 10);

    if (!products.some(p => p.id === productId)) {
        return res.status(404).json({ message: 'Produkt nie znaleziony [delete]' });
    }

    products = products.filter(p => p.id !== productId);
    saveProducts(products);

    res.status(200).json({ message: 'Produkt usunięty' });
});

/**
* @swagger
* /products/{id}:
*   put:
    *     summary: Zaktualizuj produkt
*     description: Aktualizuje szczegóły istniejącego produktu na podstawie ID.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: ID produktu
*         schema:
*           type: integer
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
    *             type: object
*             properties:
*               name:
    *                 type: string
*               category:
*                 type: string
*               unitPrice:
*                 type: number
*               quantity:
*                 type: integer
*               supplier:
*                 type: string
*     responses:
*       200:
*         description: Zaktualizowany produkt
*       404:
*         description: Produkt nie znaleziony
*/
router.put('/:id', (req, res) => {
    let products = getProducts();
    const productId = parseInt(req.params.id, 10);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produkt nie znaleziony [put id]' });
    }

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Nieprawidłowe dane w żądaniu' });
    }

    const { name, category, quantity, unitPrice, dateAdded, supplier } = req.body;

    if (!name || !category || quantity == null || unitPrice == null || !dateAdded || !supplier) {
        return res.status(400).json({ message: 'Brakuje wymaganych pól' });
    }

    const updatedProduct = { id: productId, name, category, quantity, unitPrice, dateAdded, supplier };
    products[productIndex] = updatedProduct;
    saveProducts(products);

    res.status(200).json(updatedProduct);
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Częściowa aktualizacja produktu
 *     description: Pozwala na częściową aktualizację produktu na podstawie ID. Można zaktualizować tylko wybrane właściwości.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID produktu
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               supplier:
 *                 type: string
 *             example:
 *               name: "Nowy Smartfon XYZ"
 *               unitPrice: 350.00
 *     responses:
 *       200:
 *         description: Zaktualizowany produkt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 category:
 *                   type: string
 *                 unitPrice:
 *                   type: number
 *                 quantity:
 *                   type: integer
 *                 supplier:
 *                   type: string
 *       404:
 *         description: Produkt nie znaleziony
 *       400:
 *         description: Błąd w danych wejściowych
 */
router.patch('/:id', (req, res) => {
    let products = getProducts();
    const productId = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ message: 'Produkt nie znaleziony [patch]' });
    }

    Object.assign(product, req.body);
    saveProducts(products);

    res.status(200).json(product);
});

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Wyszukiwanie produktów
 *     description: Zwraca listę produktów na podstawie parametrów wyszukiwania.
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         description: Filtruj po kategorii produktu
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         required: false
 *         description: Filtruj po minimalnej cenie
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         description: Filtruj po maksymalnej cenie
 *         schema:
 *           type: number
 *       - in: query
 *         name: supplier
 *         required: false
 *         description: Filtruj po dostawcy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista produktów pasujących do zapytania
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   unitPrice:
 *                     type: number
 *                   quantity:
 *                     type: integer
 *                   supplier:
 *                     type: string
 *       404:
 *         description: Brak produktów spełniających kryteria
 */
router.get('/search', (req, res) => {
    console.log("endpoint search")
    const { category, minPrice, maxPrice, supplier } = req.query;
    let products = getProducts();

    console.log('Zapytanie query:', req.query);
    console.log('Lista produktów przed filtrowaniem:', products);

    if (category) {
        products = products.filter(product =>
            product.category && product.category.toLowerCase() === category.toLowerCase()
        );
    }

    if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) {
            products = products.filter(product =>
                product.unitPrice != null && product.unitPrice >= min
            );
        } else {
            return res.status(400).json({ message: 'minPrice musi być liczbą' });
        }
    }

    if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) {
            products = products.filter(product =>
                product.unitPrice != null && product.unitPrice <= max
            );
        } else {
            return res.status(400).json({ message: 'maxPrice musi być liczbą' });
        }
    }

    if (supplier) {
        products = products.filter(product =>
            product.supplier && product.supplier.toLowerCase() === supplier.toLowerCase()
        );
    }
    console.log('Lista produktów po filtrowaniu:', products);

    if (products.length === 0) {
        return res.json([]);
    }

    res.json(products);
});


/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Pobierz pojedynczy produkt
 *     description: Zwraca szczegóły produktu na podstawie ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID produktu
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produkt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 category:
 *                   type: string
 *                 unitPrice:
 *                   type: number
 *                 quantity:
 *                   type: integer
 *                 supplier:
 *                   type: string
 *       404:
 *         description: Produkt nie znaleziony
 */
router.get('/:id', (req, res) => {
    console.log("get id: ", req.query);
    const products = getProducts();
    const product = products.find(p => p.id === parseInt(req.params.id, 10));
    if (!product) {
        return res.status(404).json({ message: 'Produkt nie znaleziony [get id]' });
    }
    res.json(product);
});

module.exports = router;
