package com.school.admin.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter for the /api/auth/login endpoint.
 * Blocks an IP after MAX_ATTEMPTS failed calls within WINDOW_SECONDS.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final int    MAX_ATTEMPTS     = 10;
    private static final long   WINDOW_SECONDS   = 60;

    private record Bucket(int count, long windowStart) {}
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Only apply to login endpoint
        return !request.getRequestURI().equals("/api/auth/login")
                || !request.getMethod().equalsIgnoreCase("POST");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String ip = getClientIp(request);
        long   now = Instant.now().getEpochSecond();

        Bucket bucket = buckets.compute(ip, (k, b) -> {
            if (b == null || now - b.windowStart() >= WINDOW_SECONDS)
                return new Bucket(1, now);
            return new Bucket(b.count() + 1, b.windowStart());
        });

        if (bucket.count() > MAX_ATTEMPTS) {
            long retryAfter = WINDOW_SECONDS - (now - bucket.windowStart());
            log.warn("Rate limit exceeded for IP {} on login endpoint", ip);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.getWriter().write(
                "{\"message\":\"Too many login attempts. Please try again in " + retryAfter + " seconds.\","
                + "\"status\":429}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank())
            return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
