const APP_STORAGE = {
  rectSelectionOn: false,
  searchString: '',
  startDate: false,
  endDate: false,
  selectedDates: [],
  allTodos: [],
  suggestedTodos: [],
  filteredTodos: [],
  openedTodo: null,
  shortLookTodo: null
}

let lastCallTime = 0;

function openModal() {
  const modal = document.getElementById('modal');
  const { name, shortDesc, fullDesc, status } = APP_STORAGE.openedTodo;
  const nameDiv = document.createElement('div');
  nameDiv.textContent = name;
  const shortDescDiv = document.createElement('div');
  shortDescDiv.textContent = shortDesc;
  const fullDescDiv = document.createElement('div');
  fullDescDiv.textContent = fullDesc;
  const statusDiv = document.createElement('div');
  statusDiv.textContent = status ? '✓' : 'NOT COMPLETED';


  modal.appendChild(nameDiv).appendChild(shortDescDiv).appendChild(fullDescDiv).appendChild(statusDiv);
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.innerHTML = '';
  modal.style.display = 'none';
}

function renderTodoList() {
  console.log('renderTodoList called');
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = ''; // Clear the existing list

  console.log('length in render', APP_STORAGE.filteredTodos.length);

  APP_STORAGE.filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    const nameDiv = document.createElement('div');
    const statusDiv = document.createElement('div');
    const shortDescDiv = document.createElement('div');
    const dateDiv = document.createElement('div');

    li.classList.add('todo-li-item');
    nameDiv.classList.add('todo-name');
    statusDiv.classList.add('todo-status');
    shortDescDiv.classList.add('todo-short-desc'); // Corrected typo
    dateDiv.classList.add('todo-date');

    dateDiv.textContent = todo.date;
    nameDiv.textContent = todo.name;
    shortDescDiv.textContent = todo.shortDesc;
    statusDiv.textContent = todo.status ? '✓' : '';

    li.appendChild(dateDiv);
    li.appendChild(nameDiv);
    li.appendChild(statusDiv);
    li.appendChild(shortDescDiv);

    todoList.appendChild(li);
  });
}

const APP_STORAGE_PROXY = new Proxy(APP_STORAGE, {
  set(target, property, value) {
    if (property === 'filteredTodos') {
      target[property] = value;
      renderTodoList();
    }

    if (property === 'openedTodo') {
      target[property] = value;
      value ? openModal() : closeModal();
    }
    return true;
  }
});

const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
const optionsContainer = document.querySelector('.custom-options');

const APICalls = {
  getAllTodos: async () => {
    try {
      const response = await fetch('todos.json');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all todos:', error);
    }
  },

  findTodos: async (stringParam) => {
    try {
      const response = await fetch('todos.json');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const todos = await response.json();
      return todos.filter(todo => todo.name.includes(stringParam));
    } catch (error) {
      console.error(`Error fetching todos with name containing '${stringParam}':`, error);
    }
  },

  getTodosByDates: async (datesArray) => {
    try {
      const response = await fetch('todos.json');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const todos = await response.json();
      return todos.filter(todo => datesArray.includes(todo.date));
    } catch (error) {
      console.error('Error fetching todos by dates:', error);
    }
  }
};

