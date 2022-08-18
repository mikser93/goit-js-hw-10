import './css/styles.css';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix';
import { fetchCountries } from './fetchCountries.js';

const DEBOUNCE_DELAY = 300;
const input = document.querySelector('#search-box');
const list = document.querySelector('.country-list');
const div = document.querySelector('.country-info');

input.addEventListener('input', debounce(search, DEBOUNCE_DELAY));

function search(input) {
  input.preventDefault();

  const inputSearch = input.target.value.trim();
  //event.target - це посилання на вихідний елемент, на якому відбулася подія, в процесі спливання вона - незмінна.
  //С помощью свойства value мы можем получить данные из этого поля ввода
  //Виконай санітизацію введеного рядка методом trim(), це вирішить проблему, коли в полі введення тільки пробіли,
  //або вони є на початку і в кінці рядка. (Метод trim() удаляет пробельные символы с начала и конца строки. Пробельными символами
  //в этом контексте считаются все собственно пробельные символы(пробел, табуляция, неразрывный пробел и прочие) и все символы конца строки(LF, CR и прочие)).
  if (!inputSearch) {
    clearPage(); //використати ретьорн перед кліар пейдж, і взагалі спробувати його прибрати
    return;
  }

  fetchCountries(inputSearch)
    .then(countries => {
      clearPage(); //Якщо користувач повністю очищає поле пошуку, то HTTP-запит не виконується, а розмітка списку країн або інформації про країну зникає.
      if (countries.length > 10) {
        Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
        return; //?
      }
      if (countries.length > 1 && countries.length <= 10) {
        ///більше ніж 10 не виводити
        renderContryList(countries);
      } else {
        renderContryCard(countries);
      }
    })
    .catch(() => Notify.failure('Oops, there is no country with that name'));
}

function clearPage() {
  list.innerHTML = '';
  div.innerHTML = '';
}

function renderContryList(countries) {
  const markup = countries
    .map(({ flags, name }) => {
      return `<li class="country-list__item">
            <img
                class="country-list__flag"
                src="${flags.svg}"
                alt="Flag for ${name.official}"
            />
            <h2 class="country-list__name">${name.official}</h2>
        </li>`;
    })
    .join('');
  return list.insertAdjacentHTML('afterbegin', markup);
}

function renderContryCard(countries) {
  const markup = countries
    .map(({ name, capital, population, flags, languages }) => {
      return `
            <h2 class="country-card__name">${name.official}</h2>
            <ul class="country-card__item">
            <li><img
                class="country-card__flag"
                src="${flags.svg}"
                alt="Flag for ${name.official}"
            />
            </li>
            <li class="country-card__detailes"><b>Capital: </b>${capital}</li>
            <li class="country-card__detailes"><b>Population: </b>${population}</li>
            <li class="country-card__detailes"><b>Languages: </b>${Object.values(
              languages
            )}</li>
        </ul>`;
    })
    .join('');
  return div.insertAdjacentHTML('afterbegin', markup);
}
