const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
    dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
    inputCitiesTo = formSearch.querySelector('.input__cities-to'),
    dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
    inputDateDepart = formSearch.querySelector('.input__date-depart'),
    cheapesTicket = document.getElementById('cheapest-ticket'),
    otherCheapTicket = document.getElementById('other-cheap-tickets');

let cities = [];
const CITIES_API = 'http://api.travelpayouts.com/data/ru/cities.json',
    PROXY = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = '30a48c0020cfdeab3a50d457bd288a23',
    CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload',
    MAX_COUNT = 15;


const showCity = (input, list) => {
    list.textContent = '';

    if (input.value === '') {
        return;
    }

    const filterCity = cities.filter((item) => {
        const fixItem = item.name.toLowerCase();
        return fixItem.startsWith(input.value.toLowerCase());

    });

    //выводим в списке снизу
    filterCity.forEach((item) => {
        const li = document.createElement('li');
        li.classList.add('dropdown__city');
        li.textContent = item.name;
        list.append(li);
    });

};


const selectSity = (event, input, list) => {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;
        list.textContent = '';
    }
};

const getData = (url, callBack, reject = console.error) => {
        const request = new XMLHttpRequest();
        request.open('GET', url);

        request.addEventListener('readystatechange', () => {
            if (request.readyState !== 4) {
                return;
            }

            if (request.status === 200) {
                callBack(request.response);
            } else {
                console.error(request.status);
                reject(request.status)
            }

        });
        
        request.send();
    
};

const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадоками';
    } else {
        return 'Без пересадок';
    }
};

const getNameCity = (code) => {
    const objCities = cities.find(item => item.code === code);
    return objCities.name;
};

const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getLinkAviasales = (data) => {
    let link = 'https://www.aviasales.by/search/';
    link += data.origin;

    const date = new Date(data.depart_date);

    const day = date.getDay();
    link += day < 10 ? '0' + day : day;

    const month = date.getMonth() + 1;
    link += month < 10 ? '0' + month : month;

    link += data.destination;

    link += '1'; //одно место
    console.log(link);
    return link;
};


const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if (data) {
        deep = `
        <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href=${getLinkAviasales(data)} target ="_blank" class="button button__buy">Купить
                    за ${data.value}₽</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города:
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)}</div>
                </div>
        
                <div class="block-right">
                    <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
            </div>
        </div>
            `;
    } else {
        deep = '<h3>К сожалению на текущую дату билетов не нашлось :(</h3>';
    }

    ticket.insertAdjacentHTML('afterbegin', deep);
    return ticket;
};


const renderCheapYear = (cheapTicket) => {
    otherCheapTicket.style.display = 'block';
    otherCheapTicket.innerHTML = '<h2>Самыe дешевыe билеты на другие даты</h2>';

    cheapTicket.sort((a, b) => a.value - b.value);

    console.log('cheapYear', cheapTicket);

    for (let i = 0; i < cheapTicket.length && i < MAX_COUNT; i++) {
        const ticket = createCard(cheapTicket[i]);
        otherCheapTicket.append(ticket);
    }
};

const renderCheapDay = (cheapTiket) => {
    cheapesTicket.style.display = 'block';
    cheapesTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

    const ticket = createCard(cheapTiket[0]);
    cheapesTicket.append(ticket);
    //console.log(ticket);
};


const renderCheap = (data, date) => {
    const cheapTiketsYear = JSON.parse(data).best_prices;

    const cheapTiketsDay = cheapTiketsYear.filter(item => {
        return item.depart_date === date;
    });

    renderCheapYear(cheapTiketsYear);
    renderCheapDay(cheapTiketsDay);

};

inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', (event) => {
    selectSity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', (event) => {
    selectSity(event, inputCitiesTo, dropdownCitiesTo);
});

document.body.addEventListener('click', ()=>{

});

formSearch.addEventListener('submit', (event) => {
    event.preventDefault();//чтобы не перегружалась страница    
    const formData = {
        from: cities.find(item => inputCitiesFrom.value === item.name), //true при совпадении условия
        to: cities.find(item => inputCitiesTo.value === item.name),
        when: inputDateDepart.value
    };

    if (formData.from && formData.to) {
        //?depart_date=2020-05-29&origin=SVX&destination=KGD&one_way=true&token=
        const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}` +
            `&destination=${formData.to.code}&one_way=true&token=${API_KEY}`;

        getData(PROXY + CALENDAR + requestData, (response) => {
            renderCheap(response, formData.when)
        }, (e) => {
            alert('В этом направлении рейсов нет');
            console.log('Ошибка: ' + e);
        });
    } else {
        alert('Введите корректно город');
    }

});

getData(PROXY + CITIES_API, (data) => {
    cities = JSON.parse(data).filter(item => { return item.name });//возвращает те элементы у которых есть name 
    cities.sort((a, b) => {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }

        return 0;
    });
});
