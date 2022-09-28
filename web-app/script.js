//use strict mode in all scripts
"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// MOCK DATA
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2021-11-18T21:31:17.178Z",
    "2021-12-23T07:42:02.383Z",
    "2022-09-15T09:15:04.904Z",
    "2022-09-20T10:17:24.185Z",
    "2022-09-22T14:11:59.604Z",
    "2022-09-24T17:01:17.194Z",
    "2022-09-25T23:36:17.929Z",
    "2022-09-26T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT",
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// DOM ELEMENTS
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// VARIABLES
let timer;
let userObject;
let sorted = false;

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// FUNCTIONS
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate(
      acc.movementsDates[i],
      acc.locale
    )}</div>
    <div class="movements__value">${formatNumber(mov, acc)}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const displayDate = function (date, region) {
  const movDate = new Date(date);
  const timeLapse = Math.trunc((new Date() - movDate) / (1000 * 60 * 60 * 24));

  if (timeLapse < 1) return "TODAY";
  if (timeLapse < 2) return "YESTERDAY";
  if (timeLapse < 7) return `${timeLapse} days ago`;
  return new Intl.DateTimeFormat(region).format(movDate);
};

const calcSummaryData = function (obj) {
  const deposits = obj.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const withdrawals = obj.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + Math.abs(mov), 0);

  const interest = obj.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + (mov * obj.interestRate) / 100, 0);

  labelSumIn.textContent = `${formatNumber(deposits, obj)}`;
  labelSumOut.textContent = `${formatNumber(withdrawals, obj)}`;
  labelSumInterest.textContent = `${formatNumber(interest, obj)}`;
};

const setHomePage = function (obj) {
  containerApp.style.opacity = 100;

  const now = new Date();

  let greet;
  switch (true) {
    case now.getHours() >= 0 && now.getHours() < 12:
      greet = "Good day";
      break;
    case now.getHours() >= 12 && now.getHours() < 18:
      greet = "Good afternoon";
      break;
    case now.getHours() >= 18 && now.getHours() < 20:
      greet = "Good evening";
      break;
    case now.getHours() >= 20 && now.getHours() <= 23:
      greet = "Good night";
  }

  labelWelcome.textContent = `${greet}, ${obj.owner.split(" ")[0]}!`;
  labelDate.textContent = new Intl.DateTimeFormat(obj.locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
};

const transfer = function (obj) {
  const amount = Number(inputTransferAmount.value);

  const receiverAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  if (
    receiverAccount &&
    receiverAccount.username !== obj.username &&
    amount > 0 &&
    getBalance(obj) >= amount
  ) {
    receiverAccount.movements.push(amount);
    receiverAccount.movementsDates.push(new Date().toISOString());
    obj.movements.push(-amount);
    obj.movementsDates.push(new Date().toISOString());
  } else {
    alert("Transfer denied");
  }
};

const setUsernames = function (arr) {
  arr.forEach((elem) => {
    elem.username = elem.owner
      .toLowerCase()
      .split(" ")
      .map((word) => word[0])
      .join("");
  });
};

const setLogOutTimer = function () {
  let time = 5 * 60; // unit: sec

  const tick = () => {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
      clearInterval(logOutTimer);
    }
    time--;
  };

  tick();
  const logOutTimer = setInterval(tick, 1000);
  return logOutTimer;
};

const getBalance = (obj) => {
  const balance = obj.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatNumber(balance, obj)}`;
  return balance;
};

const formatNumber = (num, obj) =>
  new Intl.NumberFormat(obj.locale, {
    style: "currency",
    currency: obj.currency,
  }).format(num);
// .replace(".", ",")
// .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const updateUI = (obj) => {
  getBalance(obj);
  calcSummaryData(obj);
  displayMovements(obj);
  clearInterval(timer);
  timer = setLogOutTimer();
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// EVENT HANDLERS
btnLogin.addEventListener("click", () => {
  setUsernames(accounts);
  userObject = accounts.find(
    (acc) =>
      acc.username === inputLoginUsername.value &&
      acc.pin === Number(inputLoginPin.value)
  );

  if (userObject) {
    setHomePage(userObject);
    updateUI(userObject);
  }

  inputLoginUsername.value = inputLoginPin.value = "";
});

btnTransfer.addEventListener("click", () => {
  transfer(userObject);
  updateUI(userObject);

  inputTransferTo.value = inputTransferAmount.value = "";
});

btnLoan.addEventListener("click", () => {
  const amount = Math.ceil(inputLoanAmount.value);

  const condition = userObject.movements.some(
    (deposit) => amount > 0 && deposit >= amount * 0.1
  );

  condition
    ? userObject.movements.push(amount) &&
      userObject.movementsDates.push(new Date().toISOString())
    : alert("Request Failed");
  updateUI(userObject);
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", () => {
  const deletedAccount = accounts.findIndex(
    (acc) => acc.username === inputCloseUsername.value
  );

  if (
    userObject.username === accounts[deletedAccount]?.username &&
    userObject.pin === Number(inputClosePin?.value)
  ) {
    accounts.splice(deletedAccount, 1);
    userObject = undefined;
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
  } else {
    alert("Operation denied");
  }

  inputClosePin.value = inputCloseUsername.value = "";
});

btnSort.addEventListener("click", () => {
  displayMovements(userObject, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
