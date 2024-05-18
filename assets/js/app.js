'use strict';

import { useDynamicAdapt } from './data-da.min.js';

document.addEventListener('DOMContentLoaded', function() {
	let html = document.documentElement,
		body = document.querySelector('body'),
		menuControlButtons = body.querySelectorAll('.block__button'),
		submenuBlock = body.querySelector('.block__submenu'),
		menuButtons = body.querySelectorAll('.block__menu-btn'),
		submenuItems = body.querySelectorAll('.block__submenu-block'),
		closeSubmenuButton = body.querySelector('.block__submenu-close'),
		buttonSwitch = body.querySelector('.block__switch'),
		firstPlayButton = body.querySelector('.first__play'),
		menuCheckPoint = window.matchMedia('(min-width: 992px'),
		spoilerButtons = body.querySelectorAll('[data-spoiler-button]'),
		classActive = 'is-active', // Название класса, для активного элемента.
		classOpenMenu = 'open-menu', // Название класса, для открывания меню.
		animateSpeed = 300, // Скорость анимации.
		closingMenu = function() {
			body.style.overflow = '';
			body.classList.remove(classOpenMenu);

			menuControlButtons.forEach(mcButton => {
				mcButton.ariaLabel = 'Open the menu';
			});
		}, // Функция закрытия меню.
		externalClosingMenu = function(e) {
			if (!menuCheckPoint.matches) {
				if (e.target.closest('.block__part--menu') === null && e.target.closest('.block__button') === null) {
					closingMenu();
					body.removeEventListener('click', externalClosingMenu, false);
				};

			} else {
				body.removeEventListener('click', externalClosingMenu, false);
			};
		}, // Функция внешнего закрытия меню.
		openingSubmenu = function(openingList) {
			// Откроем нужный список:
			submenuItems.forEach(subItem => {
				let getTargetList = subItem.getAttribute('data-target-list'); // Название списка.
				getTargetList === openingList ? subItem.classList.add(classActive) : subItem.classList.remove(classActive);
			});

			// Покажем блок со списком:
			if (submenuBlock !== null && !submenuBlock.classList.contains(classActive)) submenuBlock.classList.add(classActive);
		}, // Функция открытия субменю.
		closingSubmenu = function() {
			if (menuCheckPoint.matches) {
				if (submenuBlock !== null && submenuBlock.classList.contains(classActive)) submenuBlock.classList.remove(classActive);
			};
		}; // Функция закрытия субменю.

	/* Функция показа скрытого контента.
		@param {BOOLEAN} dir - направление действия: true - открыть, false - закрыть. 
		@param {OBJECT} el - скрытый блок.
		@param {STRING} closeClass - закрывающий класс. */
	let showHiddenContent = function(dir, el, closeClass = 'is-close') {
		el.style.blockSize = `${el.scrollHeight}px`;
	
		if (!dir) {
			// Закрываем блок:
			el.style.blockSize = `${el.scrollHeight}px`;
			el.classList.add(closeClass);
		};
	
		let adaptiveHeight = setTimeout(function() {
			el.style.blockSize = '';
			el.classList.remove(closeClass);
	
			clearTimeout(adaptiveHeight);
		}, animateSpeed + 100);
	};

	// Переключение темной (светлой) темы:
	if (buttonSwitch !== null) {
		let listBtnNames = ['Switch&nbsp;to light mode', 'Switch&nbsp;to dark mode'],
			buttonTextBlock = buttonSwitch.querySelector('.block__switch-text'),
			classDarkTheme = 'dark-theme',
			memoryName = 'current-theme',
			changingTheme = function(theme) {
				if (theme === 'light') {
					html.classList.remove(classDarkTheme);
					buttonSwitch.ariaLabel = listBtnNames[1];
					buttonTextBlock.innerHTML = listBtnNames[1];

				} else {
					html.classList.add(classDarkTheme);
					buttonSwitch.ariaLabel = listBtnNames[0];
					buttonTextBlock.innerHTML = listBtnNames[0];
				};
			};

		// Проверяем, была ли выбрана тема:
		if (localStorage.getItem(memoryName) !== null) {
			localStorage.getItem(memoryName) === 'light' ? changingTheme('light') : changingTheme('dark');

		} else {
			localStorage.setItem(memoryName, 'light');
		};

		buttonSwitch.addEventListener('click', function() {
			if (html.classList.contains(classDarkTheme)) {
				changingTheme('light');
				localStorage.setItem(memoryName, 'light');

			} else {
				changingTheme('dark');
				localStorage.setItem(memoryName, 'dark');
			};
		});
	};

	// Управление меню:
	menuControlButtons.forEach(controlButton => {
		controlButton.addEventListener('click', function() {
			if (body.classList.contains(classOpenMenu)) {
				closingMenu();

			} else {
				body.style.overflow = 'hidden';
				body.classList.add(classOpenMenu);

				body.addEventListener('click', externalClosingMenu, false);

				menuControlButtons.forEach(mcButton => {
					mcButton.ariaLabel = 'Close the menu';
				});
			};
		});
	});

	if (menuCheckPoint.matches) closingMenu();
	menuCheckPoint.addEventListener('change', closingMenu, false);

	// Управление подменюшками:
	menuButtons.forEach(menuBtn => {
		let getOpeningList = menuBtn.getAttribute('data-opening-list'); // Какой список открыть.

		menuBtn.addEventListener('click', function() {
			if (!menuCheckPoint.matches) openingSubmenu(getOpeningList);
		});

		menuBtn.addEventListener('mouseover', function() {
			if (menuCheckPoint.matches) openingSubmenu(getOpeningList);
		});

		menuBtn.addEventListener('mouseout', closingSubmenu, false);
	});

	submenuBlock.addEventListener('mouseover', function() {
		if (menuCheckPoint.matches) {
			if (submenuBlock !== null && !submenuBlock.classList.contains(classActive)) submenuBlock.classList.add(classActive);
		};
	});

	submenuBlock.addEventListener('mouseout', closingSubmenu, false);

	// Закрываем подменю:
	if (closeSubmenuButton !== null) {
		closeSubmenuButton.addEventListener('click', function() {
			if (submenuBlock.classList.contains(classActive)) submenuBlock.classList.remove(classActive);
		});
	};

	// Управление кнопками-спойлерами:
	spoilerButtons.forEach(spoilerBtn => {
		let hiddenBlock = spoilerBtn.nextElementSibling; // Скрытый блок.

		spoilerBtn.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if (spoilerBtn.classList.contains(classActive)) {
				showHiddenContent(false, hiddenBlock);
				spoilerBtn.classList.remove(classActive);

			} else {
				showHiddenContent(true, hiddenBlock);
				spoilerBtn.classList.add(classActive);
			};
		});
	});

	// Управление видео, на первом экране:
	if (firstPlayButton !== null) {
		let firstVideo = firstPlayButton.previousElementSibling, // Видео-блок.
			classPaused = 'paused'; // Название классы, для паузы видео.

		if (firstVideo !== null && firstVideo.tagName === 'VIDEO') {
			firstPlayButton.addEventListener('click', function() {
				if (firstPlayButton.classList.contains(classPaused)) {
					firstVideo.play();
					firstPlayButton.classList.remove(classPaused);

				} else {
					firstVideo.pause();
					firstPlayButton.classList.add(classPaused);
				};
			});
		};
	};

	useDynamicAdapt();
});