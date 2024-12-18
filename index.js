const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const { readFile } = require('fs').promises;

const app = express();
app.use(express.json());
app.use(cors());

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

// Endpoint do wyświetlania home.html (formularz logowania)
app.get('/login', async (req, res) => {
  try {
    const html = await readFile('./home.html', 'utf8');
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
      res.json({ message: 'Logowanie udane.', user });
    } else {
      res.status(401).json({ message: 'Nieprawidłowy email lub hasło.' });
    }
  });
});

// Uruchomienie serwera
app.listen(3001, () => console.log('Serwer działa na http://localhost:3001'));


// 1. Endpointy wyświetlające każdą tabelę związaną z jedzeniem
app.get('/burito', (req, res) => {
  db.query('SELECT * FROM burito', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/kebab', (req, res) => {
  db.query('SELECT * FROM kebab', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/pizza', (req, res) => {
  db.query('SELECT * FROM pizza', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/lody', (req, res) => {
  db.query('SELECT * FROM lody', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// 2. Logowanie użytkownika (sprawdzanie danych)


// 3. Rejestracja użytkownika (dodawanie do tabeli urzytkownik)
app.post('/register', (req, res) => {
  const { imie, nazwisko, email, haslo } = req.body;
  const query = 'INSERT INTO urzytkownik (imie, nazwisko, email, haslo) VALUES (?, ?, ?, ?)';
  db.query(query, [imie, nazwisko, email, haslo], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Rejestracja zakończona sukcesem', userId: results.insertId });
  });
});

// 4. Dodawanie produktów do tabeli zamowienia
app.post('/zamowienia/dodaj', (req, res) => {
  const { id, uzytkownik_id, nazwa, cena } = req.body;
  const query = 'INSERT INTO zamowienia (id, uzytkownik_id, nazwa, cena) VALUES (?, ?, ?, ?)';
  db.query(query, [id, uzytkownik_id, nazwa, cena], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Produkt dodany do zamówienia', zamowienieId: results.insertId });
  });
});

// 5. Dodanie wszystkich produktów użytkownika do tabeli zamowienie
app.post('/zamowienie/przenies', (req, res) => {
  const { uzytkownik_id, opis, data } = req.body;

  // Pobierz wszystkie produkty użytkownika z tabeli zamowienia
  const selectQuery = 'SELECT nazwa, cena FROM zamowienia WHERE uzytkownik_id = ?';
  db.query(selectQuery, [uzytkownik_id], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      res.status(404).json({ message: 'Brak produktów do przeniesienia' });
      return;
    }

    // Oblicz sumaryczną cenę
    const sumaCen = results.reduce((sum, item) => sum + item.cena, 0);

    // Dodaj do tabeli zamowienie
    const insertQuery = 'INSERT INTO zamowienie (uzytkownik_id, opis, cena, data) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [uzytkownik_id, opis, sumaCen, data], (err, insertResults) => {
      if (err) throw err;

      // Usuń produkty z tabeli zamowienia
      const deleteQuery = 'DELETE FROM zamowienia WHERE uzytkownik_id = ?';
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
app.listen(process.env.PORT || 3000, () => console.log(`App dostępne na http://localhost:3000`));
