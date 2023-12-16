package com.students;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.File;
import java.nio.file.Files;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class App {

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);

        server.createContext("/", new RootHandler());
        server.createContext("/students", new StudentsHandler());

        server.setExecutor(null);
        server.start();

        System.out.println("Server started on port 8000...");
    }

    static class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = getDataFromDatabase();
            sendJsonResponse(exchange, response);
        }

        private String getDataFromDatabase() {
            StringBuilder data = new StringBuilder();

            try (Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/students",
                    "postgres", "ry6re763fe7fe87y")) {
                PreparedStatement preparedStatement = connection.prepareStatement("SELECT * FROM students");
                ResultSet resultSet = preparedStatement.executeQuery();

                while (resultSet.next()) {
                    // Assuming 'name' is a column in your 'students' table
                    String name = resultSet.getString("name");
                    // Append the retrieved data to the response
                    data.append(name).append("\n");
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }

            return data.toString();
        }
    }

    static class StudentsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestMethod().equalsIgnoreCase(HttpMethod.POST.name())) {
                InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
                BufferedReader br = new BufferedReader(isr);
                StringBuilder payload = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    payload.append(line);
                }

                // Parse the payload as JSON to extract student data
                JSONObject jsonUserObject = new JSONObject(payload.toString());

                String name = jsonUserObject.getString("name"); // Assuming 'name' is a field in your JSON payload
                String secondName = jsonUserObject.getString("second_name");
                String surname = jsonUserObject.getString("surname");
                Date dateOfBirth = jsonUserObject.getString("date_of_birth");
                String groupName = jsonUserObject.getString("group_name");

                // Insert the student data into the database
                boolean success = createStudent(name, secondName, surname, dateOfBirth, groupName);

                if (success) {
                    sendResponse(exchange, "Student created successfully");
                } else {
                    sendResponse(exchange, "Failed to create student");
                }
            } else if (exchange.getRequestMethod().equalsIgnoreCase(HttpMethod.DELETE.name())){
                //dont sure i need this
                // InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
                // BufferedReader br = new BufferedReader(isr);
                // StringBuilder payload = new StringBuilder();
                // String line;
                // while ((line = br.readLine()) != null) {
                //     payload.append(line);
                // }

                // Parse the payload as JSON to extract student data
                JSONObject jsonUserObject = new JSONObject(payload.toString());
                int id = Integer.parseInt(exchange.getRequestURI().getPath().substring(1));
            }
            String response = "Welcome to the students' endpoint!";
            sendJsonResponse(exchange, response);
        }

        private boolean createStudent(String name, String secondName, String surname, Date dateOfBirth,
                String groupName) {
            // Perform database insertion logic here using JDBC
            try (Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/students",
                    "postgres", "ry6re763fe7fe87y")) {
                PreparedStatement preparedStatement = connection.prepareStatement(
                        "INSERT INTO students (name, second_name, surname, date_of_birth, group_name) VALUES (?, ?, ?, ?, ?)");
                preparedStatement.setString(1, name);
                preparedStatement.setString(2, secondName);
                preparedStatement.setString(3, surname);
                preparedStatement.setDate(4, new java.sql.Date(dateOfBirth.getTime()));
                preparedStatement.setString(5, groupName);
                int rowsAffected = preparedStatement.executeUpdate();
                return rowsAffected > 0;
            } catch (SQLException e) {
                e.printStackTrace();
                return false;
            }
        }

        private boolean deleteStudent(String studentId) {
            try (Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/students",
                    "postgres", "ry6re763fe7fe87y")) {
                PreparedStatement preparedStatement = connection.prepareStatement("DELETE FROM students WHERE id = ?");
                preparedStatement.setInt(1, Integer.parseInt(studentId));
                int rowsAffected = preparedStatement.executeUpdate();
                return rowsAffected > 0;
            } catch (SQLException e) {
                e.printStackTrace();
                return false;
            }
        }
    }

    private static void sendResponse(HttpExchange exchange, String response) throws IOException {
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

    private static void sendJsonResponse(HttpExchange exchange, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

}
