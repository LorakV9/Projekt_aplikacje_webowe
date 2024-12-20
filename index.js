const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const { readFile } = require('fs').promises;

const app = express();
app.use(express.json());
app.use(cors());
const path = require('path');  // Dodaj ten wiersz, aby zaimportować moduł path


app.use(express.static(path.join(__dirname, 'public')));

// Połączenie z bazą danych
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projekt'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySql połączone');
});

const session = require('express-session');

app.use(session({
    secret: 'your_secret_key', // Zmienna kluczowa dla szyfrowania
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Użyj `true` dla HTTPS
}));


app.get('/', (req, res) => {
    res.redirect('/login'); // Przekierowanie na stronę logowania
});


// Endpoint do wyświetlania home.html (formularz logowania)
app.get('/login', async (req, res) => {
    try {
        const html = await readFile('./views/logo.html', 'utf8');
        res.send(html);
    } catch (err) {
        console.error('Błąd przy wczytywaniu pliku HTML:', err);
        res.status(500).send('Wystąpił błąd serwera.');
    }
});

app.get('/sklep', async (req, res) => {
    try {
        const html = await readFile('./views/sklep.html', 'utf8');
        res.send(html);
    } catch (err) {
        console.error('Błąd przy wczytywaniu pliku HTML:', err);
        res.status(500).send('Wystąpił błąd serwera.');
    }
});

// Endpoint logowania użytkownika
app.post('/login', (req, res) => {
    const { email, haslo } = req.body;

    if (!email || !haslo) {
        return res.status(400).json({ message: 'Wprowadź email i hasło.' });
    }

    const query = 'SELECT * FROM urzytkownik WHERE email = ? AND haslo = ?';
    db.query(query, [email, haslo], (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).json({ message: 'Błąd serwera.' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Zapis ID użytkownika do sesji
            req.session.userId = user.id;

            res.json({ message: 'Logowanie udane.', user });
        } else {
            res.status(401).json({ message: 'Nieprawidłowy email lub hasło.' });
        }
    });
});


// 3. Rejestracja użytkownika (dodawanie do tabeli urzytkownik)
app.post('/rejestracja', (req, res) => {
    const { imie, nazwisko, email, haslo } = req.body;
    const query = 'INSERT INTO urzytkownik (imie, nazwisko, email, haslo, rola) VALUES (?, ?, ?, ?, "user")';
    db.query(query, [imie, nazwisko, email, haslo], (err, results) => {
        if (err) throw err;
        res.json({ message: 'Rejestracja zakończona sukcesem', userId: results.insertId });
    });
});


// Endpoint do wyświetlania home.html (formularz logowania)
app.get('/rejestracja', async (req, res) => {
    try {
        const html = await readFile('./views/rejestracja.html', 'utf8');
        res.send(html);
    } catch (err) {
        console.error('Błąd przy wczytywaniu pliku HTML:', err);
        res.status(500).send('Wystąpił błąd serwera.');
    }
});

app.get('/api/categories', (req, res) => {
    const query = 'SELECT name FROM categories'; // zapytanie SQL
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Błąd serwera');
        } else {
            res.json(results); // Zwraca kategorie jako JSON
        }
    });
});

app.get('/api/products', (req, res) => {
    const query = 'SELECT productid, name, price FROM products'; // Zapytanie SQL do pobrania nazw i cen produktów
    db.query(query, (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            res.status(500).send('Błąd serwera');
        } else {
            console.log('Produkty z bazy danych:', results); // Logowanie odpowiedzi z bazy danych
            res.json(results); // Zwróć produkty w formacie JSON
        }
    });
});




app.post('/api/add-to-cart', (req, res) => {
    const { productid, amount } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Musisz być zalogowany, aby wykonać tę operację.' });
    }

    console.log('Otrzymane dane do dodania do koszyka:', { productid, amount, userId }); // Logujemy dane

    // Pobieramy nazwę i cenę produktu
    const query = 'SELECT name, price FROM products WHERE productid = ?';

    db.query(query, [productid], (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Produkt nie znaleziony.' });
        }

        const { name, price } = results[0];
        console.log('Znaleziony produkt:', { name, price });

        // Dodajemy produkt do koszyka
        const insertQuery = 'INSERT INTO koszyk (productid, name, price, amount, user_id) VALUES (?, ?, ?, ?, ?)';

        db.query(insertQuery, [productid, name, price, amount, userId], (err, result) => {
            if (err) {
                console.error('Błąd dodawania do koszyka:', err);
                return res.status(500).json({ error: 'Błąd serwera' });
            }

            console.log('Produkt dodany do koszyka:', result);
            res.status(200).json({ message: 'Produkt dodany do koszyka' });
        });
    });
});

