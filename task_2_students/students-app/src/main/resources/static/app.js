window.onload = function () {
    // console.log('onload loaded successfully')
    getStudents()
        .then(students => renderStudents(students));
};

function getStudents() {
    return fetch('/students')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function renderStudents(students) {
    const studentsList = document.getElementById('studentsList');
    students.length && students.forEach(student => {
        const listItem = document.createElement('li');
        console.log(student);
        listItem.textContent = `ID: ${student.id}, Name: ${student.name}, Second Name: ${student.second_name}, Surname: ${student.surname}, Date of Birth: ${student.date_of_birth}, Group Name: ${student.group_name}`;
        studentsList.appendChild(listItem);
    });
}

// Example of handling a button click to fetch more data
// document.getElementById('fetchButton').addEventListener('click', () => {
//     getStudents()
//         .then(students => renderStudents(students));
// });
