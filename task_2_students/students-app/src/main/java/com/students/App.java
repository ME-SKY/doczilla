package com.students;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.File;
import java.nio.file.Files;
import java.io.IOException;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.net.InetSocketAddress;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import org.json.JSONArray;
import org.json.JSONObject;

enum HttpMethod {
    GET,
    POST,
    DELETE
}

public class App {

    public static void main(String[] args) throws IOException {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            return;
        }
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
            String path = "src/main/resources/static/index.html";
            File file = new File(path);

            if (file.exists()) {
                System.out.println("Found file at: " + file.getAbsolutePath());

                byte[] fileBytes = Files.readAllBytes(file.toPath());
                exchange.sendResponseHeaders(200, fileBytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(fileBytes);
                os.close();
            } else {
                System.out.println("File not found at: " + file.getAbsolutePath());

                exchange.sendResponseHeaders(404, 0);
                exchange.close();
            }
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

                JSONObject jsonUserObject = new JSONObject(payload.toString());

                String name = jsonUserObject.getString("name");
                String secondName = jsonUserObject.getString("second_name");
                String surname = jsonUserObject.getString("surname");
                String dateOfBirth = jsonUserObject.getString("date_of_birth");
                String groupName = jsonUserObject.getString("group_name");

                try {
                    boolean success = createStudent(name, secondName, surname, dateOfBirth, groupName);

                    JSONObject resObj = new JSONObject();
                    resObj.put("ok", success);
                    sendJsonResponse(exchange, resObj);
                } catch (Exception e) {
                    e.printStackTrace();
                    return;
                }
            } else if (exchange.getRequestMethod().equalsIgnoreCase(HttpMethod.DELETE.name())) {
                String idString = exchange.getRequestURI().getPath().replace("/students/", "");
                int id = Integer.parseInt(idString);
                boolean success = deleteStudent(id);

                JSONObject resObj = new JSONObject();
                resObj.put("ok", success);

                sendJsonResponse(exchange, resObj);
            } else if (exchange.getRequestMethod().equalsIgnoreCase(HttpMethod.GET.name())) {
                JSONArray response = getStudents();
                sendJsonResponse(exchange, response);
            }
        }

        private boolean createStudent(String name, String secondName, String surname, String dateOfBirth,
                String groupName) {
            try {
                Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/students",
                        "postgres", "ry6re763fe7fe87y");
                PreparedStatement preparedStatement = connection.prepareStatement(
                        "INSERT INTO students (name, second_name, surname, date_of_birth, group_name) VALUES (?, ?, ?, ?, ?)");
                preparedStatement.setString(1, name);
                preparedStatement.setString(2, secondName);
                preparedStatement.setString(3, surname);
                java.sql.Date birthDaySqlDate = java.sql.Date.valueOf(dateOfBirth);
                preparedStatement.setDate(4, birthDaySqlDate);
                preparedStatement.setString(5, groupName);

                int rowsAffected = preparedStatement.executeUpdate();
                return rowsAffected > 0;
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }

        private boolean deleteStudent(int studentId) {
            try {
                Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/students",
                        "postgres", "ry6re763fe7fe87y");
                PreparedStatement preparedStatement = connection.prepareStatement("DELETE FROM students WHERE id = ?");
                preparedStatement.setInt(1, studentId);
                
                int rowsAffected = preparedStatement.executeUpdate();
                return rowsAffected > 0;
            } catch (SQLException e) {
                e.printStackTrace();
                return false;
            }
        }

        private JSONArray getStudents() {
            JSONArray studentsArray = new JSONArray();

            try {
                Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/students",
                        "postgres", "ry6re763fe7fe87y");
                PreparedStatement preparedStatement = connection.prepareStatement("SELECT * FROM students");
                ResultSet resultSet = preparedStatement.executeQuery();

                while (resultSet.next()) {
                    int studentId = resultSet.getInt("id");
                    String name = resultSet.getString("name");
                    String secondName = resultSet.getString("second_name");
                    String surname = resultSet.getString("surname");
                    Date dateOfBirth = resultSet.getDate("date_of_birth");
                    String groupName = resultSet.getString("group_name");

                    // Create a JSON object for each student
                    JSONObject studentObject = new JSONObject();
                    studentObject.put("id", studentId);
                    studentObject.put("name", name);
                    studentObject.put("second_name", secondName);
                    studentObject.put("surname", surname);
                    studentObject.put("date_of_birth", dateOfBirth.toString()); // Convert Date to string
                    studentObject.put("group_name", groupName);

                    // Add the student object to the array
                    studentsArray.put(studentObject);
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
            
            return studentsArray;
        }
    }

    private static void sendResponse(HttpExchange exchange, String response) throws IOException {
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

    private static void sendJsonResponse(HttpExchange exchange, Object responseObject) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");

        String response;
        if (responseObject instanceof JSONObject) {
            response = ((JSONObject) responseObject).toString();
        } else if (responseObject instanceof JSONArray) {
            response = ((JSONArray) responseObject).toString();
        } else {
            response = "Invalid response format"; // Handle invalid response type
        }

        exchange.sendResponseHeaders(200, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

}
