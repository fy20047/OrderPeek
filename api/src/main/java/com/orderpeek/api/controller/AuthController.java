package com.orderpeek.api.controller;

import com.orderpeek.api.dto.LoginRequest;
import com.orderpeek.api.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 說明：
 * - 這是一個最小可運作的登入 API Controller。
 * - 路徑前綴為 /api/auth（見 @RequestMapping）
 * - 提供 POST /api/auth/login
 *
 * 注意：
 * - 先用「硬編碼」驗證管理員帳密（fy20047 / Fy25228305），方便測試。
 * - 之後要接資料庫或加密再往下擴充。
 * - DTO 寫成內部靜態類別，並提供無參數建構子，Jackson 反序列化才讀得到。
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // ======== DTOs ========

    /** 前端傳進來的登入請求資料 */
    public static class LoginRequest {
        public String account;   // 帳號
        public String password;  // 密碼

        // Jackson 反序列化需要無參數建構子
        public LoginRequest() {}

        public LoginRequest(String account, String password) {
            this.account = account;
            this.password = password;
        }
    }

    /** 後端回應給前端的登入結果 */
    public static class LoginResponse {
        public boolean ok;
        public String role;      // 角色：例如 ADMIN / USER / UNKNOWN
        public String message;   // 訊息：登入成功 / 錯誤原因

        public LoginResponse() {}

        public LoginResponse(String role, String message) {
            this.ok = ok;
            this.role = role;
            this.message = message;
        }
    }

    // ======== API ========

    /**
     * 登入端點（POST）
     * 路徑：/api/auth/login
     *
     * 範例請求（JSON）：
     * { "account": "fy20047", "password": "Fy25228305" }
     *
     * 成功回應（200）：
     * { "role": "ADMIN", "message": "登入成功" }
     * 失敗回應（401）：
     * { "role": "UNKNOWN", "message": "帳號或密碼錯誤" }
     */
    @PostMapping("/login") // POST 登入
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // 先用硬編碼管理員與使用者帳號，方便測試
        // 現在是 equals，正式上線前要改 bcrypt 雜湊比對
        if ("fy20047".equals(request.account) && "Fy25228305".equals(request.password)) {
            return ResponseEntity.ok(new LoginResponse("ADMIN", "登入成功"));
        }
        if ("user01".equals(request.account) && "userpass".equals(request.password)) {
            return ResponseEntity.ok(new LoginResponse("USER", "登入成功"));
        }
        // TODO: 日後改為查資料庫 / 密碼雜湊比對 / JWT / Session 等
        return ResponseEntity.status(401).body(new LoginResponse("UNKNOWN", "帳號或密碼錯誤"));
    }

    /**
     * 額外提供一個簡單測試用 GET（可選）
     * - GET /api/auth/ping 會回 "pong"
     * - 方便確認路由有沒有掛上
     */
    @GetMapping("/ping") // GET 測試
    public String ping() {
        return "pong";
    }
}