window.onload = function () {

  APICalls.getAllTodos().then(todos => {
    APP_STORAGE.allTodos = [...todos];
    APP_STORAGE_PROXY.filteredTodos = [...todos];
  })

  const customSelects = document.querySelectorAll('.custom-select');
  const options = [];

  customSelects.forEach(customSelect => {
    const trigger = customSelect.querySelector('.custom-select__trigger');

    for (let year = 2023; year <= 2030; year++) {
      const yearOption = document.createElement('span');
      yearOption.classList.add('custom-option');
      yearOption.setAttribute('data-value', year);
      yearOption.textContent = year.toString();

      if (year === currentYear) {
        yearOption.classList.add('selected');
        trigger.textContent = year.toString();
        trigger.setAttribute('data-value', year);
      }

      options.push(yearOption)
      optionsContainer.appendChild(yearOption);
    }

    trigger.addEventListener('click', function () {
      const dropdown = this.parentNode.querySelector('.custom-options');
      dropdown.classList.toggle('open');
    });

    options.forEach(option => {
      option.addEventListener('click', function () {
        const selectedOption = customSelect.querySelector('.selected');
        selectedOption.classList.remove('selected');
        this.classList.add('selected');
        customSelect.querySelector('.custom-select__trigger').textContent = this.textContent;
      });
    });

    document.addEventListener('click', function (e) {
      if (!customSelect.contains(e.target)) {
        const dropdowns = document.querySelectorAll('.custom-options');
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('open');
        });
      }
    });
  });

  const calendarBody = document.querySelector('.calendar-body');
  const monthBtn = document.querySelector('.selected-month');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function initCalendar() {
    monthBtn.textContent = months[currentMonth];
    calendarBody.innerHTML = '';

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {

      const cell = document.createElement('div');

      if (i < firstDayOfMonth || i >= (daysInMonth + firstDayOfMonth)) {
        cell.classList.add('cell', 'empty');
      } else {

        cell.textContent = i - firstDayOfMonth + 1;
        cell.classList.add('cell', 'day');

        const fullDateString = `${currentYear}.${currentMonth + 1}.${cell.textContent.padStart(2, '0')}`;
        const currentDateString = `${currentYear}.${currentMonth + 1}.${currentDate.getDate().toString().padStart(2, '0')}`;

        if (fullDateString === currentDateString) {
          cell.classList.add('selected');
        }

        cell.setAttribute('data-date', fullDateString);
        APP_STORAGE.startDate = fullDateString;
        APP_STORAGE.endDate = fullDateString;
      }
      calendarBody.appendChild(cell);
    }
  }

  function handleMouseDown(event) {
    APP_STORAGE.rectSelectionOn = true;

    const cell = event.target.closest('.day');

    if (cell) {
      startDate = cell.getAttribute('data-date');
      APP_STORAGE.startDate = startDate;
    }
  }

  function handleMouseUp(event) {
    const cell = event.target.closest('.day');

    if (cell) {
      endDate = cell.getAttribute('data-date');

      if (APP_STORAGE.startDate === endDate) {
        cell.classList.toggle('selected');
      }

      APP_STORAGE.endDate = endDate;
    }

    const selectedCells = document.querySelectorAll('.day.selected');
    const newSelectedDates = [];

    if (APP_STORAGE.rectSelectionOn) {
      if (selectedCells.length === 0) {
        APP_STORAGE.startDate = false;
        APP_STORAGE.endDate = false;
        APP_STORAGE.selectedDates = [];
        APP_STORAGE_PROXY.filteredTodos = [];
      } else {
        selectedCells.forEach(cell => {
          const date = cell.getAttribute('data-date');
          newSelectedDates.push(date);
        })

        APP_STORAGE.selectedDates = [...newSelectedDates]
        APICalls.getTodosByDates(APP_STORAGE.selectedDates).then(todos => {
          APP_STORAGE_PROXY.filteredTodos = [...todos];
        });
      }
    }
    APP_STORAGE.rectSelectionOn = false;
  }

  function handleMouseMove(event) {
    if (APP_STORAGE.rectSelectionOn) {
      const cell = event.target.closest('.day');

      if (cell) {
        endDate = cell.getAttribute('data-date');
        APP_STORAGE.endDate = endDate;
        highlightRange(startDate, endDate);
      }
    }
  }
  // }

  function highlightRange(start, end) {
    document.querySelectorAll('.day.selected').forEach(cell => {
      cell.classList.remove('selected');
    });

    const cells = document.querySelectorAll('.day');

    cells.forEach(cell => {
      const cellDate = cell.getAttribute('data-date');
      if (cellDate >= start && cellDate <= end) {
        cell.classList.add('selected');
      }
    });
  }

  calendarBody.addEventListener('mousedown', handleMouseDown);
  calendarBody.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  document.querySelector('.select-today-btn').addEventListener('click', function () {
    const todayString = `${currentYear}.${currentMonth + 1}.${currentDate.getDate().toString().padStart(2, '0')}`;
    const todayCell = document.querySelector(`.day[data-date="${todayString}"]`);

    if (todayCell) {
      document.querySelectorAll('.day.selected').forEach(cell => cell.classList.remove('selected'));
      !todayCell.classList.contains('selected') && todayCell.classList.add('selected');
      APP_STORAGE.startDate = todayString;
      APP_STORAGE.endDate = todayString;
      APP_STORAGE.selectedDates = [todayString];
      APICalls.getTodosByDates(APP_STORAGE.selectedDates).then(todos => {
        APP_STORAGE_PROXY.filteredTodos = [...todos];
      })
    }
  });

  document.querySelector('.select-week-btn').addEventListener('click', function () {
    const todayString = `${currentYear}.${currentMonth + 1}.${currentDate.getDate().toString().padStart(2, '0')}`;
    const todayCell = document.querySelector(`.day[data-date="${todayString}"]`);

    if (todayCell) {
      document.querySelectorAll('.day.selected').forEach(cell => cell.classList.remove('selected'));
      !todayCell.classList.contains('selected') && todayCell.classList.add('selected');

      const selectedDates = [];
      const currentDayOfWeek = currentDate.getDay();
      const startOfWeek = new Date(currentDate); 
      startOfWeek.setDate(startOfWeek.getDate() - currentDayOfWeek); 
      const endOfWeek = new Date(currentDate); 
      endOfWeek.setDate(endOfWeek.getDate() + (6 - currentDayOfWeek)); 

      for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
        const date = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
        const cellToSelect = document.querySelector(`.day[data-date="${date}"]`);
        !cellToSelect.classList.contains('selected') & cellToSelect.classList.add('selected');
        selectedDates.push(date);
      }

      APP_STORAGE.startDate = selectedDates[0]; 
      APP_STORAGE.endDate = selectedDates[selectedDates.length - 1]; 
      APP_STORAGE.selectedDates = selectedDates;

      APICalls.getTodosByDates(APP_STORAGE.selectedDates).then(todos => {
        APP_STORAGE_PROXY.filteredTodos = [...todos];
      });
    }
  });

  const searchInput = document.getElementById('search');
  const suggestionsList = document.getElementById('suggestions');

  searchInput.addEventListener('input', function (event) {
    const searchString = event.target.value.toLowerCase();

    if (searchString.length === 0) {
      APP_STORAGE.suggestedTodos = [];
      suggestionsList.style.display = 'none';
    } else {
      
      APICalls.findTodos(searchString).then(todos => {
        APP_STORAGE.suggestedTodos = [...todos];

        if (APP_STORAGE.suggestedTodos.length > 0) {
          suggestionsList.style.display = 'flex';
          displaySuggestions(APP_STORAGE.suggestedTodos);
        } else {
          suggestionsList.style.display = 'none';
        }
      })
    }
  });

  function displaySuggestions(filteredSuggestions) {
    suggestionsList.innerHTML = '';

    filteredSuggestions.forEach(suggestedTodo => {
      const listItem = document.createElement('li');
      listItem.textContent = suggestedTodo.name;
      
      listItem.addEventListener('click', function () {
        APP_STORAGE_PROXY.openedTodo = suggestedTodo;
        APP_STORAGE.suggestedTodos = [];
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = 'none';
      });
      suggestionsList.appendChild(listItem);
    });
  }

  const modal = document.getElementById('modal');
  const sortingBtn = document.querySelector('.sorting-btn');
  const uncompletedCheckbox = document.querySelector('#uncompleted-checkbox');

  uncompletedCheckbox.addEventListener('change', function () {
    if (uncompletedCheckbox.checked) {
      APP_STORAGE_PROXY.filteredTodos = [...APP_STORAGE.filteredTodos.filter(todo => todo.status === false)]
    } else {
      APP_STORAGE_PROXY.filteredTodos = [...APP_STORAGE.filteredTodos]
    }
  })

  sortingBtn.addEventListener('click', function () {
    APP_STORAGE_PROXY.filteredTodos = [...APP_STORAGE.filteredTodos.sort((a, b) => {
      const date1 = new Date(a.date);
      const date2 = new Date(b.date);
      return date1 - date2;
    })]
  })

  modal.addEventListener('click', function () {
    APP_STORAGE_PROXY.openedTodo = null;
  })

  initCalendar(); 
}



