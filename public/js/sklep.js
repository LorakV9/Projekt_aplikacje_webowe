let cart = [];

async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/categories');
        if (!response.ok) throw new Error('B³¹d serwera przy ³adowaniu kategorii');

        const categories = await response.json();
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';

        categories.forEach(category => {
            const categoryItem = document.createElement('li');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `category-${category.id}`;
            checkbox.name = 'category';
            checkbox.value = category.categoryid;

            const label = document.createElement('label');
            label.setAttribute('for', checkbox.id);
            label.textContent = category.name;

            categoryItem.appendChild(checkbox);
            categoryItem.appendChild(label);
            categoryList.appendChild(categoryItem);
        });
    } catch (err) {
        console.error('B³¹d pobierania kategorii:', err);
    }
}

document.getElementById('category-list').addEventListener('change', () => {
    const selectedCategories = getSelectedCategories();
    loadProducts(0, 1000, '', selectedCategories);
});

async function loadProducts(minPrice = 0, maxPrice = 1000, searchQuery = '', selectedCategories = []) {
    try {
        const categoryParams = selectedCategories.length
            ? `&categoryid=${selectedCategories.join(',')}`
            : '';
        const queryParams = `?minPrice=${minPrice}&maxPrice=${maxPrice}&searchQuery=${encodeURIComponent(searchQuery)}`;
        const response = await fetch(`http://localhost:3000/api/products${queryParams}${categoryParams}`);

        if (!response.ok) throw new Error('B³¹d serwera');

        const products = await response.json();
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';

        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');

            const name = document.createElement('h3');
            name.textContent = product.name;

            const price = document.createElement('p');
            price.classList.add('price');
            price.textContent = `Cena: ${parseFloat(product.price).toFixed(2)} zl`;

            const addToCartButton = document.createElement('button');
            addToCartButton.classList.add('add-to-cart');
            addToCartButton.textContent = 'Dodaj do koszyka';
            addToCartButton.addEventListener('click', () => addToCart(product));

            productDiv.appendChild(name);
            productDiv.appendChild(price);
            productDiv.appendChild(addToCartButton);
            productList.appendChild(productDiv);
        });
    } catch (err) {
        console.error('B³¹d pobierania produktów:', err);
        document.getElementById('product-list').innerText = 'B³¹d podczas ³adowania produktów.';
    }
}

function addToCart(product) {
    console.log('Produkt do dodania do koszyka:', product);

    const amount = 1;

    fetch('/api/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productid: product.productid,
            amount: amount,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('OdpowiedŸ z serwera:', data);
            fetchCart();
        })
        .catch(error => {
            console.error('B³¹d:', error);
        });
}

function removeFromCart(productid) {
    fetch('/api/remove-from-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productid: productid
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            fetchCart();
        })
        .catch(error => {
            console.error('B³¹d:', error);
        });
}

function fetchCart() {
    fetch('/api/cart', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(cartItems => {
            console.log('Produkty w koszyku:', cartItems);
            updateCart(cartItems);
        })
        .catch(error => console.error('B³¹d pobierania koszyka:', error));
}

function updateCart(cartItems) {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p>Twoj koszyk jest pusty.</p>';
    } else {
        cartItems.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');

            const itemName = document.createElement('p');
            itemName.textContent = item.name;

            const itemPrice = document.createElement('p');
            itemPrice.textContent = `Cena: ${parseFloat(item.price).toFixed(2)} zl`;

            const itemAmount = document.createElement('p');
            itemAmount.textContent = `Ilosc: ${item.amount}`;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Usun';
            removeButton.addEventListener('click', () => removeFromCart(item.productid));

            cartItemDiv.appendChild(itemName);
            cartItemDiv.appendChild(itemPrice);
            cartItemDiv.appendChild(itemAmount);
            cartItemDiv.appendChild(removeButton);

            cartItemsContainer.appendChild(cartItemDiv);
        });

        const totalPrice = cartItems.reduce((total, item) => total + parseFloat(item.price) * item.amount, 0);
        const totalPriceElement = document.createElement('p');
        totalPriceElement.textContent = `Suma: ${totalPrice.toFixed(2)} zl`;
        cartItemsContainer.appendChild(totalPriceElement);
    }
}

