package com.medilink.shared_medical_platform.services;

import com.medilink.shared_medical_platform.model.User;
import com.medilink.shared_medical_platform.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user){
        logger.info("Registering user with email: {}", user.getEmail());
        if(userRepository.existsByEmail(user.getEmail())){
            logger.error("Email already exists: {}", user.getEmail());
            throw new RuntimeException("Email already exists");
        }
        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with id: {}", savedUser.getId());
        return savedUser;
    }

    public List<User> getAllUsers(){
        logger.info("Fetching all users");
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id){
        logger.info("Fetching user with id: {}", id);
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updatedUser){
        logger.info("Updating user with id: {}", id);
        return userRepository.findById(id).map(user -> {
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            user.setPassword(updatedUser.getPassword());
            user.setRole(updatedUser.getRole());
            User savedUser = userRepository.save(user);
            logger.info("User updated successfully with id: {}", savedUser.getId());
            return savedUser;
        }).orElseThrow(()-> {
            logger.error("User not found with id: {}", id);
            return new RuntimeException("User not found with id: " +  id);
        });
    }

    public void deleteUser(Long id){
        logger.info("Deleting user with id: {}", id);
        userRepository.deleteById(id);
        logger.info("User deleted successfully with id: {}", id);
    }

    public Optional<User> findUserByEmail(String email){
        logger.info("Finding user by email: {}", email);
        return userRepository.findByEmail(email);
    }

    public boolean userExists(String email){
        logger.info("Checking if user exists with email: {}", email);
        return userRepository.existsByEmail(email);
    }
}
