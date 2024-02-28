// Put all the javascript code here, that you want to execute after page load.

// Вешаем обработчик события на весь документ
document.addEventListener('click', e => {
	try {
		// если зашли на нужную нам вкладку то запускаем скрипт
		if (e.target.innerText === 'Журнал госпитализации') {
			startPrint();
		}
	} catch (e) {
		console.log(e)
	}
});

// Создаем кнопку
function createBtn(parentNode) {
	const img = document.createElement('img');
	img.classList.add('print');
	img.src = 'Images/s.gif';
	const td_1 = document.createElement('td');
	td_1.classList.add('item-base');
	td_1.append(img);
	const td_2 = document.createElement('td');
	td_2.innerText = 'Отправить на печать';
	const td_3 = document.createElement('td');
	const btn = document.createElement('tr');
	btn.classList.add('item-base');
	btn.classList.add('testingBarsBtn');
	btn.style.height = '24px';
	btn.append(td_1);
	btn.append(td_2);
	btn.append(td_3);
	// Кнопка добавляется после второго элемента в списке, если добавить первой то нарушается работа БАРСА и выкидывает ошибку в консоль, с ошибкой работает но глаза мозолит
	parentNode.insertBefore(btn, parentNode.childNodes[1]);
}

// Функция отправки данных на принтер
async function sendD(data) {

	await fetch('http://127.0.0.1:3333/printEtiketok/', {
		method: 'POST',
		mode: "no-cors",
		body: data,
		header: ("Content-Type", "text/plain")
	})
		.catch(() => {
			alert('Ошибка отправки на печать');
		})
}

// Собираем данные с нужных полей и отправляем их
function dataGeneration() {
	let tabActive = document.querySelectorAll('.active')[0]; // Получаем активную строку
	let selectColumn = tabActive.querySelectorAll('.column_data'); // получаем все колонки в данной строке
	let numIb, fullName, dateBirth; // Создаем переменные под будущие данные

	selectColumn.forEach(column => { // Перебираем массив с колонками
		switch (column.getAttribute('column_name')){ // Ищем по атрибуду необходимые колонки и записываем данные в ранее созданные переменные
			case 'DEPBED':
				numIb = column.lastChild.innerText;
				break;
			case 'PAT_STATUS':
				column.childNodes.forEach(item => {
					if (item.tagName == 'A') {
						fullName = item.innerText;
					}
				})
				break;
			case 'PATIENT_BIRTHDATE':
				dateBirth = column.lastChild.innerText;
				break;
			default:
				break;
		}
	})

	if (numIb.indexOf(',') !== -1) {  // Отметаем кривые номера, в которые добавлен адрес
		numIb = numIb.slice(0, numIb.indexOf(','));
	}

	numIb = numIb.replace(/\&/g, '_');
	fullName = fullName.replace(/\&/g, '_');

	// Формируем строку с данными перед отправкой
	let data = `${numIb}&${fullName}&${dateBirth}`;

	sendD(data);

	// Закрываем модальное окно
	document.querySelectorAll('#PopUp_Menu_P_HPK_PLAN .popup-menu')[document.querySelectorAll('#PopUp_Menu_P_HPK_PLAN .popup-menu').length - 1].style.display = 'none';
}

// Основной скрипт
function startPrint() {
	// Ожидаем появления нужного нам списка элементов с помощью setInterval
	const searchList = setInterval(() => {
		if (document.querySelector('#PopUp_Menu_P_HPK_PLAN')) {
			// Получаем искомый нами список и создаем новую кнопку в нем
			let menu = document.querySelectorAll('#PopUp_Menu_P_HPK_PLAN .popup-menu')[document.querySelectorAll('#PopUp_Menu_P_HPK_PLAN .popup-menu').length - 1];
			createBtn(menu.querySelectorAll('table > tbody')[0]);
			// Если кнопка создана то добавляем к ней события
			if (document.querySelector('.testingBarsBtn')) {
				console.log('create events');
				document.querySelector('.testingBarsBtn').addEventListener('click', dataGeneration);
				document.querySelector('.testingBarsBtn').addEventListener('mouseenter', (e) => {
					if (e.target.classList.contains('testingBarsBtn')) {
						e.target.classList.remove('item-base');
						e.target.classList.add('item-active');
					}
					console.log('mouse enter');
				});
				document.querySelector('.testingBarsBtn').addEventListener('mouseleave', (e) => {
					if (e.target.classList.contains('testingBarsBtn')) {
						e.target.classList.add('item-base');
						e.target.classList.remove('item-active');
					}
					console.log('mouse leave');
				});
			}
			// Удаляем интервал
			clearInterval(searchList);
		}
	}, 2000);
}

console.log('Запуск CodePrintBars');