document.getElementById('checkout-button').addEventListener('click', () => {
    const userId = 1;
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const promoCodeInput = document.getElementById('promo-code').value.toUpperCase();

    fetch('/zamowienie/przenies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uzytkownik_id: userId,
            data: currentDate,
            promoCode: promoCodeInput
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                document.getElementById('cart-items').innerHTML = '';
            }
        })
        .catch(error => console.error('B³¹d:', error));
});

document.getElementById('apply-filters').addEventListener('click', () => {
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || 1000;
    const searchQuery = document.getElementById('search').value;

    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => parseInt(checkbox.value));

    loadProducts(minPrice, maxPrice, searchQuery, selectedCategories);
});

document.getElementById('cart-button').addEventListener('click', () => {
    document.getElementById('cart-panel').style.right = '0';
});

document.getElementById('close-cart').addEventListener('click', () => {
    document.getElementById('cart-panel').style.right = '-300px';
});

let promoApplied = false;
let promoUsed = false;

async function applyPromoCode() {
    const promoCodeInput = document.getElementById('promo-code').value.toUpperCase();
    const promoMessage = document.getElementById('promo-message');

    if (!promoCodeInput) {
        promoMessage.textContent = 'WprowadŸ kod promocyjny.';
        promoMessage.style.color = 'red';
        return;
    }

    if (promoUsed) {
        promoMessage.textContent = 'Kod promocyjny zosta³ ju¿ zastosowany do tego zamówienia.';
        promoMessage.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/api/verify-promo-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ promoCode: promoCodeInput }),
        });

        const data = await response.json();

        if (response.ok) {
            const discount = data.discount;
            const cartItems = document.querySelectorAll('.cart-item');

            if (cartItems.length === 0) {
                promoMessage.textContent = 'Koszyk jest pusty. Dodaj produkty, aby u¿yæ kodu.';
                promoMessage.style.color = 'red';
                return;
            }

            const totalPriceElement = document.querySelector('#cart-items p:last-child');
            const totalPrice = parseFloat(totalPriceElement.textContent.replace('Suma: ', '').replace(' z³', ''));
            const discountedPrice = totalPrice - (totalPrice * (discount / 100));

            totalPriceElement.textContent = `Suma po zni¿ce: ${discountedPrice.toFixed(2)} z³`;
            promoMessage.textContent = `Kod promocyjny zastosowany! Zni¿ka: ${discount}%`;
            promoMessage.style.color = 'green';

            promoApplied = true;
            promoUsed = true;
        } else {
            promoMessage.textContent = data.message || 'Nieprawid³owy kod promocyjny.';
            promoMessage.style.color = 'red';
        }
    } catch (err) {
        promoMessage.textContent = 'B³¹d serwera przy weryfikacji kodu.';
        promoMessage.style.color = 'red';
        console.error('B³¹d:', err);
    }
}

document.getElementById('checkout-button').addEventListener('click', () => {
    alert(promoApplied ? 'Przechodzisz do platnosci ze znizka.' : 'Przechodzisz do platnoœci bez znizki.');

    promoApplied = false;
    promoUsed = false;

    document.getElementById('promo-code').value = '';
    document.getElementById('promo-message').textContent = '';

    const totalPriceElement = document.querySelector('#cart-items p:last-child');
    if (totalPriceElement) {
        totalPriceElement.textContent = `Suma: ${parseFloat(totalPriceElement.textContent.replace('Suma po znizce: ', '').replace(' z³', '')).toFixed(2)} z³`;
    }
});

document.getElementById('apply-promo').addEventListener('click', applyPromoCode);

window.onload = () => {
    loadCategories();
    loadProducts();
};
