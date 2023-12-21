# Task 1: File System Operations

## Brief Description
A simple Kotlin application for building a file dependency graph and merging content into one file.

## Building Instructions
1. Navigate to the `task_1_file_system` directory.
2. Run `kotlinc resolving_of_file_dependencies.kt -include-runtime -d ResolvingFileDependencies.jar` to build the application.

## Running Instructions
1. Run `java -jar ResolvingFileDependencies.jar` to start the application,
it will create two files - dependencey_graph.txt and output.txt, output.txt will contain all files contents of root_directory.

---

# Task 2: Student Management System

## Brief Description
This system allows educational institutions to manage student data efficiently. It offers functionalities to add, update, and delete student records, as well as to generate reports.

## Building Instructions
1. Navigate to the `task_2_students/students-app` directory.
2. Run `mvn clean package assembly:single` to build the project.

## Running Instructions
1. Run `java -jar target/students-app-1.0-SNAPSHOT-jar-with-dependencies.jar` to start the application.

---

# Task 3: Todo List UI

## Brief Description
A user-friendly interface for managing daily tasks. Features include adding new todos, marking them as complete, and filtering through existing tasks.

## Build
1. Ensure you have `python` installed on your system.
2. Navigate to the `task_3_todo_list_ui/todolist_ui` directory and run `python -m SimpleHTTPServer 8000` to serve files.

## Running Instructions
1. Open localhost:8000 in browser.


