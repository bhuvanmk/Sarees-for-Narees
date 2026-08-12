package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.AuraChatRequest;
import com.sareesfornaaris.auth.dto.AuraChatResponse;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.JwtUtils;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import com.sareesfornaaris.auth.service.AuraService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@RestController
@RequestMapping("/api/aura")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuraController {

    private static final Logger logger = LoggerFactory.getLogger(AuraController.class);

    @Autowired
    private AuraService auraService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // In-memory rate limiting per IP (max 20 requests per minute)
    private final Map<String, Queue<Long>> requestTimesMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 20;
    private static final long ONE_MINUTE_MS = 60 * 1000L;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody AuraChatRequest request, HttpServletRequest servletRequest) {
        String clientIp = getClientIp(servletRequest);

        // Rate limiting check
        if (isRateLimited(clientIp)) {
            logger.warn("Rate limit exceeded for IP: {}", clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new AuraChatResponse(
                            "You are asking questions a bit too fast! Please wait a moment before sending your next question to Aura.",
                            Collections.emptyList(),
                            false
                    ));
        }

        User authenticatedUser = getAuthenticatedUser(servletRequest);

        try {
            AuraChatResponse response = auraService.processChat(request, authenticatedUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing Aura chat request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuraChatResponse(
                            "I encountered a temporary issue while retrieving information. Please feel free to ask again or browse our saree collections!",
                            Collections.emptyList(),
                            false
                    ));
        }
    }

    private boolean isRateLimited(String ip) {
        long now = System.currentTimeMillis();
        Queue<Long> timestamps = requestTimesMap.computeIfAbsent(ip, k -> new ConcurrentLinkedQueue<>());

        // Remove entries older than 1 minute
        while (!timestamps.isEmpty() && (now - timestamps.peek()) > ONE_MINUTE_MS) {
            timestamps.poll();
        }

        if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
            return true;
        }

        timestamps.add(now);
        return false;
    }

    private User getAuthenticatedUser(HttpServletRequest servletRequest) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                return userRepository.findById(userDetails.getId()).orElse(null);
            }

            // Fallback header parsing
            String authHeader = servletRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtils.validateJwtToken(token)) {
                    String username = jwtUtils.getUserNameFromJwtToken(token);
                    return userRepository.findByUsername(username).orElse(null);
                }
            }
        } catch (Exception e) {
            logger.debug("Failed to extract authenticated user for Aura chat: {}", e.getMessage());
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
