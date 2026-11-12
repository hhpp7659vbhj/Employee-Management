package com.zoogle.ems.http;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public class HttpResponse {
    private int statusCode = 200;
    private String statusText = "OK";
    private final Map<String, String> headers = new LinkedHashMap<>();
    private byte[] body = new byte[0];

    public HttpResponse() {
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        headers.put("Access-Control-Allow-Headers", "Content-Type, Authorization");
        headers.put("Connection", "close");
    }

    public static HttpResponse ok() {
        return new HttpResponse();
    }

    public static HttpResponse json(int status, String json) {
        HttpResponse res = new HttpResponse();
        res.statusCode = status;
        res.statusText = getReasonPhrase(status);
        res.headers.put("Content-Type", "application/json; charset=UTF-8");
        res.body = json.getBytes(StandardCharsets.UTF_8);
        return res;
    }

    public static HttpResponse bytes(int status, byte[] data, String contentType) {
        HttpResponse res = new HttpResponse();
        res.statusCode = status;
        res.statusText = getReasonPhrase(status);
        res.headers.put("Content-Type", contentType);
        res.body = data != null ? data : new byte[0];
        return res;
    }

    public static HttpResponse noContent() {
        HttpResponse res = new HttpResponse();
        res.statusCode = 204;
        res.statusText = "No Content";
        res.body = new byte[0];
        return res;
    }

    public void setHeader(String name, String value) {
        headers.put(name, value);
    }

    public void send(OutputStream out) throws IOException {
        StringBuilder headerBuilder = new StringBuilder();
        headerBuilder.append("HTTP/1.1 ").append(statusCode).append(" ").append(statusText).append("\r\n");
        headers.put("Content-Length", String.valueOf(body.length));

        for (Map.Entry<String, String> entry : headers.entrySet()) {
            headerBuilder.append(entry.getKey()).append(": ").append(entry.getValue()).append("\r\n");
        }
        headerBuilder.append("\r\n");

        out.write(headerBuilder.toString().getBytes(StandardCharsets.UTF_8));
        if (body.length > 0) {
            out.write(body);
        }
        out.flush();
    }

    private static String getReasonPhrase(int code) {
        switch (code) {
            case 200: return "OK";
            case 201: return "Created";
            case 204: return "No Content";
            case 400: return "Bad Request";
            case 401: return "Unauthorized";
            case 403: return "Forbidden";
            case 404: return "Not Found";
            case 500: return "Internal Server Error";
            default: return "Response";
        }
    }
}
