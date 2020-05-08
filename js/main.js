'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

const cart = JSON.parse(localStorage.getItem('deliveryCart')) || []; // если отсутствует
//значение в ЛокалСтораж то присвоим пустой масив. Так не будет ошибки при
// попытке рендерить корзину не добавляя товаров при пустом ЛокалСтораж.
// Проверяющий наверно должен очищать свой ЛС перед запуском. Но это не точно.
// Наверно надо еще добавить отчистку корзины когда выходим из профиля,
// потому что без бэка мы никак не можем проверить хозяина корзины.

const getData = async function(url) {
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}!`);
  }

  return await response.json();
};

getData('./db/partners.json');

let login = localStorage.getItem('delivery');

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth() {
  modalAuth.classList.toggle('is-open');
}

  function authorized() {

    function logOut() {
      login = null;
      localStorage.removeItem('delivery');
      buttonAuth.style.display = '';
      userName.style.display = '';
      buttonOut.style.display = '';
      cartButton.style.display = '';
      buttonOut.removeEventListener('click', logOut);
      checkAuth();
    }

    userName.textContent = login;

    cartButton.style.display = 'flex';
    buttonAuth.style.display = 'none';
    userName.style.display = 'inline';
    buttonOut.style.display = 'flex';

    buttonOut.addEventListener('click', logOut);
  }

  function notAuthorized() {

    function logIn(event) {
      event.preventDefault();
      login = loginInput.value;

      localStorage.setItem('delivery', login);

      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();

      if(!login) {
        alert('Введите логин, будьте добры.');
        toggleModalAuth();
        loginInput.style.border = '1px solid red';
      }
    }

    buttonAuth.addEventListener('click', toggleModalAuth);
    closeAuth.addEventListener('click', toggleModalAuth);
    logInForm.addEventListener('submit', logIn);
  }

  function checkAuth() {
    if (login) {
      authorized();
    } else {
      notAuthorized();
    }
  }

  function createCardRestaraunt({image, kitchen, name, price, stars, products, 
    time_of_delivery: timeOfDelivery }) {

      const card = `
        <a class="card card-restaurant" data-products = "${products}">
          <img src="${image}" alt="image" class="card-image"/>
          <div class="card-text">
            <div class="card-heading">
              <h3 class="card-title">${name}</h3>
              <span class="card-tag tag">${timeOfDelivery} мин</span>
            </div>
            <div class="card-info">
              <div class="rating">
                ${stars}
              </div>
              <div class="price">От ${price} ₽</div>
              <div class="category">${kitchen}</div>
            </div>
          </div>
      </a>
    `;

    cardsRestaurants.insertAdjacentHTML('beforeend', card);

  }


  function createCardGood({ id, name, description, price, image }) {



    const card = document.createElement('div');

    card.className = 'card';

    card.insertAdjacentHTML('beforeend', `
        <img src="${image}" alt="image" class="card-image"/>
        <div class="card-text">
          <div class="card-heading">
            <h3 class="card-title card-title-reg">${name}</h3>
          </div>
          <div class="card-info">
            <div class="ingredients">${description}
            </div>
          </div>
          <div class="card-buttons">
            <button class="button button-primary button-add-cart" id="${id}">
              <span class="button-card-text">В корзину</span>
              <span class="button-cart-svg"></span>
            </button>
            <strong class="card-price card-price-bold">${price} ₽</strong>
          </div>
        </div>
    `);

    cardsMenu.insertAdjacentElement('beforeend', card);
  }

  function openGoods(event) {
    const target = event.target;

    const restaurant = target.closest('.card-restaurant');

    let cardTitle = restaurant.querySelector('.card .card-title');
    let restaurantTitle = document.querySelector('.restaurant-title');

    let cardStar = restaurant.querySelector('.card .rating');
    let price = restaurant.querySelector('.card .price');
    let category = restaurant.querySelector('.card .category');
    let restaurantStar = document.querySelector('.section-heading .rating');
    let restaurantPrice = document.querySelector('.section-heading .price');
    let restaurantCategory = document.querySelector('.section-heading .category');

    restaurantTitle.textContent = cardTitle.textContent;
    restaurantStar.textContent = cardStar.textContent;
    restaurantPrice.textContent = price.textContent;
    restaurantCategory.textContent = category.textContent;

    if(restaurant) {
      if(!login) {
        toggleModalAuth();
        loginInput.style.border = '1px solid red';
        return;
      } else {
      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      getData(`./db/${restaurant.dataset.products}`).then(function(data) {
        data.forEach(createCardGood);
      });
      }
    }
  }

  function addToCart(event) {

    const target = event.target;

    const buttonAddToCart = target.closest('.button-add-cart');

    if (buttonAddToCart) {
      const card = target.closest('.card');

      const title = card.querySelector('.card-title-reg').textContent;

      const cost = card.querySelector('.card-price').textContent;

      const id = buttonAddToCart.id;

      const food = cart.find(function(item) {
        return item.id === id;
      });

      if (food) {
        food.count += 1;
      } else {
        cart.push({
          id,
          title,
          cost,
          count: 1
        });
      }
      localStorage.setItem('deliveryCart', JSON.stringify(cart));
    }
  }
  
  function renderCart() {
    modalBody.textContent = '';

    cart.forEach(function({ id, title, cost, count }) {
      const itemCart = `
        <div class="food-row">
            <span class="food-name">${title}</span>
            <strong class="food-price">${cost}</strong>
            <div class="food-counter">
              <button class="counter-button counter-minus" data-id=${id}>-</button>
              <span class="counter">${count}</span>
              <button class="counter-button counter-plus" data-id=${id}>+</button>
            </div>
				</div>
      `;
      modalBody.insertAdjacentHTML('afterbegin', itemCart);
    });

    const totalPrice = cart.reduce(function(result, item) {
      return result + (parseFloat(item.cost) * item.count);
    }, 0);
    modalPrice.textContent = totalPrice + ' ₽';
    localStorage.setItem('deliveryCart', JSON.stringify(cart));
  }


  // Плюс и минус продукта в корзине
  function changeCount(event) {
    const target = event.target;

    if (target.classList.contains('counter-button')) {
      const food = cart.find(function(item) {
        return item.id === target.dataset.id;
      });
      if (target.classList.contains('counter-minus')) {
        food.count--;
        if (food.count === 0) {
          cart.splice(cart.indexOf(food), 1);
        }
      }
      if (target.classList.contains('counter-plus'))  food.count++;
      renderCart();
    }
  }

  function init() {
    getData('./db/partners.json').then(function(data) {
      data.forEach(createCardRestaraunt);
    });
    
    logo.addEventListener('click', function() {

        containerPromo.classList.remove('hide');

        restaurants.classList.remove('hide');

        menu.classList.add('hide');
    });

        cardsMenu.addEventListener('click', addToCart);

        buttonClearCart.addEventListener('click', function() {
          cart.length = 0;
          renderCart();
        });

        cartButton.addEventListener("click", function() {
          renderCart();
          toggleModal();
        });

        modalBody.addEventListener('click', changeCount);

        close.addEventListener("click", toggleModal);

        cardsRestaurants.addEventListener('click', openGoods);

        buttonAuth.addEventListener('click', toggleModalAuth);

        closeAuth.addEventListener('click', toggleModalAuth);

        checkAuth();
  }

  new Swiper('.swiper-container', {
    loop: true,
    autoplay: true,
  });

  init();