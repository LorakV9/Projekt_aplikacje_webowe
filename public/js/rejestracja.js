document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/rejestracja', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imie: firstName, nazwisko: lastName, email, haslo: password })
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('success-message').innerText = result.message;
        } else {
            document.getElementById('error-message').innerText = result.message;
        }
    } catch (err) {
        document.getElementById('error-message').innerText = 'B³¹d serwera.';
        console.error(err);
    }
});