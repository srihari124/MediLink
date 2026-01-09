package org.medilink.authservice.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private final String token;
    private final String name;
    private final String email;

    public LoginResponseDTO(String token, String name, String email) {
        this.token = token;
        this.name = name;
        this.email = email;
    }

    public String getToken() {
        return token;
    }
}
