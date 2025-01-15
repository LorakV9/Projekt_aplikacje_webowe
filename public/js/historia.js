fetch('/zamowienia')
    .then(response => {
        if (!response.ok) {
            throw new Error('Blad przy pobieraniu zamówieñ');
        }
        return response.json();
    })
    .then(data => {
        const ordersTable = document.getElementById('orders');

        if (data.length === 0) {
            ordersTable.innerHTML = '<tr><td colspan="5">Brak zamówieñ</td></tr>';
        } else {
            data.forEach(order => {
                const row = document.createElement('tr');

                const formattedDate = new Date(order.data);
                const dateWithTime = formattedDate.toLocaleString('pl-PL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                const zatwierdzoneStatus = order.zatwierdzone === 1 ? 'Zatwierdzone' : 'Nie zatwierdzone';

                row.innerHTML = `
                            <td>${order.opis}</td>
                            <td>${order.cena.toFixed(2)} z³</td>
                            <td>${dateWithTime}</td>
                            <td>${zatwierdzoneStatus}</td>
                        `;
                ordersTable.appendChild(row);
            });
        }
    })
    .catch(error => {
        console.error('B³¹d:', error);
        const ordersTable = document.getElementById('orders');
        ordersTable.innerHTML = '<tr><td colspan="5">Nie uda³o siê za³adowaæ zamówieñ</td></tr>';
    });