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
	const categoryId = req.params.id;

	// Najpierw usuwamy produkty powiązane z kategorią
	const deleteProductsQuery = 'DELETE FROM products WHERE categoryid = ?';
	db.query(deleteProductsQuery, [categoryId], (err, results) => {
		if (err) {
			console.error('Błąd podczas usuwania produktów:', err);
			return res.status(500).json({ message: 'Błąd serwera przy usuwaniu produktów.' });
		}

		// Następnie usuwamy kategorię
		const deleteCategoryQuery = 'DELETE FROM categories WHERE categoryid = ?';
		db.query(deleteCategoryQuery, [categoryId], (err, results) => {
			if (err) {
				console.error('Błąd zapytania:', err);
				return res.status(500).json({ message: 'Błąd serwera przy usuwaniu kategorii.' });
			}

			if (results.affectedRows > 0) {
				res.json({ message: 'Kategoria i powiązane produkty zostały usunięte pomyślnie!' });
			} else {
				res.status(404).json({ message: 'Kategoria nie została znaleziona.' });
			}
		});
	});
});


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
		'SELECT products.productid, products.name AS product_name, products.price, categories.name AS category_name FROM products JOIN categories ON products.categoryid = categories.categoryid';

	db.query(query, (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err);
			res.status(500).send('Błąd serwera');
		} else {
			console.log('Produkty z bazy danych2:', results); // Sprawdzamy, co zwraca baza danych
			res.json(results); // Zwracamy dane w formacie JSON
		}
	});
});



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
	const query = 'INSERT INTO urzytkownik (imie, nazwisko, email, haslo) VALUES (?, ?, ?, ?)'
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
	const query = 'SELECT categoryid, name FROM categories' // zapytanie SQL
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
	const categoryids = req.query.categoryid ? req.query.categoryid.split(',') : [];
	const minPrice = parseFloat(req.query.minPrice) || 0;
	const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
	const searchQuery = req.query.searchQuery ? `%${req.query.searchQuery}%` : '%';

	let query = 'SELECT productid, name, price, categoryid FROM products WHERE price BETWEEN ? AND ? AND name LIKE ?';

	const queryParams = [minPrice, maxPrice, searchQuery];

	if (categoryids.length > 0) {
		const placeholders = categoryids.map(() => '?').join(',');
		query += ` AND categoryid IN (${placeholders})`;
		queryParams.push(...categoryids);
	}

	db.query(query, queryParams, (err, results) => {
		if (err) {
			console.error('Błąd zapytania:', err);
			res.status(500).send('Błąd serwera');
		} else {
			console.log('Produkty z bazy danych:', results);
			res.json(results);
		}
	});
});

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
	const uzytkownik_id = req.session.userId // Pobranie ID użytkownika z sesji
	const { data, promoCode } = req.body // Pobranie kodu promocyjnego z żądania

	// Pobierz kod promocyjny i zniżkę (jeśli istnieje)
	const promoQuery = 'SELECT znizka FROM promocje WHERE kod = ?'

	db.query(promoQuery, [promoCode], (err, promoResults) => {
		if (err) {
			console.error('Błąd podczas pobierania kodu promocyjnego:', err)
			res.status(500).json({ message: 'Błąd serwera' })
			return
		}

		// Ustaw zniżkę na 0, jeśli kod promocyjny nie istnieje
		const znizka = promoResults.length > 0 ? promoResults[0].znizka : 0

		// Pobierz wszystkie produkty użytkownika z koszyka
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

			// Przygotowanie opisu i obliczenie sumarycznej ceny przed zniżką
			const opis = results.map(item => `${item.name} (Ilość: ${item.amount})`).join(', ')
			const sumaCen = results.reduce((sum, item) => sum + parseFloat(item.price), 0)

			// Obliczanie ceny po zniżce
			const sumaPoZnizce = sumaCen - sumaCen * (znizka / 100)

			console.log('Produkty z koszyka:', results)
			console.log('Łączna cena przed zniżką:', sumaCen)
			console.log(' zniżką:', znizka)
			console.log('Łączna cena po zniżce:', sumaPoZnizce)
			console.log('Opis:', opis)

			// Dodanie zamówienia do tabeli zamowienie
			const insertQuery = 'INSERT INTO zamowienie (urzytkownik_id, opis, cena, data) VALUES (?, ?, ?, ?)'

			db.query(insertQuery, [uzytkownik_id, opis, sumaPoZnizce, data], (err, insertResults) => {
				if (err) {
					console.error('Błąd podczas dodawania zamówienia:', err)
					res.status(500).json({ message: 'Błąd serwera przy dodawaniu zamówienia' })
					return
				}

				// Usunięcie produktów z koszyka
				const deleteQuery = 'DELETE FROM koszyk WHERE user_id = ?'

				db.query(deleteQuery, [uzytkownik_id], err => {
					if (err) {
						console.error('Błąd podczas usuwania produktów z koszyka:', err)
						res.status(500).json({ message: 'Błąd serwera przy usuwaniu koszyka' })
						return
					}

					res.json({
						message: 'Zakup dokonany',
						zamowienieId: insertResults.insertId,
					})
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

	const query = 'SELECT opis, cena, data, zatwierdzone FROM zamowienie WHERE urzytkownik_id = ? ORDER BY data DESC'
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

	// Tworzymy dynamiczne zapytanie SQL
	let fieldsToUpdate = []
	let values = []

	if (imie) {
		fieldsToUpdate.push('imie = ?')
		values.push(imie)
	}
	if (nazwisko) {
		fieldsToUpdate.push('nazwisko = ?')
		values.push(nazwisko)
	}
	if (email) {
		fieldsToUpdate.push('email = ?')
		values.push(email)
	}
	if (haslo) {
		fieldsToUpdate.push('haslo = ?')
		values.push(haslo)
	}

	// Jeśli nie przekazano żadnych danych do aktualizacji, zwracamy błąd
	if (fieldsToUpdate.length === 0) {
		return res.status(400).json({ message: 'Brak danych do aktualizacji' })
	}

	// Dodajemy ID użytkownika na końcu tablicy wartości
	values.push(uzytkownik_id)

	const query = `UPDATE urzytkownik SET ${ fieldsToUpdate.join(', ')
} WHERE id = ?`;

	db.query(query, values, (err, results) => {
		if (err) {
			console.error('Błąd podczas aktualizacji danych:', err)
			return res.status(500).json({ message: 'Błąd serwera' })
		}

		res.json({ message: 'Dane użytkownika zostały zaktualizowane' })
	})
})

app.post('/promocje/dodaj', (req, res) => {
	const { kod, znizka } = req.body

	if (!kod || !znizka || isNaN(znizka) || znizka <= 0 || znizka > 100) {
		return res.status(400).json({ message: 'Nieprawidłowe dane. Kod i zniżka (1-100%) są wymagane.' })
	}

	const query = 'INSERT INTO promocje (kod, znizka) VALUES (?, ?)'
	db.query(query, [kod, znizka], (err, results) => {
		if (err) {
			console.error('Błąd podczas dodawania promocji:', err)
			if (err.code === 'ER_DUP_ENTRY') {
				return res.status(400).json({ message: 'Ten kod już istnieje.' })
			}
			return res.status(500).json({ message: 'Błąd serwera.' })
		}

		// Dodano poprawnie - zwróć kod 200 i komunikat
		res.status(200).json({ message: 'Promocja została dodana pomyślnie.', promocjaId: results.insertId })
	})
})

app.delete('/promocje/:id', (req, res) => {
	const { id } = req.params
	const query = 'DELETE FROM promocje WHERE id = ?'

	db.query(query, [id], (err, results) => {
		if (err) {
			console.error('Błąd podczas usuwania promocji:', err)
			return res.status(500).json({ message: 'Błąd serwera' })
		}

		if (results.affectedRows === 0) {
			return res.status(404).json({ message: 'Promocja nie znaleziona' })
		}

		res.status(200).json({ message: 'Promocja została usunięta' })
	})
})

app.get('/promocje', (req, res) => {
	const query = 'SELECT * FROM promocje ORDER BY id DESC' // Sortowanie malejąco według id
	db.query(query, (err, results) => {
		if (err) {
			console.error('Błąd podczas pobierania promocji:', err)
			return res.status(500).json({ message: 'Błąd serwera' })
		}
		res.json(results) // Zwróć wyniki w formacie JSON
	})
})

app.post('/api/verify-promo-code', (req, res) => {
	const { promoCode } = req.body

	// Zapytanie do bazy danych w celu sprawdzenia kodu
	db.query('SELECT * FROM promocje WHERE kod = ?', [promoCode], (err, results) => {
		if (err) {
			return res.status(500).json({ message: 'Błąd serwera' })
		}

		if (results.length === 0) {
			return res.status(404).json({ message: 'Nieprawidłowy kod promocyjny' })
		}

		const promo = results[0]
		return res.status(200).json({ discount: promo.znizka }) // Zwracamy wartość zniżki
	})
})

// Uruchomienie serwera
app.listen(3001, () => console.log('Serwer działa na http://localhost:3001'))

// Uruchomienie serwera
app.listen(process.env.PORT || 3000, () => console.log(`App dostępne na http://localhost:3000`))