app.post('/api/remove-from-cart', (req, res) => {
    const { productid } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Musisz być zalogowany, aby wykonać tę operację.' });
    }

    // Zapytanie do usunięcia produktu z koszyka w bazie danych
    const query = 'DELETE FROM koszyk WHERE productid = ? AND user_id = ?';

    db.query(query, [productid, userId], (err, result) => {
        if (err) {
            console.error('Błąd usuwania z koszyka:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produkt nie znaleziony w koszyku.' });
        }

        res.status(200).json({ message: 'Produkt usunięty z koszyka.' });
    });
});


app.get('/api/cart', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Musisz być zalogowany, aby wykonać tę operację.' });
    }

    const query = `
        SELECT k.productid, p.name, p.price, k.amount 
        FROM koszyk k
        JOIN products p ON k.productid = p.productid
        WHERE k.user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Błąd pobierania koszyka:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }
        console.log('Produkty w koszyku:', results); // Logowanie do konsoli
        res.status(200).json(results);
    });
});

// app.get('/api/cart', (req, res) => {
//     const userId = req.session.userId;

//     if (!userId) {
//         return res.status(401).json({ message: 'Musisz być zalogowany, aby zobaczyć koszyk.' });
//     }

//     const query = `
//         SELECT p.name, p.price, k.amount
//         FROM koszyk k
//         JOIN products p ON k.productid = p.id
//         WHERE k.user_id = ?;
//     `;

//     db.query(query, [userId], (err, results) => {
//         if (err) {
//             console.error('Błąd pobierania koszyka:', err);
//             return res.status(500).json({ message: 'Błąd serwera' });
//         }

//         res.json(results); // Zwraca produkty w koszyku w formacie JSON
//     });
// });




// // 4. Dodawanie produktów do tabeli zamowienia
// app.post('/zamowienia/dodaj', (req, res) => {
//     const { id, uzytkownik_id, nazwa, cena } = req.body;
//     const query = 'INSERT INTO koszy (id, uzytkownik_id, nazwa, cena) VALUES (?, ?, ?, ?)';
//     db.query(query, [id, uzytkownik_id, nazwa, cena], (err, results) => {
//         if (err) throw err;
//         res.json({ message: 'Produkt dodany do zamówienia', zamowienieId: results.insertId });
//     });
// });

// 5. Dodanie wszystkich produktów użytkownika do tabeli zamowienie
app.post('/zamowienie/przenies', (req, res) => {
    const { uzytkownik_id, opis, data } = req.body;

    // Pobierz wszystkie produkty użytkownika z tabeli zamowienia
    const selectQuery = 'SELECT nazwa, cena FROM koszyk WHERE user = ?';
    db.query(selectQuery, [uzytkownik_id], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            res.status(404).json({ message: 'Brak produktów do przeniesienia' });
            return;
        }

        // Oblicz sumaryczną cenę
        const sumaCen = results.reduce((sum, item) => sum + item.cena, 0);

        // Dodaj do tabeli zamowienie
        const insertQuery = 'INSERT INTO zamowienie (urzytkownik_id, opis, cena, data) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [uzytkownik_id, opis, sumaCen, data], (err, insertResults) => {
            if (err) throw err;

            // Usuń produkty z tabeli zamowienia
            const deleteQuery = 'DELETE FROM koszyk WHERE uzytkownik_id = ?';
            db.query(deleteQuery, [uzytkownik_id], (err) => {
                if (err) throw err;
                res.json({ message: 'Produkty przeniesione do zamowienie', zamowienieId: insertResults.insertId });
            });
        });
    });
});

// 6. Wyświetlanie tabeli zamowienie
app.get('/zamowienie', (req, res) => {
    const query = 'SELECT id, uzytkownik_id, opis, cena, data FROM zamowienie';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Uruchomienie serwera
app.listen(3001, () => console.log('Serwer działa na http://localhost:3001'));


// Uruchomienie serwera
app.listen(process.env.PORT || 3000, () => console.log(`App dostępne na http://localhost:3000`));