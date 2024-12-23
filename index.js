const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const { readFile } = require('fs').promises

const app = express()
app.use(express.json())
app.use(cors())
const path = require('path') // Dodaj ten wiersz, aby zaimportować moduł path

app.use(express.static(path.join(__dirname, 'public')))

// Połączenie z bazą danych
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'projekt',
})

db.connect(err => {
	if (err) throw err
	console.log('MySql połączone')
})

const session = require('express-session')

app.use(
	session({
		secret: 'your_secret_key', // Zmienna kluczowa dla szyfrowania
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }, // Użyj `true` dla HTTPS
	})
)

app.get('/', (req, res) => {
	res.redirect('/login') // Przekierowanie na stronę logowania
})

// Endpoint do wyświetlania home.html (formularz logowania)
app.get('/login', async (req, res) => {
	try {
		const html = await readFile('./views/logo.html', 'utf8')
		res.send(html)
	} catch (err) {
		console.error('Błąd przy wczytywaniu pliku HTML:', err)
		res.status(500).send('Wystąpił błąd serwera.')
	}
})

app.get('/sklep', async (req, res) => {
	try {
		const html = await readFile('./views/sklep.html', 'utf8')
		res.send(html)
	} catch (err) {
		console.error('Błąd przy wczytywaniu pliku HTML:', err)
		res.status(500).send('Wystąpił błąd serwera.')
	}
})

app.get('/admin', async (req, res) => {
	try {
		const html = await readFile('./views/admin.html', 'utf8')
		res.send(html)
	} catch (err) {
		console.error('Błąd przy wczytywaniu pliku HTML:', err)
		res.status(500).send('Wystąpił błąd serwera.')
	}
})

app.get('/konto', async (req, res) => {
	try {
		const html = await readFile('./views/konto.html', 'utf8')
		res.send(html)
	} catch (err) {
		console.error('Błąd przy wczytywaniu pliku HTML:', err)
		res.status(500).send('Wystąpił błąd serwera.')
	}
})

app.get('/admin_panel', async (req, res) => {
	try {
		const html = await readFile('./views/admin_panel.html', 'utf8')
		res.send(html)
	} catch (err) {
		console.error('Błąd przy wczytywaniu pliku HTML:', err)
		res.status(500).send('Wystąpił błąd serwera.')
	}
})

app.get('/historia', async (req, res) => {
	try {
		const html = await readFile('./views/historia.html', 'utf8')
		res.send(html)
	} catch (err) {
		console.error('Błąd przy wczytywaniu pliku HTML:', err)
		res.status(500).send('Wystąpił błąd serwera.')
	}
})

// Endpoint logowania użytkownika
app.post('/login', (req, res) => {
	const { email, haslo } = req.body

	if (!email || !haslo) {
		return res.status(400).json({ message: 'Wprowadź email i hasło.' })
	}

	const query = 'SELECT * FROM urzytkownik WHERE email = ? AND haslo = ?'
	db.query(query, [email, haslo], (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}

		if (results.length > 0) {
			const user = results[0]

			// Zapis ID użytkownika do sesji
			req.session.userId = user.id

			res.json({ message: 'Logowanie udane.', user })
		} else {
			res.status(401).json({ message: 'Nieprawidłowy email lub hasło.' })
		}
	})
})

app.post('/admin', (req, res) => {
	const { email, haslo } = req.body

	// Sprawdzanie, czy email i hasło są zgodne z wartościami admina
	if (email === 'admin@add' && haslo === '123') {
		// Zaloguj użytkownika
		req.session.userId = 'admin' // Przechowuj coś w sesji, np. id admina
		req.session.role = 'admin' // Przechowuj rolę admina

		return res.json({ message: 'Logowanie udane.', user: { email, rola: 'admin' } })
	} else {
		return res.status(401).json({ message: 'Nieprawidłowy email lub hasło.' })
	}
})

// Endpoint dodawania kategorii
app.post('/add-category', (req, res) => {
	const { name } = req.body

	if (!name) {
		return res.status(400).json({ message: 'Nazwa kategorii jest wymagana.' })
	}

	const query = 'INSERT INTO categories (name) VALUES (?)'
	db.query(query, [name], (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}
		res.json({ message: 'Kategoria dodana pomyślnie!' })
	})
})

