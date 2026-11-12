package com.zoogle.ems.model;

public class Notice {
    private String id;
    private String title;
    private String category; // "General", "Urgent", "Event", "Policy"
    private String content;
    private String author;
    private String createdAt;
    private boolean pinned;

    public Notice() {}

    public Notice(String id, String title, String category, String content, String author, String createdAt, boolean pinned) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.content = content;
        this.author = author;
        this.createdAt = createdAt;
        this.pinned = pinned;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public boolean isPinned() { return pinned; }
    public void setPinned(boolean pinned) { this.pinned = pinned; }
}
