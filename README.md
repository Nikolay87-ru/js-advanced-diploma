# Дипломное задание к курсу «Продвинутый JavaScript». Retro Game"

![Game](/src/img/readme_img/game.png)

## Технологический стек
- **Babel** (v7.27) - компилятор ES6+
- **Webpack** (v5.99) - сборщик проекта
- **ESLint** (v9.27) + **Prettier** (v3.5) - линтинг и форматирование
- **Core-JS** (v3.42) - полифиллы для ES6+
- **Jest** (v29.7) - тестирование
- **AppVeyor** - CI/CD

***

## [Условия задачи](https://github.com/netology-code/js-advanced-diploma "Ссылка на задание по дипломному проекту")

### 1. Настройка проекта
- [x] Конфигурация Webpack с поддержкой:
  - Asset Modules для изображений
  - Babel-loader для транспиляции
  - DevServer с hot reload
- [x] Настройка ESLint с правилами Airbnb + Prettier
- [x] Подключение Core-JS для полифиллов
- [x] Конфигурация Jest + AppVeyor для CI

### 2. Логика игры

#### 1. Персонажи и их характеристики

Каждый персонаж наследуется от базового класса **Character** и имеет:

**Тип** (`swordsman`, `bowman`, `magician`, `vampire`, `undead`, `daemon`)

**Уровень** (от 1 до 4)

**Здоровье** (`health`, `maxHealth`)

**Атаку** (случайный урон в диапазоне, например, `30-40`)

**Защиту** (`defence`)

**Дальность атаки** (`attackDistance`)

**Дальность перемещения** (`moveDistance`)

**Очки действий** (`actionPoints`, `currentActionPoints`)

**Команду** (`player` или `enemy`)

**Примеры персонажей**:
|**Персонаж**|*Атака*|*Защита*|*Дальность атаки*|*Дальность хода*|*Особенности*|
<!-- |:-|:-|:-|:-|:-|:-|
|:-|:-|:-|:-|:-|:-|
|:-|:-|:-|:-|:-|:-|
|:-|:-|:-|:-|:-|:-|
|:-|:-|:-|:-|:-|:-|
|:-|:-|:-|:-|:-|:-|
|:-|:-|:-|:-|:-|:-| -->
|**Swordsman**|30-40|	10|	    1|	               4|	             Сильная атака, слабая защита|
|**Bowman**	   |15-25|	25|	    3|	               4|	             Дальний бой, дорогой диагональный ход|
|**Magician**	 |10-20|	40|	    4|	               2|	             Дальний бой, медленный|
|**Vampire**	   |15-25|	25|	    2|	               2|	             Враг, баланс атаки/защиты|
|**Undead**	   |30-40|	10|	    2|	               4|	             Враг, сильный урон|
|**Daemon**	   |10-20|	40|	    2|	               2|	             Враг, высокая защита|


***

## Авто-тесты 

- [x] Тесты модуля `utils.test`:
    - Проверка правильности определения типов ячеек
    - Тестирование граничных случаев

- [x] Тесты модуля `character.test`:
  
`inherited classes should not throw errors` - проверяет, что классы-наследники создаются без ошибок.

`Character level 1 stats` - проверяет базовые характеристики персонажей 1 уровня:
  - Атака находится в указанном диапазоне
  - Защита соответствует ожидаемому значению
  - Здоровье равно 50
  - Уровень равен 1

`characterGenerator` - проверяет генератор персонажей:
  - Генерирует бесконечную последовательность персонажей
  - Генерирует только разрешенные типы персонажей
  - Генерирует персонажей с корректными уровнями

`generateTeam` - проверяет генерацию команды:
  - Создает команду с правильным количеством персонажей
  - Персонажи имеют корректные уровни
  - В команду попадают только разрешенные типы
  - Корректно обрабатывает нулевое количество персонажей


- [x] Тесты модуля `gamecontroller.test.js`:

### Тесты для метода `onCellEnter`:

`should show tooltip with correct character info when entering cell with character` - проверяет:
  - Установку курсора в `pointer` при наведении на персонажа
  - Показ tooltip с информацией о персонаже
  - Содержимое tooltip (тип, уровень, здоровье)

`should not show tooltip when entering empty cell` - проверяет:
  - Установку курсора в `default` при наведении на пустую клетку
  - Скрытие tooltip для пустой клетки
  - Отсутствие показа нового tooltip

`should not show green selection when entering selected character cell` - проверяет:
  - Отсутствие выделения зеленым уже выбранного персонажа
  - Показ tooltip для выбранного персонажа