// Endpoint dodawania produktu
app.post('/add-product', (req, res) => {
	const { name, price, categoryid } = req.body

	if (!name || !price || !categoryid) {
		return res.status(400).json({ message: 'Wszystkie pola są wymagane.' })
	}

	const query = 'INSERT INTO products (name, price, categoryid) VALUES (?, ?, ?)'
	db.query(query, [name, price, categoryid], (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}
		res.json({ message: 'Produkt dodany pomyślnie!' })
	})
})

// Endpoint do usuwania kategorii
app.delete('/delete-category/:id', (req, res) => {
	const categoryId = req.params.id

	// Sprawdzamy, czy kategoria istnieje
	const query = 'DELETE FROM categories WHERE categoryid = ?'
	db.query(query, [categoryId], (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}

		if (results.affectedRows > 0) {
			res.json({ message: 'Kategoria usunięta pomyślnie!' })
		} else {
			res.status(404).json({ message: 'Kategoria nie została znaleziona.' })
		}
	})
})

// Endpoint do usuwania produktu
app.delete('/delete-product/:id', (req, res) => {
	const productId = req.params.id

	// Sprawdzamy, czy produkt istnieje
	const query = 'DELETE FROM products WHERE productid = ?'
	db.query(query, [productId], (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}

		if (results.affectedRows > 0) {
			res.json({ message: 'Produkt usunięty pomyślnie!' })
		} else {
			res.status(404).json({ message: 'Produkt nie został znaleziony.' })
		}
	})
})

// Endpoint do pobierania kategorii
app.get('/categories', (req, res) => {
	const query = 'SELECT * FROM categories'
	db.query(query, (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}
		res.json(results)
	})
})

// Endpoint do pobierania produktów
app.get('/products', (req, res) => {
	const query =
		'SELECT products.productid, products.name AS product_name, products.price, categories.name AS category_name FROM products JOIN categories ON products.categoryid = categories.categoryid'
	db.query(query, (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}
		res.json(results)
	})
})

// Endpoint do zatwierdzania zamówienia
app.post('/zatwierdz/:orderId', (req, res) => {
	const orderId = req.params.orderId

	const query = 'UPDATE zamowienie SET zatwierdzone = 1 WHERE id = ? AND zatwierdzone = 0'
	db.query(query, [orderId], (err, result) => {
		if (err) {
			console.error('Błąd zapytania do bazy:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}

		if (result.affectedRows > 0) {
			res.json({ message: 'Zamówienie zostało zatwierdzone.' })
		} else {
			res.status(404).json({ message: 'Nie znaleziono zamówienia do zatwierdzenia lub jest już zatwierdzone.' })
		}
	})
})

// Endpoint do pobierania zamówień
app.get('/zamowienie', (req, res) => {
	const query = 'SELECT * FROM zamowienie'
	db.query(query, (err, results) => {
		if (err) {
			console.error('Błąd zapytania do bazy:', err)
			return res.status(500).json({ message: 'Błąd serwera.' })
		}
		res.json(results)
	})
})

// 3. Rejestracja użytkownika (dodawanie do tabeli urzytkownik)
app.post('/rejestracja', (req, res) => {
	const { imie, nazwisko, email, haslo } = req.body
	const query = 'INSERT INTO urzytkownik (imie, nazwisko, email, haslo, rola) VALUES (?, ?, ?, ?, "user")'
	db.query(query, [imie, nazwisko, email, haslo], (err, results) => {
		if (err) throw err
		res.json({ message: 'Rejestracja zakończona sukcesem', userId: results.insertId })
	})
})

// Endpoint do wyświetlania home.html (formularz logowania)
app.get('/rejestracja', async (req, res) => {
	try {
		const html = await readFile('./views/rejestracja.html', 'utf8')
		res.send(html)
	} catch (err) {
		console.error('Błąd przy wczytywaniu pliku HTML:', err)
		res.status(500).send('Wystąpił błąd serwera.')
	}
})

app.get('/api/categories', (req, res) => {
	const query = 'SELECT name FROM categories' // zapytanie SQL
	db.query(query, (err, results) => {
		if (err) {
			console.error(err)
			res.status(500).send('Błąd serwera')
		} else {
			res.json(results) // Zwraca kategorie jako JSON
		}
	})
})

app.get('/api/products', (req, res) => {
	const query = 'SELECT productid, name, price FROM products' // Zapytanie SQL do pobrania nazw i cen produktów
	db.query(query, (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			res.status(500).send('Błąd serwera')
		} else {
			console.log('Produkty z bazy danych:', results) // Logowanie odpowiedzi z bazy danych
			res.json(results) // Zwróć produkty w formacie JSON
		}
	})
})

app.post('/api/add-to-cart', (req, res) => {
	const { productid, amount } = req.body
	const userId = req.session.userId

	if (!userId) {
		return res.status(401).json({ message: 'Musisz być zalogowany, aby wykonać tę operację.' })
	}

	const query = 'SELECT name, price FROM products WHERE productid = ?'

	db.query(query, [productid], (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ error: 'Błąd serwera' })
		}

		if (results.length === 0) {
			return res.status(404).json({ message: 'Produkt nie znaleziony.' })
		}

		const { name, price } = results[0]

		// Sprawdzamy, czy produkt jest już w koszyku
		const checkCartQuery = 'SELECT amount FROM koszyk WHERE productid = ? AND user_id = ?'
		db.query(checkCartQuery, [productid, userId], (err, cartResults) => {
			if (err) {
				console.error('Błąd zapytania koszyka:', err)
				return res.status(500).json({ error: 'Błąd serwera' })
			}

			if (cartResults.length > 0) {
				// Produkt już jest w koszyku, aktualizujemy ilość
				const newAmount = cartResults[0].amount + amount
				const updateQuery = 'UPDATE koszyk SET amount = ?, price = price + ? WHERE productid = ? AND user_id = ?'
				db.query(updateQuery, [newAmount, price * amount, productid, userId], err => {
					if (err) {
						console.error('Błąd aktualizacji koszyka:', err)
						return res.status(500).json({ error: 'Błąd serwera' })
					}
					res.status(200).json({ message: 'Produkt zaktualizowany w koszyku.' })
				})
			} else {
				// Produkt nie jest w koszyku, dodajemy nowy wpis
				const insertQuery = 'INSERT INTO koszyk (productid, name, price, amount, user_id) VALUES (?, ?, ?, ?, ?)'
				db.query(insertQuery, [productid, name, price, amount, userId], err => {
					if (err) {
						console.error('Błąd dodawania do koszyka:', err)
						return res.status(500).json({ error: 'Błąd serwera' })
					}
					res.status(200).json({ message: 'Produkt dodany do koszyka.' })
				})
			}
		})
	})
})

