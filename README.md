Sklep Internetowy

Opis projektu

Projekt internetowego sklepu z podziałem na użytkownika i admina, umożliwiający użytkownikom przeglądanie produktów, składanie zamówień, zarządzanie kontem oraz adminowi zarządzanie zawartością sklepu i użytkownikami.

Jak uruchomić:
1. Sklonuj repozytorium:
git clone https://github.com/LorakV9/Projekt_aplikacje_webowe.git
2. Przejdź do folderu projektu
3. Wykonaj konfigurację
npm install cors
nwm install --lts
5. Uruchom aplikację
node index.js


Funkcjonalności

Admin

Zarządzanie użytkownikami (dodawanie, edytowanie, usuwanie).

Zarządzanie kategoriami i produktami (CRUD).

Zarządzanie promocjami i rabatami (dodawanie, edycja, usuwanie).

Użytkownik

Przeglądanie produktów z możliwością filtrowania.

Dodawanie produktów do koszyka.

Edytowanie ilości produktów w koszyku.

Usuwanie produktów z koszyka.

Składanie zamówień.

Przeglądanie historii zamówień.

Zarządzanie swoim kontem (edycja danych).



Technologie

Backend: Node.js / Express, MySQL (xampp)

Frontend: HTML, CSS, JavaScript


Architektura aplikacji
Endpointy

Autoryzacja

Logowanie: POST /login

Rejestracja: POST /register

Kategorie

Dodawanie kategorii: POST /categories

Edycja kategorii: PUT /categories/:id

Usuwanie kategorii: DELETE /categories/:id

Produkty

Lista produktów: GET /products

Dodawanie produktu: POST /products

Edycja produktu: PUT /products/:id

Usuwanie produktu: DELETE /products/:id

Koszyk

Dodawanie do koszyka: POST /cart

Wyświetlanie koszyka: GET /cart

Składanie zamówienia: POST /cart/checkout

Historia zamówień

Wyświetlanie historii: GET /orders

Zarządzanie kontami

Edycja konta: PUT /users/:id

Usuwanie konta: DELETE /users/:id



Połączenie z bazą danych.

Weryfikacja logowania i rejestracja użytkowników.

Filtrowanie produktów.

Dodawanie produktów do koszyka.

Endpoint do wyświetlania historii zamówień.
