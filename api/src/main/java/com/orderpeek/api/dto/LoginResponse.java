package com.orderpeek.api.dto;

public class LoginResponse {
    private String role;
    private String message;

    public LoginResponse(String role, String message) {
        this.role = role;
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}
