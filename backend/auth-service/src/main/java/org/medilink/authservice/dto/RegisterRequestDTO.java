package org.medilink.authservice.dto;

import jakarta.validation.GroupSequence;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDTO {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be a valid email address")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min =6, message = "Password must be at least 6 characters long")
    private String password;

    @NotBlank(message = "Role cannot be blank")
    private String role;
}
