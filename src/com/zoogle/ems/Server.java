package com.zoogle.ems;

import com.zoogle.ems.db.Database;
import com.zoogle.ems.handler.ApiHandler;
import com.zoogle.ems.handler.StaticFileHandler;
import com.zoogle.ems.http.HttpRequest;
import com.zoogle.ems.http.HttpResponse;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Server {
    public static final int DEFAULT_PORT = 8080;
    private static volatile boolean running = true;
    private static ServerSocket serverSocket;
    private static ExecutorService threadPool;

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {}
        } else if (System.getenv("PORT") != null) {
            try {
                port = Integer.parseInt(System.getenv("PORT"));
            } catch (NumberFormatException ignored) {}
        }

        System.out.println("===============================================================");
        System.out.println("                  ZOOGLE ENTERPRISE EMS                        ");
        System.out.println("             Empowering Workforce Management                   ");
        System.out.println("===============================================================");

        // Preload database
        Database db = Database.getInstance();
        System.out.println("[Zoogle EMS] Database initialized with " + db.getEmployees().size() + " employees.");

        ApiHandler apiHandler = new ApiHandler();
        StaticFileHandler staticHandler = new StaticFileHandler("static");
        threadPool = Executors.newFixedThreadPool(24);

        try {
            serverSocket = new ServerSocket(port, 50, java.net.InetAddress.getByName("0.0.0.0"));
            System.out.println("[Zoogle EMS] Backend server running successfully!");
            System.out.println("[Zoogle EMS] URL: http://localhost:" + port);
            System.out.println("---------------------------------------------------------------");
            System.out.println("  Admin Portal:    admin / admin123");
            System.out.println("  Employee Portal: pooja.sharma / zoogle123 (or dheeraj.raj / zoogle123)");
            System.out.println("===============================================================");

            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n[Zoogle EMS] Gracefully stopping server...");
                running = false;
                try {
                    if (serverSocket != null && !serverSocket.isClosed()) {
                        serverSocket.close();
                    }
                } catch (IOException ignored) {}
                if (threadPool != null) {
                    threadPool.shutdown();
                }
                Database.getInstance().saveToFile();
                System.out.println("[Zoogle EMS] Server stopped. All data persisted.");
            }));

            while (running) {
                try {
                    Socket client = serverSocket.accept();
                    threadPool.submit(() -> handleClient(client, apiHandler, staticHandler));
                } catch (IOException e) {
                    if (!running) break;
                    System.err.println("[Zoogle EMS] Connection accept error: " + e.getMessage());
                }
            }

        } catch (IOException e) {
            System.err.println("[Zoogle EMS] Fatal: Failed to bind server on port " + port + ": " + e.getMessage());
            System.exit(1);
        }
    }

    private static void handleClient(Socket socket, ApiHandler apiHandler, StaticFileHandler staticHandler) {
        try (socket) {
            HttpRequest req = HttpRequest.read(socket.getInputStream());
            if (req == null) return;

            HttpResponse res;
            if (req.getPath().startsWith("/api")) {
                res = apiHandler.handle(req);
            } else {
                res = staticHandler.handle(req);
            }
            res.send(socket.getOutputStream());
        } catch (Exception e) {
            // Client disconnect or socket reset
        }
    }
}
