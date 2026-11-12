package com.zoogle.ems.http;

import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class HttpRequest {
    private final String method;
    private final String path;
    private final String rawQuery;
    private final Map<String, String> queryParams = new HashMap<>();
    private final Map<String, String> headers = new HashMap<>();
    private final byte[] body;

    public HttpRequest(String method, String path, String rawQuery, Map<String, String> headers, byte[] body) {
        this.method = method != null ? method.toUpperCase() : "GET";
        this.path = path;
        this.rawQuery = rawQuery;
        if (headers != null) {
            for (Map.Entry<String, String> e : headers.entrySet()) {
                this.headers.put(e.getKey().toLowerCase(), e.getValue());
            }
        }
        this.body = body != null ? body : new byte[0];
        parseQuery();
    }

    private void parseQuery() {
        if (rawQuery == null || rawQuery.isEmpty()) return;
        String[] pairs = rawQuery.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                try {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String val = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    queryParams.put(key, val);
                } catch (Exception ignored) {}
            }
        }
    }

    public static HttpRequest read(InputStream in) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
        String requestLine = reader.readLine();
        if (requestLine == null || requestLine.trim().isEmpty()) {
            return null;
        }

        String[] parts = requestLine.split(" ");
        if (parts.length < 2) {
            return null;
        }
        String method = parts[0];
        String fullUri = parts[1];

        String path = fullUri;
        String rawQuery = null;
        int qIdx = fullUri.indexOf('?');
        if (qIdx >= 0) {
            path = fullUri.substring(0, qIdx);
            rawQuery = fullUri.substring(qIdx + 1);
        }

        Map<String, String> headers = new HashMap<>();
        String line;
        int contentLength = 0;
        while ((line = reader.readLine()) != null && !line.isEmpty()) {
            int colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
                String key = line.substring(0, colonIdx).trim().toLowerCase();
                String val = line.substring(colonIdx + 1).trim();
                headers.put(key, val);
                if (key.equals("content-length")) {
                    try {
                        contentLength = Integer.parseInt(val);
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        char[] bodyChars = new char[contentLength];
        if (contentLength > 0) {
            int totalRead = 0;
            while (totalRead < contentLength) {
                int read = reader.read(bodyChars, totalRead, contentLength - totalRead);
                if (read == -1) break;
                totalRead += read;
            }
        }

        byte[] bodyBytes = new String(bodyChars).getBytes(StandardCharsets.UTF_8);
        return new HttpRequest(method, path, rawQuery, headers, bodyBytes);
    }

    public String getMethod() { return method; }
    public String getPath() { return path; }
    public String getQueryParam(String name) { return queryParams.get(name); }
    public Map<String, String> getQueryParams() { return queryParams; }
    public String getHeader(String name) { return headers.get(name.toLowerCase()); }
    public byte[] getBody() { return body; }
    public String getBodyAsString() { return new String(body, StandardCharsets.UTF_8); }
}
