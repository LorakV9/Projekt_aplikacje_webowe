document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, haslo: password })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Logowanie udane! Witamy, ' + result.user.imie);
            window.location.href = '/admin_panel';
        } else {
            document.getElementById('error-message').innerText = result.message;
        }
    } catch (err) {
        document.getElementById('error-message').innerText = 'B³¹d serwera.';
        console.error(err);
    }
});