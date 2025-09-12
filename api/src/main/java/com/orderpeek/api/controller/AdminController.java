package com.orderpeek.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {

    @GetMapping("/admin")
    public String adminPage() {
        return "<h1>此頁為管理員頁面，功能候補</h1>";
    }
}