### Тесты для конкретных персонажей:

#### Bowman:
`should have correct attack range and movement` - проверяет:
  - Дальность атаки (3 клетки)
  - Дальность перемещения (4 клетки)
  - Стоимость перемещения по прямой и диагонали

`should calculate attack damage correctly` - проверяет:
  - Диапазон урона обычной атаки (15-25)
  - Стоимость атаки (1 очко)

`should calculate hard attack damage correctly` - проверяет:
  - Диапазон урона усиленной атаки (20-30)
  - Стоимость атаки (2 очка)

#### Swordsman:
`should have correct attack range and movement` - проверяет:
  - Дальность атаки (1 клетка)
  - Дальность перемещения (4 клетки)

`should calculate high melee damage` - проверяет:
  - Диапазон урона (30-40)

#### Magician:
`should have correct attack range and movement costs` - проверяет:
  - Дальность атаки (4 клетки)
  - Дальность перемещения (2 клетки)
  - Стоимость перемещения по прямой и диагонали

`should have resurrect ability` - проверяет:
  - Наличие способности воскрешения
  - Количество восстанавливаемого здоровья (50)
  - Стоимость способности (2 очка)

#### Daemon:
`should have correct attack range and movement` - проверяет:
  - Дальность атаки (2 клетки)
  - Дальность перемещения (2 клетки)
  - Принадлежность к команде врагов

`should calculate high damage with critical chance` - проверяет:
  - Диапазон урона (20-30)

#### Undead:
`should have correct attack range and movement` - проверяет:
  - Дальность атаки (2 клетки)
  - Дальность перемещения (4 клетки)

`should calculate very high damage` - проверяет:
  - Диапазон урона (30-40)

#### Vampire:
`should have correct attack range and movement` - проверяет:
  - Дальность атаки (2 клетки)
  - Дальность перемещения (2 клетки)

`should calculate damage with critical chance` - проверяет:
  - Диапазон урона (10-20)

### Тесты механик:

`should calculate correct move cost for different characters` - проверяет:
  - Расчет стоимости перемещения для разных персонажей
  - Разницу в стоимости прямого и диагонального перемещения

`should generate correct path for movement` - проверяет:
  - Корректность генерации пути перемещения
  - Включение ключевых точек пути

`should perform attack with correct damage calculation` - проверяет:
  - Нанесение урона врагу
  - Отображение анимации урона
  - Корректность работы системы здоровья

`should not allow attack when out of range` - проверяет:
  - Блокировку атаки при слишком большом расстоянии
  - Показ сообщения об ошибке

`should apply defence bonus correctly` - проверяет:
  - Увеличение показателя защиты
  - Обнуление очков действий после защиты
  - Показ сообщения об усилении защиты

### Тесты GameStateService
`should save game state and show success message` - проверяет:
  - Корректное сохранение состояния игры в хранилище
  - Отображение сообщения об успешном сохранении
  - Формат сохраненных данных (сериализация в JSON)

`should show error message when save fails` - проверяет:
  - Обработку ошибок при сохранении
  - Отображение сообщения об ошибке при неудачном сохранении

`should load game state and show success message` - проверяет:
  - Загрузку состояния игры из хранилища
  - Десериализацию JSON в объект GameState
  - Отображение сообщения об успешной загрузке

`should show error message when load fails (invalid data)` - проверяет:
  - Обработку невалидных данных при загрузке
  - Отображение сообщения об ошибке при некорректных данных
  - Генерацию исключения SyntaxError

`should show error message when no saved data` - проверяет:
  - Обработку отсутствия сохраненных данных
  - Отображение сообщения об ошибке
  - Генерацию соответствующего исключения

### Тесты GameController (save/load)
`should bind save and load listeners on init` - проверяет:
  - Инициализацию слушателей событий сохранения и загрузки
  - Привязку callback-функций к соответствующим событиям

`should call stateService.save on saveGame` - проверяет:
  - Вызов метода save у GameStateService при сохранении
  - Корректную работу callback-функции сохранения

`should call stateService.load on loadGame` - проверяет:
  - Вызов метода load у GameStateService при загрузке
  - Корректную работу callback-функции загрузки

`should show error message when save fails` - проверяет:
  - Обработку ошибок при сохранении через GameController
  - Отображение сообщения об ошибке при неудачном сохранении

###### Статус прокрытия кода тестами:
[![Build status](https://ci.appveyor.com/api/projects/status/t6stdwsxbhqq80fs?svg=true)](https://ci.appveyor.com/project/Nikolay87-ru/js-advanced-diploma)