const APP_STORAGE = {
  searchString: '',
  startDate: null, //TODO: change to today later
  endDate: null,
  allTodos: [],
  suggestedTodos: [],
  filteredTodos: [],
  openedTodo: null,
  shortLookTodo: null
}

const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
const optionsContainer = document.querySelector('.custom-options');

window.onload = function () {

  const customSelects = document.querySelectorAll('.custom-select');

  const options = [];
  customSelects.forEach(customSelect => {
    const trigger = customSelect.querySelector('.custom-select__trigger');
    
    for (let year = 2023; year <= 2030; year++) {
      const yearOption = document.createElement('span');
      yearOption.classList.add('custom-option');
      yearOption.setAttribute('data-value', year);
      yearOption.textContent = year.toString();

      if(year === currentYear) {
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
        const {value} = this.dataset;
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
    const days = document.querySelectorAll('.day');
    days.forEach(day => {
      const dateString = day.getAttribute('data-date');
      day.addEventListener('click', () => {
        day.classList.toggle('selected');
        APP_STORAGE.startDate = dateString;
        APP_STORAGE.endDate = dateString;
        // Your logic to handle day selection goes here
        console.log('Selected day:', day.textContent);
      });
    });
  }

  initCalendar(); // Initialize calendar on load

}



