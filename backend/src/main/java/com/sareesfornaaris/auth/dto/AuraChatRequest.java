package com.sareesfornaaris.auth.dto;

import java.util.List;

public class AuraChatRequest {
    private String message;
    private List<ChatMessage> history;
    private String pageContext;

    public AuraChatRequest() {}

    public AuraChatRequest(String message, List<ChatMessage> history, String pageContext) {
        this.message = message;
        this.history = history;
        this.pageContext = pageContext;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ChatMessage> getHistory() {
        return history;
    }

    public void setHistory(List<ChatMessage> history) {
        this.history = history;
    }

    public String getPageContext() {
        return pageContext;
    }

    public void setPageContext(String pageContext) {
        this.pageContext = pageContext;
    }

    public static class ChatMessage {
        private String role; // "user" or "assistant"
        private String content;

        public ChatMessage() {}

        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
