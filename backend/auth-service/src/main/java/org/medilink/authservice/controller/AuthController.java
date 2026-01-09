package org.medilink.authservice.controller;

import org.medilink.authservice.dto.LoginRequestDTO;
import org.medilink.authservice.dto.LoginResponseDTO;
import org.medilink.authservice.dto.RegisterRequestDTO;
import org.medilink.authservice.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        Optional<String> tokenOptional = authService.authenticate(loginRequestDTO);

        if(tokenOptional.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = tokenOptional.get();
        String name = authService.extractName(token);
        String email = authService.extractEmail(token);
        return ResponseEntity.ok(new LoginResponseDTO(token, name, email));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String,Object>> validateToken(@RequestHeader("Authorization") String authHeader){
         if(authHeader == null || !authHeader.startsWith("Bearer ")){
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
         }
         String token = authHeader.substring(7);
         if(!authService.validateToken(token)){
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
         }

         String userId = authService.extractUserId(token);
         if(userId == null){
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User id missing in token"));
         }
         return ResponseEntity.ok(Map.of("userId", userId));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO registerRequestDTO){
        Optional<String> tokenOptional = authService.register(registerRequestDTO);

        if(tokenOptional.isEmpty()){
            logger.warn("Registration failed for email: {}. Email might already exist.", registerRequestDTO.getEmail());
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }

        String token = tokenOptional.get();
        String name = authService.extractName(token);
        String email = authService.extractEmail(token);
        logger.info("Registration successful for email: {}", registerRequestDTO.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponseDTO(token, name, email));
    }
}
