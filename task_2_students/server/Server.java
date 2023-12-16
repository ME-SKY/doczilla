import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.JsonArray;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.sql.*;

public class Server {
    public static void main(String[] args) throws IOException {
        int serverPort = 8000;
        HttpServer server = HttpServer.create(new InetSocketAddress(serverPort), 0);

        server.createContext("/students", new StudentHandler());
        server.setExecutor(null); // creates a default executor

        server.start();
        System.out.println("Server started on port " + serverPort);
    }

    static class StudentHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();

        if (path.equals("/")) {
            handleRootRequest(exchange);
        } else if (path.equals("/students")) {
            handleStudentsRequest(exchange);
        } else {
            // Handle unknown routes or return a 404 response
            exchange.sendResponseHeaders(404, -1); // Not Found
        }
    }

    private void handleRootRequest(HttpExchange exchange) throws IOException {
        // Handling '/' route
        String response = "Start!";
        sendResponse(exchange, response, "text/plain");
    }

    private void handleStudentsRequest(HttpExchange exchange) throws IOException {
        // Handling '/students' route - Retrieve students from the database
        try {
            Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/your_database", "username", "password");
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT * FROM students");

            JSONArray jsonArray = new JSONArray();
            while (resultSet.next()) {
                JSONObject studentJson = new JSONObject();
                studentJson.put("id", resultSet.getInt("id"));
                studentJson.put("name", resultSet.getString("name"));
                // Add more fields as needed

                jsonArray.put(studentJson);
            }

            resultSet.close();
            statement.close();
            connection.close();

            String response = jsonArray.toString();
            sendResponse(exchange, response, "application/json");
        } catch (SQLException e) {
            e.printStackTrace();
            exchange.sendResponseHeaders(500, -1); // Internal Server Error
        }
    }

    private void sendResponse(HttpExchange exchange, String response, String contentType) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(200, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}

    // JDBC Connection and CRUD operations
    // Implement methods to connect to PostgreSQL, execute SQL queries for CRUD
    // operations
}