app.post('/api/remove-from-cart', (req, res) => {
	const { productid } = req.body
	const userId = req.session.userId

	if (!userId) {
		return res.status(401).json({ message: 'Musisz być zalogowany, aby wykonać tę operację.' })
	}

	const checkQuery = 'SELECT amount FROM koszyk WHERE productid = ? AND user_id = ?'

	db.query(checkQuery, [productid, userId], (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err)
			return res.status(500).json({ error: 'Błąd serwera' })
		}

		if (results.length === 0) {
			return res.status(404).json({ message: 'Produkt nie znaleziony w koszyku.' })
		}

		const currentAmount = results[0].amount

		if (currentAmount > 1) {
			const updateQuery = 'UPDATE koszyk SET amount = amount - 1 WHERE productid = ? AND user_id = ?'
			db.query(updateQuery, [productid, userId], err => {
				if (err) {
					console.error('Błąd aktualizacji koszyka:', err)
					return res.status(500).json({ error: 'Błąd serwera' })
				}
				res.status(200).json({ message: 'Ilość produktu zmniejszona.' })
			})
		} else {
			const deleteQuery = 'DELETE FROM koszyk WHERE productid = ? AND user_id = ?'
			db.query(deleteQuery, [productid, userId], err => {
				if (err) {
					console.error('Błąd usuwania z koszyka:', err)
					return res.status(500).json({ error: 'Błąd serwera' })
				}
				res.status(200).json({ message: 'Produkt usunięty z koszyka.' })
			})
		}
	})
})

app.get('/api/cart', (req, res) => {
	const userId = req.session.userId

	if (!userId) {
		return res.status(401).json({ message: 'Musisz być zalogowany, aby wykonać tę operację.' })
	}

	const query = `
        SELECT k.productid, p.name, p.price, k.amount 
        FROM koszyk k
        JOIN products p ON k.productid = p.productid
        WHERE k.user_id = ?`

	db.query(query, [userId], (err, results) => {
		if (err) {
			console.error('Błąd pobierania koszyka:', err)
			return res.status(500).json({ error: 'Błąd serwera' })
		}
		console.log('Produkty w koszyku:', results) // Logowanie do konsoli
		res.status(200).json(results)
	})
})

