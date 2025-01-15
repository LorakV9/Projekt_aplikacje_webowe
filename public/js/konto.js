document.getElementById('update-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        imie: document.getElementById('imie').value,
        nazwisko: document.getElementById('nazwisko').value,
        email: document.getElementById('email').value,
        haslo: document.getElementById('haslo').value,
    };

    try {
        const response = await fetch('/konto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error('B³¹d podczas zmiany danych:', error);
        alert('Wyst¹pi³ b³¹d podczas zmiany danych');
    }
});