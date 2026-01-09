package org.medilink.authservice.service;

import io.jsonwebtoken.JwtException;
import org.medilink.authservice.dto.LoginRequestDTO;
import org.medilink.authservice.dto.RegisterRequestDTO;
import org.medilink.authservice.model.User;
import org.medilink.authservice.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserService userService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Optional<String> register(RegisterRequestDTO registerRequestDTO){
        if(userService.findByEmail(registerRequestDTO.getEmail()).isPresent()){
            logger.warn("Registration failed: Email {} already exists", registerRequestDTO.getEmail());
            return Optional.empty();
        }

        User newUser = new User();
        newUser.setName(registerRequestDTO.getName());
        newUser.setEmail(registerRequestDTO.getEmail());
        newUser.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        newUser.setRole(registerRequestDTO.getRole());

        User savedUser = userService.saveUser(newUser);
        logger.info("User {} registered successfully with ID {}", savedUser.getEmail(), savedUser.getId());

        return Optional.of(jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId().toString(),savedUser.getRole(), savedUser.getName()));
    }

    public Optional<String> authenticate(LoginRequestDTO loginRequestDTO){
        Optional<String> token = userService.findByEmail(loginRequestDTO.getEmail())
                .filter(user -> passwordEncoder.matches(loginRequestDTO.getPassword(), user.getPassword()))
                .map(user -> jwtUtil.generateToken(user.getEmail(), user.getId().toString(), user.getRole(), user.getName()));
        return token;
    }

     public boolean validateToken(String token){
        try{
            jwtUtil.validateToken(token);
            return true;
        } catch(JwtException e){
            return false;
        }
     }

     public String extractUserId(String token){
        return jwtUtil.extractUserId(token);
     }

     public String extractEmail(String token){
        return jwtUtil.extractEmail(token);
     }

     public String extractName(String token){
        return jwtUtil.extractName(token);
     }

     public String extractRole(String token){
        return jwtUtil.extractRole(token);
     }
}
