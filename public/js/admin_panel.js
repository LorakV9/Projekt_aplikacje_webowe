document.getElementById('categoryForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('categoryName').value;

    fetch('/add-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadCategories(); // £aduj kategorie po dodaniu
        })
        .catch(error => alert('B³¹d: ' + error));
});

document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const categoryid = document.getElementById('productCategory').value;

    fetch('/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, categoryid })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => alert('B³¹d: ' + error));
});

function loadCategories() {
    fetch('/categories')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('categoryTable').getElementsByTagName('tbody')[0];
            table.innerHTML = '';
            data.forEach((category, index) => {
                const row = table.insertRow();
                row.insertCell(0).textContent = index + 1;
                row.insertCell(1).textContent = category.name;
                const deleteCell = row.insertCell(2);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Usuñ';
                deleteButton.onclick = function () {
                    deleteCategory(category.categoryid);
                };
                deleteCell.appendChild(deleteButton);
            });

            const select = document.getElementById('productCategory');
            select.innerHTML = ''; 
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryid;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
}

function loadProducts() {
    fetch('/products')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
            table.innerHTML = '';
            data.forEach((product, index) => {
                const row = table.insertRow();
                row.insertCell(0).textContent = index + 1;
                row.insertCell(1).textContent = product.product_name;
                row.insertCell(2).textContent = `${parseFloat(product.price).toFixed(2)} zl`;
                row.insertCell(3).textContent = product.category_name;
                const deleteCell = row.insertCell(4);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Usuñ';
                deleteButton.onclick = function () {
                    deleteProduct(product.productid);
                };
                deleteCell.appendChild(deleteButton);
            });
        });
}

function deleteCategory(categoryId) {
    fetch(`/delete-category/${categoryId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadCategories();
        })
        .catch(error => alert('B³¹d: ' + error));
}

function deleteProduct(productId) {
    fetch(`/delete-product/${productId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadProducts(); 
        })
        .catch(error => alert('B³¹d: ' + error));
}

function approveOrder(orderId) {
    fetch(`/zatwierdz/${orderId}`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            
            const button = document.querySelector(`button[data-order-id="${orderId}"]`);
            if (button) {
                button.parentElement.innerHTML = 'Zatwierdzone';
            }
        })
        .catch(error => {
            console.error('B³¹d przy zatwierdzaniu zamówienia:', error);
        });
}

function loadOrders() {
    fetch('/zamowienie')
        .then(response => response.json())
        .then(orders => {
            const orderList = document.getElementById('order-list');
            orderList.innerHTML = '';

            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.opis}</td>
                    <td>${parseFloat(order.cena).toFixed(2)} zl</td>
                    <td>
                        ${order.zatwierdzone == 1 ?
                        '<span>Zatwierdzone</span>' :
                        `<button data-order-id="${order.id}" onclick="approveOrder(${order.id})">Zatwierdz</button>`
                    }
                    </td>
                `;
                orderList.appendChild(row);
            });

            // Obliczanie i wyœwietlanie sumy zamówieñ
            const total = orders.reduce((sum, order) => sum + parseFloat(order.cena), 0).toFixed(2);
            const totalRow = document.createElement('tr');
            totalRow.innerHTML = `
                <td colspan="2"><strong>£¹czna suma:</strong></td>
                <td><strong>${total} z³</strong></td>
                <td></td>
            `;
            orderList.appendChild(totalRow);
        })
        .catch(error => console.error('B³¹d ³adowania zamówieñ:', error));
}


document.getElementById('promocja-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const kod = document.getElementById('kod').value.trim();
    const znizka = document.getElementById('znizka').value.trim();

    try {
        const response = await fetch('/promocje/dodaj', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ kod, znizka })
        });

        const result = await response.json();
        const messageDiv = document.getElementById('response-message');

        if (response.ok) { 
            messageDiv.style.color = 'green';
            messageDiv.textContent = result.message;
            document.getElementById('promocja-form').reset(); 
        } else { 
            messageDiv.style.color = 'red';
            messageDiv.textContent = result.message || 'Wyst¹pi³ b³¹d.';
        }
    } catch (error) {
        console.error('B³¹d podczas dodawania promocji:', error);
        alert('Wyst¹pi³ b³¹d podczas dodawania promocji. Spróbuj ponownie póŸniej.');
    }
});

async function fetchPromocje() {
    try {
        const response = await fetch('/promocje');
        const promocje = await response.json();

        const tabela = document.getElementById('promocje-tabela');
        tabela.innerHTML = ''; 

        promocje.forEach(promocja => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${promocja.id}</td>
                <td>${promocja.kod}</td>
                <td>${promocja.znizka}%</td>
                <td><button onclick="usunPromocje(${promocja.id})">Usuñ</button></td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error('B³¹d podczas pobierania promocji:', error);
    }
}

async function usunPromocje(id) {
    try {
        const response = await fetch(`/promocje/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Promocja zosta³a usuniêta!');
            fetchPromocje();
        } else {
            alert('B³¹d podczas usuwania promocji');
        }
    } catch (error) {
        console.error('B³¹d podczas usuwania promocji:', error);
    }
}

window.onload = function () {
    fetchPromocje();
    loadCategories();
    loadProducts();
    loadOrders();
};
