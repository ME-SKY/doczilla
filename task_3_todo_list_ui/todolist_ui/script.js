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
  const {name, shortDesc, fullDesc, status} = APP_STORAGE.openedTodo;
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


function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function delayFirst(func, delay, beforeNextTime) {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastCallTime;

  if (elapsedTime > beforeNextTime) {
    // If more than half a second has passed, update lastCallTime and call the function immediately
    lastCallTime = currentTime;
    func.apply(this);
  } else {
    // If less than half a second has passed, debounce the function call after 0.35 seconds
    setTimeout(() => {
      lastCallTime = Date.now();
      func.apply(this, args);
    }, delay);
  }
}

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
      console.log('res:');
      console.log(todos);
      console.log('datesArray');
      console.log(datesArray);
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

    // console.log(todos);
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
        const { value } = this.dataset;
        const selectedOption = customSelect.querySelector('.selected');
        selectedOption.classList.remove('selected');
        this.classList.add('selected');
        customSelect.querySelector('.custom-select__trigger').textContent = this.textContent;
        //   customSelect.querySelector('input[type="hidden"]').value = value; // Optional: if you need to store the selected value
      });
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!customSelect.contains(e.target)) {
        const dropdowns = document.querySelectorAll('.custom-options');
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('open');
        });
      }
    });
  });
  // document.addEventListener('DOMContentLoaded', function () {
  const calendarBody = document.querySelector('.calendar-body');
  const monthBtn = document.querySelector('.selected-month');
  // const yearBtn = document.querySelector('#selected-year');


  // Get current date details
  // const currentDate = new Date();
  // let currentYear = currentDate.getFullYear();
  // let currentMonth = currentDate.getMonth();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Initialize calendar with current month
  function initCalendar() {
    monthBtn.textContent = months[currentMonth];
    //add to selectedYear an options for range of years fromm 2023 to 2030, every option is a year in format yyyy



    // selectedYear.
    // yearBtn.textContent = currentYear;

    calendarBody.innerHTML = ''; // Clear previous calendar days

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Get total days in the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // Get day of the week for the 1st day

    const totalCells = 42; // Total cells in a 6x7 grid (max possible for a month)
    console.log('total cells', totalCells)
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
        // cell.style.width = '24px'; // Set width to 24px
        // cell.style.height = '24px'; // Set height to 24px
      }

      // console.log('calendarBody', calendarBody);
      calendarBody.appendChild(cell);
    }
    // Add click events for days
    // const days = document.querySelectorAll('.day');
    // days.forEach(day => {
    //   const dateString = day.getAttribute('data-date');


    //   day.addEventListener('click', () => {
    //     day.classList.toggle('selected');
    //     APP_STORAGE.startDate = dateString;
    //     APP_STORAGE.endDate = dateString;
    //     // Your logic to handle day selection goes here
    //     console.log('Selected day:', day.textContent);
    //   });

    //   day
    // });
  }

  function handleMouseDown(event) {
    APP_STORAGE.rectSelectionOn = true;

    const cell = event.target.closest('.day');

    if (cell) {
      startDate = cell.getAttribute('data-date');
      APP_STORAGE.startDate = startDate;

      // if (!cell.classList.contains('selected')) {
      //   cell.classList.add('selected');
      // }
    }
  }

  function handleMouseUp(event) {
    const cell = event.target.closest('.day');
    console.log('target is ');
    console.log(event.target)

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
      console.log('react selection on!!!s')
      const cell = event.target.closest('.day');

      if (cell) {
        endDate = cell.getAttribute('data-date');
        APP_STORAGE.endDate = endDate;
        // !cell.classList.contains('selected') && cell.classList.add('selected');
        highlightRange(startDate, endDate);
      }
    }
  }
  // }

  function highlightRange(start, end) {
    // Logic to highlight the range between start and end dates
    // Remove previous selection
    document.querySelectorAll('.day.selected').forEach(cell => {
      cell.classList.remove('selected');
    });

    // Add new selection within the range
    const cells = document.querySelectorAll('.day');
    cells.forEach(cell => {
      const cellDate = cell.getAttribute('data-date');
      if (cellDate >= start && cellDate <= end) {
        cell.classList.add('selected');
      }
    });
  }

  // const debouncedMouseMove = delayFirst(handleMouseMove, 340, 500);
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

    // Calculate the start and end dates of the week
    const selectedDates = [];
    const currentDayOfWeek = currentDate.getDay(); // Get the current day of the week (0 - Sunday, 1 - Monday, ..., 6 - Saturday)
    const startOfWeek = new Date(currentDate); // Create a new date object with the current date
    startOfWeek.setDate(startOfWeek.getDate() - currentDayOfWeek); // Calculate the start of the week (Sunday)
    const endOfWeek = new Date(currentDate); // Create a new date object with the current date
    endOfWeek.setDate(endOfWeek.getDate() + (6 - currentDayOfWeek)); // Calculate the end of the week (Saturday)

    // Push each day within the week to the selectedDates array
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
      const date = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
      const cellToSelect = document.querySelector(`.day[data-date="${date}"]`);
      !cellToSelect.classList.contains('selected') & cellToSelect.classList.add('selected');
      selectedDates.push(date);
    }

    APP_STORAGE.startDate = selectedDates[0]; // Set the start date of the week
    APP_STORAGE.endDate = selectedDates[selectedDates.length - 1]; // Set the end date of the week
    APP_STORAGE.selectedDates = selectedDates; // Set all dates in the week

    // Fetch todos falling within the selected week
    APICalls.getTodosByDates(APP_STORAGE.selectedDates).then(todos => {
      APP_STORAGE_PROXY.filteredTodos = [...todos];
    });
  }
  });

  const searchInput = document.getElementById('search');
  const suggestionsList = document.getElementById('suggestions');

  // Event listener for input changes
  searchInput.addEventListener('input', function (event) {
    const searchString = event.target.value.toLowerCase();

    if(searchString.length === 0) {
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

  // Function to display suggestions
  function displaySuggestions(filteredSuggestions) {
    // Clear previous suggestions
    suggestionsList.innerHTML = '';

    // Display new suggestions
    filteredSuggestions.forEach(suggestedTodo => {
      const listItem = document.createElement('li');
      listItem.textContent = suggestedTodo.name;
      listItem.addEventListener('click', function () {
        APP_STORAGE_PROXY.openedTodo = suggestedTodo;
        // searchInput.value = suggestion;
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

  modal.addEventListener('click', function (event) {
    // if (event.target === modal) {
     APP_STORAGE_PROXY.openedTodo = null;
    // }
  })

  

  initCalendar(); // Initialize calendar on load

}