// 5. Dodanie wszystkich produktów użytkownika do tabeli zamowienie
app.post('/zamowienie/przenies', (req, res) => {
	const uzytkownik_id = req.session.userId // Użycie sesji do identyfikacji użytkownika
	const { data } = req.body

	// Pobierz wszystkie produkty użytkownika z tabeli koszyk
	const selectQuery = 'SELECT name, amount, price FROM koszyk WHERE user_id = ?'
	db.query(selectQuery, [uzytkownik_id], (err, results) => {
		if (err) {
			console.error('Błąd podczas pobierania danych z koszyka:', err)
			res.status(500).json({ message: 'Błąd serwera' })
			return
		}

		if (results.length === 0) {
			res.status(404).json({ message: 'Brak produktów do przeniesienia' })
			return
		}

		// Przygotuj opis i oblicz sumaryczną cenę
		let opis = results.map(item => `${item.name} (Ilość: ${item.amount})`).join(', ')
		let sumaCen = results.reduce((sum, item) => sum + parseFloat(item.price), 0) // Używamy samej ceny z tabeli koszyk

		// Debugowanie wyników
		console.log('Produkty z koszyka:', results)
		console.log('Łączna cena:', sumaCen)
		console.log('Opis:', opis)

		// Dodaj zamówienie do tabeli zamowienie
		const insertQuery = 'INSERT INTO zamowienie (urzytkownik_id, opis, cena, data) VALUES (?, ?, ?, ?)'
		db.query(insertQuery, [uzytkownik_id, opis, sumaCen, data], (err, insertResults) => {
			if (err) {
				console.error('Błąd podczas dodawania zamówienia:', err)
				res.status(500).json({ message: 'Błąd serwera przy dodawaniu zamówienia' })
				return
			}

			// Usuń produkty z tabeli koszyk
			const deleteQuery = 'DELETE FROM koszyk WHERE user_id = ?'
			db.query(deleteQuery, [uzytkownik_id], err => {
				if (err) {
					console.error('Błąd podczas usuwania produktów z koszyka:', err)
					res.status(500).json({ message: 'Błąd serwera przy usuwaniu koszyka' })
					return
				}

				res.json({
					message: 'Produkty przeniesione do zamowienie',
					zamowienieId: insertResults.insertId,
				})
			})
		})
	})
})

// 6. Wyświetlanie tabeli zamowienie
app.get('/zamowienia', (req, res) => {
	const uzytkownik_id = req.session.userId // Pobierz ID użytkownika z sesji

	if (!uzytkownik_id) {
		return res.status(401).json({ message: 'Nie jesteś zalogowany' }) // Sprawdź, czy użytkownik jest zalogowany
	}

	const query = 'SELECT * FROM zamowienie WHERE urzytkownik_id = ? ORDER BY id DESC'
	db.query(query, [uzytkownik_id], (err, results) => {
		if (err) {
			console.error('Błąd zapytania do bazy:', err)
			return res.status(500).json({ message: 'Błąd serwera' })
		}

		res.json(results) // Zwróć wyniki w formacie JSON
	})
})

app.post('/konto', (req, res) => {
	const uzytkownik_id = req.session.userId // Pobierz ID użytkownika z sesji
	const { imie, nazwisko, email, haslo } = req.body // Dane do aktualizacji

	if (!uzytkownik_id) {
		return res.status(401).json({ message: 'Nie jesteś zalogowany' }) // Użytkownik nie jest zalogowany
	}

	const query = 'UPDATE urzytkownik SET imie = ?, nazwisko = ?, email = ?, haslo = ? WHERE id = ?'
	db.query(query, [imie, nazwisko, email, haslo, uzytkownik_id], (err, results) => {
		if (err) {
			console.error('Błąd podczas aktualizacji danych:', err)
			return res.status(500).json({ message: 'Błąd serwera' })
		}

		res.json({ message: 'Dane użytkownika zostały zaktualizowane' })
	})
})

// Uruchomienie serwera
app.listen(3001, () => console.log('Serwer działa na http://localhost:3001'))

// Uruchomienie serwera
app.listen(process.env.PORT || 3000, () => console.log(`App dostępne na http://localhost:3000`))
