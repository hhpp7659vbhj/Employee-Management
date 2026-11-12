package com.zoogle.ems.handler;

import com.zoogle.ems.http.HttpRequest;
import com.zoogle.ems.http.HttpResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class StaticFileHandler {
    private final String baseDir;

    public StaticFileHandler(String baseDir) {
        this.baseDir = baseDir;
    }

    public HttpResponse handle(HttpRequest request) {
        String path = request.getPath();
        if (path.equals("/") || path.isEmpty()) {
            path = "/index.html";
        }

        // Prevent directory traversal
        if (path.contains("..")) {
            return HttpResponse.bytes(403, "Forbidden".getBytes(), "text/plain");
        }

        Path filePath = Paths.get(baseDir, path.replaceFirst("^/", ""));
        if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
            Path indexHtml = Paths.get(baseDir, "index.html");
            if (Files.exists(indexHtml)) {
                filePath = indexHtml;
            } else {
                return HttpResponse.bytes(404, "404 Not Found".getBytes(), "text/plain");
            }
        }

        try {
            String mimeType = getMimeType(filePath.toString());
            byte[] bytes = Files.readAllBytes(filePath);
            HttpResponse res = HttpResponse.bytes(200, bytes, mimeType);
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            return res;
        } catch (IOException e) {
            return HttpResponse.bytes(500, ("Error reading file: " + e.getMessage()).getBytes(), "text/plain");
        }
    }

    private String getMimeType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
        if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
        if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".woff")) return "font/woff";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".ttf")) return "font/ttf";
        return "application/octet-stream";
    }
}
