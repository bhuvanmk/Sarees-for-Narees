# Sarees For Naaris - Backend Engineering Interview Q&A (50 Questions)

A comprehensive guide containing 50 technical interview questions & detailed answers based on the **Spring Boot 3, Spring Security 6, JWT, RESTful API design, Hibernate/JPA, and MySQL** implementation of **Sarees For Naaris**.

---

## Table of Contents
1. [Spring Boot 3 & Core Architecture (Q1 – Q10)](#1-spring-boot-3--core-architecture)
2. [Spring Security 6 & JWT Authentication (Q11 – Q20)](#2-spring-security-6--jwt-authentication)
3. [REST API Design & Controller Layer (Q21 – Q27)](#3-rest-api-design--controller-layer)
4. [Spring Data JPA, Hibernate & MySQL ORM (Q28 – Q36)](#4-spring-data-jpa-hibernate--mysql-orm)
5. [Transactional Management & Business Logic (Q37 – Q43)](#5-transactional-management--business-logic)
6. [Security Best Practices, Testing & Performance (Q44 – Q50)](#6-security-best-practices-testing--performance)

---

## 1. Spring Boot 3 & Core Architecture

### Q1: What core framework technologies power the Sarees For Naaris backend?
**Answer:**
The backend is built on **Java 17 / Java 21** using **Spring Boot 3.x**. Key components include:
- **Spring Web (MVC)** for RESTful endpoints.
- **Spring Security 6** for authentication and RBAC (Role-Based Access Control).
- **Spring Data JPA / Hibernate 6** for object-relational mapping with **MySQL**.
- **JJWT (io.jsonwebtoken)** for stateless JWT token parsing and generation.
- **Lombok** to reduce boilerplate code (getters/setters, builders, constructors).

---

### Q2: How does `@SpringBootApplication` function in this project?
**Answer:**
`@SpringBootApplication` is a convenience annotation that combines three core Spring annotations:
1. `@SpringBootConfiguration`: Marks the class as a configuration source.
2. `@EnableAutoConfiguration`: Tells Spring Boot to start auto-configuring beans based on classpath dependencies (e.g., configuring `HikariDataSource` when MySQL driver is present).
3. `@ComponentScan`: Enables component scanning in `com.sareesfornaaris.auth` package to automatically discover `@RestController`, `@Service`, `@Repository`, and `@Component` annotated classes.

---

### Q3: What is Dependency Injection (DI) and how is Constructor Injection implemented here?
**Answer:**
Dependency Injection is a design pattern implementing Inversion of Control (IoC), where Spring manages object creation and dependencies rather than components instantiating their own dependencies.
In Sarees For Naaris, constructor injection is enforced via Lombok's `@RequiredArgsConstructor`:
```java
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
}
```
**Benefits over `@Autowired` field injection:**
- Ensures immutability (`final` fields).
- Simplifies unit testing without needing reflection or Spring Context wrappers.
- Prevents Circular Dependencies at compile time.

---

### Q4: How is configuration managed across environments using `application.yml`?
**Answer:**
Configuration is externalized in `src/main/resources/application.yml`. Key profiles (e.g., `dev`, `prod`) can be managed using property placeholders or profile-specific files:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/my_ecommerce?createDatabaseIfNotExist=true&useSSL=false
    username: root
    password: ${DB_PASSWORD:1234}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```
This allows overriding database credentials via environment variables without re-compiling the JAR.

---

### Q5: What is the purpose of Maven `pom.xml` build configuration in Spring Boot?
**Answer:**
`pom.xml` manages dependencies, plugin management, and Java version compliance using `spring-boot-starter-parent`. Starters like `spring-boot-starter-web`, `spring-boot-starter-security`, and `spring-boot-starter-data-jpa` aggregate dependencies with pre-tested, compatible version matrix (Dependency Management).

---

### Q6: How does Spring Boot handle Application Context initialization?
**Answer:**
When `SpringApplication.run(Application.class, args)` is invoked:
1. Creates an appropriate `ApplicationContext` instance (e.g., `AnnotationConfigServletWebServerApplicationContext`).
2. Registers environment properties and active profiles.
3. Loads bean definitions via Component Scanning and Auto-Configurations.
4. Instantiates singleton beans, resolves DI, calls `@PostConstruct` hooks, and starts the embedded Tomcat web server on port 8080.

---

### Q7: Explain the 3-Tier Architecture implemented in the backend.
**Answer:**
- **Controller Layer (`@RestController`)**: Handles HTTP requests/responses, path mapping, request validation, and status codes.
- **Service Layer (`@Service`)**: Encapsulates core business logic, transaction boundaries (`@Transactional`), domain validation, and third-party integrations (e.g., Razorpay, Email).
- **Data Access Layer (`@Repository`)**: Interacts with MySQL database via Spring Data JPA interfaces.

---

### Q8: What are DTOs (Data Transfer Objects) and why are they used instead of exposing Entities directly?
**Answer:**
DTOs (e.g., `LoginRequest`, `JwtResponse`, `ProductDTO`) decouple the database persistence schema from the REST API contract.
**Reasons for using DTOs:**
1. **Security**: Prevents Over-posting / Mass Assignment vulnerabilities (e.g., preventing a customer from updating their `role` field via JSON body).
2. **Prevent Recursion**: Avoids infinite JSON serialization loops caused by bidirectional `@OneToMany` relationships.
3. **Performance**: Selective field payloads reduce network bandwidth.

---

### Q9: How are Custom Exceptions handled globally across the REST API?
**Answer:**
Using `@RestControllerAdvice` and `@ExceptionHandler` annotations in a centralized global exception handler class:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse err = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage(), LocalDateTime.now());
        return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
    }
}
```
This guarantees consistent JSON error responses across all endpoints.

---

### Q10: How does Lombok reduce boilerplate in Spring Boot entity and DTO definitions?
**Answer:**
Lombok annotations used in the project:
- `@Data`: Generates getters, setters, `equals()`, `hashCode()`, and `toString()`.
- `@Getter` / `@Setter`: Field-level accessor generation.
- `@Builder`: Implements the Builder Pattern for fluent object creation (`Product.builder().name("Silk Saree").build()`).
- `@NoArgsConstructor` / `@AllArgsConstructor`: Generates default and parameterized constructors required by JPA and Jackson serializer.

---

## 2. Spring Security 6 & JWT Authentication

### Q11: Describe the complete authentication flow when a user logs into Sarees For Naaris.
**Answer:**
1. User posts credentials (`username`, `password`) to `/api/auth/login`.
2. `AuthService` calls `AuthenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user, pass))`.
3. `AuthenticationManager` delegates to `DaoAuthenticationProvider`, which invokes `UserDetailsServiceImpl.loadUserByUsername()`.
4. Password is verified using `PasswordEncoder.matches(rawPassword, encodedPassword)`.
5. Upon successful validation, `JwtUtils` generates an Access Token and a Refresh Token.
6. Server returns HTTP 200 containing tokens and user metadata (`id`, `username`, `email`, `role`).

---

### Q12: How does `AuthTokenFilter` validate JWTs on incoming requests?
**Answer:**
`AuthTokenFilter` extends `OncePerRequestFilter`:
1. Extracts Bearer token from `Authorization` HTTP header (`Authorization: Bearer <token>`).
2. Calls `JwtUtils.validateJwtToken(token)` to verify signature and expiration.
3. Extracts `username` from payload.
4. Loads `UserDetails` and creates `UsernamePasswordAuthenticationToken`.
5. Sets authentication object into `SecurityContextHolder.getContext().setAuthentication(auth)`.
6. Request continues down the filter chain to the target controller.

---

### Q13: How is stateless session management configured in Spring Security 6?
**Answer:**
In `WebSecurityConfig.java`:
```java
http.sessionManagement(session -> 
    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
);
```
This instructs Spring Security to never create an HTTP `HttpSession` on the server, ensuring full horizontal scalability across stateless nodes.

---

### Q14: What is the difference between Access Tokens and Refresh Tokens in this architecture?
**Answer:**
- **Access Token**: Short-lived JWT (e.g., 15-60 mins) containing user claims and roles. Transmitted in `Authorization` headers for API authorization.
- **Refresh Token**: Long-lived token (e.g., 7-30 days) stored securely in the database (`RefreshToken` entity). Used at `/api/auth/refresh` to obtain a new Access Token without prompting user login.

---

### Q15: How does `PasswordEncoder` secure stored user passwords?
**Answer:**
The project uses `BCryptPasswordEncoder` bean configured in `WebSecurityConfig`:
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```
BCrypt automatically applies a randomized salt and key stretching (work factor default = 10) to protect against rainbow table attacks and brute force.

---

### Q16: How is Role-Based Access Control (RBAC) enforced on endpoints?
**Answer:**
RBAC is enforced via Spring Security matchers in `SecurityFilterChain`:
```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**", "/api/products/**", "/api/categories/**").permitAll()
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .requestMatchers("/api/seller/**").hasAnyRole("SELLER", "ADMIN")
    .anyRequest().authenticated()
);
```
Additionally, `@PreAuthorize("hasRole('ADMIN')")` method-level security can be enabled on specific service methods.

---

### Q17: What is CORS and how is it configured in the Spring Boot backend?
**Answer:**
CORS (Cross-Origin Resource Sharing) prevents unauthorized domains from accessing API resources in browsers.
Configured via `CorsConfigurationSource`:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

### Q18: What is CSRF and why is CSRF disabled (`http.csrf(csrf -> csrf.disable())`) in this backend?
**Answer:**
CSRF (Cross-Site Request Forgery) attacks exploit automatic browser cookie sending. Since our backend uses **stateless JWT tokens** passed via custom `Authorization: Bearer` headers rather than ambient session cookies, browser requests from malicious origins cannot automatically attach the token. Thus, disabling CSRF is secure and standard practice for stateless APIs.

---

### Q19: How are unauthorized and forbidden access attempts handled by Spring Security?
**Answer:**
- **401 Unauthorized**: Handled by custom `AuthEntryPointJwt` implementing `AuthenticationEntryPoint`, returning structured JSON when an unauthenticated request hits a protected resource.
- **403 Forbidden**: Handled by `AccessDeniedHandler`, returning structured JSON when an authenticated user attempts to access a resource above their role privileges (e.g., `ROLE_CUSTOMER` calling `/api/admin/revenue`).

---

### Q20: How are Refresh Tokens revoked during user logout?
**Answer:**
When a user logs out, the client invokes `/api/auth/logout`. The backend executes `refreshTokenService.deleteByUserId(userId)` to delete the stored refresh token from MySQL, invalidating future token renewal attempts.

---

## 3. REST API Design & Controller Layer

### Q21: What REST HTTP methods are utilized in Sarees For Naaris endpoints?
**Answer:**
- `GET`: Fetch catalog products, categories, wishlist, cart count, order status.
- `POST`: User registration, login, add item to cart, create order, submit review.
- `PUT`: Update cart item quantity, update product pricing/stock, update order delivery status.
- `DELETE`: Remove item from cart, remove item from wishlist, delete product.

---

### Q22: How is pagination and sorting handled in Product APIs?
**Answer:**
Using Spring Data's `Pageable` and `PageRequest`:
```java
@GetMapping("/products")
public ResponseEntity<Page<Product>> getProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "createdAt") String sortBy,
    @RequestParam(defaultValue = "desc") String sortDir
) {
    Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page, size, sort);
    return ResponseEntity.ok(productService.getAllProducts(pageable));
}
```

---

### Q23: How do search & dynamic catalog filters work in `ProductController`?
**Answer:**
Filtering accepts query parameters: `category_id`, `subcategory_id`, `search`, `min_price`, `max_price`, `in_stock`, `sort_by`.
The repository utilizes dynamic JPA Specifications or custom JPQL `@Query` with optional null-checked conditions to assemble query predicates at runtime.

---

### Q24: What is the role of `@Valid` and JSR-380 annotations in request payloads?
**Answer:**
`@Valid` triggers automatic request validation before controller execution.
```java
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30)
    private String username;

    @NotBlank @Email(message = "Invalid email format")
    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
```
If validation fails, Spring throws `MethodArgumentNotValidException`, which is caught by `@RestControllerAdvice` returning HTTP 400 with validation details.

---

### Q25: How are proper HTTP Response Status Codes returned?
**Answer:**
Using `ResponseEntity<T>` wrapper:
- `200 OK`: Successful fetch or update.
- `201 Created`: Successfully registered user or created product/order.
- `204 No Content`: Successful deletion (e.g., clear cart).
- `400 Bad Request`: Invalid payload / failed validation.
- `401 Unauthorized`: Invalid credentials or expired token.
- `404 Not Found`: Product ID or Order ID does not exist.

---

### Q26: How are query parameters (`@RequestParam`) distinguished from path variables (`@PathVariable`)?
**Answer:**
- `@PathVariable`: Identifies a specific resource instance by URI segment (e.g., `/api/products/{id}`).
- `@RequestParam`: Filters, sorts, or paginates collections (e.g., `/api/products?search=banarasi&min_price=5000`).

---

### Q27: How does Jackson handle JSON serialization of Java date objects?
**Answer:**
Using `@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")` or configuring Jackson `ObjectMapper` with `JavaTimeModule` to convert `LocalDateTime` fields into standard ISO-8601 string representations.

---

## 4. Spring Data JPA, Hibernate & MySQL ORM

### Q28: Detail the key Entities and relationships in the backend domain schema.
**Answer:**
- `User` 1 ── N `Order` (`@OneToMany`)
- `Category` 1 ── N `SubCategory` (`@OneToMany`)
- `Category` 1 ── N `Product` (`@OneToMany`)
- `Product` 1 ── N `ProductImage` (`@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)`)
- `Order` 1 ── N `OrderItem` (`@OneToMany(cascade = CascadeType.ALL)`)
- `User` 1 ── N `CartItem` (`@OneToMany`)

---

### Q29: What is the difference between `FetchType.LAZY` and `FetchType.EAGER`?
**Answer:**
- `LAZY` (Default for `@OneToMany`, `@ManyToMany`): Postpones loading related entity collections from MySQL until explicitly accessed within an active transaction. Prevents loading unnecessary memory footprint.
- `EAGER` (Default for `@ManyToOne`, `@OneToOne`): Fetches associated entity in the initial SQL JOIN query.

---

### Q30: What is the N+1 SELECT Problem and how is it resolved in product querying?
**Answer:**
**Problem:** Fetching $N$ products executes 1 initial query to get products, plus $N$ additional SQL queries to load associated images or categories for each product.
**Solution:** Using `JOIN FETCH` in JPQL or `@EntityGraph` in `ProductRepository`:
```java
@Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.productId = :id")
Optional<Product> findByIdWithDetails(@Param("id") Long id);
```
This executes a single optimized SQL `LEFT OUTER JOIN`.

---

### Q31: How do derived query methods work in `UserRepository` and `ProductRepository`?
**Answer:**
Spring Data JPA parses method naming patterns into SQL queries automatically:
```java
Optional<User> findByUsername(String username);
Boolean existsByEmail(String email);
List<Product> findByCategory_CategoryId(Long categoryId);
```
No manual SQL writing required for standard queries.

---

### Q32: What is Cascading (`CascadeType`) and `orphanRemoval` in parent-child persistence?
**Answer:**
In `Product` entity:
```java
@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ProductImage> images = new ArrayList<>();
```
- `CascadeType.ALL`: Persisting/deleting a `Product` automatically persists/deletes its associated `ProductImage` records.
- `orphanRemoval = true`: Removing a `ProductImage` from the `images` list automatically executes a DELETE SQL statement in MySQL.

---

### Q33: How does primary key auto-generation function with `@GeneratedValue(strategy = GenerationType.IDENTITY)`?
**Answer:**
`GenerationType.IDENTITY` relies on MySQL's native `AUTO_INCREMENT` column constraint. MySQL assigns sequential integer IDs upon insert, which Hibernate retrieves after executing the SQL `INSERT`.

---

### Q34: What is the purpose of `@Temporal` or `@CreationTimestamp` / `@UpdateTimestamp`?
**Answer:**
Hibernate's `@CreationTimestamp` and `@UpdateTimestamp` annotations automatically populate timestamp fields (`createdAt`, `updatedAt`) when records are inserted or updated, eliminating manual date setting in service methods.

---

### Q35: How does database connection pooling work via HikariCP?
**Answer:**
Spring Boot 3 uses **HikariCP** as the default high-performance JDBC connection pool. Hikari maintains a reusable pool of database connections (default size = 10), preventing the high overhead of establishing a new TCP connection to MySQL for every API request.

---

### Q36: What is the difference between JPQL and Native SQL in Spring Data repositories?
**Answer:**
- **JPQL (Java Persistence Query Language)**: Queries against entity objects (`SELECT p FROM Product p WHERE p.price > :price`). Database-agnostic.
- **Native SQL**: Queries against actual MySQL table names and columns (`@Query(value = "SELECT * FROM products WHERE price > :price", nativeQuery = true)`). Used when leveraging MySQL-specific features or performance optimizations.

---

## 5. Transactional Management & Business Logic

### Q37: How does `@Transactional` guarantee ACID properties during Checkout?
**Answer:**
`@Transactional` wraps checkout execution in a database transaction managed by Spring's `PlatformTransactionManager`:
1. Verifies cart items and stock.
2. Deducts stock from `products` table.
3. Creates new `Order` and `OrderItem` records.
4. Clears `cart_items` for user.

If any step throws an unhandled RuntimeException (e.g., stock insufficient), Spring triggers an automatic **Rollback**, restoring MySQL database state to prevent partial data corruption.

---

### Q38: What is Transaction Propagation and what is the default setting?
**Answer:**
Default propagation is `REQUIRED`:
- If an active transaction exists, the current method joins it.
- If no transaction exists, a new database transaction is initialized.

---

### Q39: How does the Order Placement process handle Cash on Delivery (COD) vs Online Payment (Razorpay)?
**Answer:**
- **COD (`/api/orders/create-cod`)**: Validates cart $\rightarrow$ Creates Order with `payment_status = 'PENDING'`, `payment_method = 'COD'` $\rightarrow$ Decrements Stock $\rightarrow$ Clears Cart.
- **Razorpay (`/api/payments/create-order` & `/api/payments/verify`)**:
  1. Server calls Razorpay API to generate a `razorpay_order_id`.
  2. Client completes payment widget.
  3. Server verifies HMAC SHA-256 signature (`razorpay_order_id` + `razorpay_payment_id` against `key_secret`).
  4. Upon valid signature verification, order status is updated to `PAID` and order placed.

---

### Q40: How does the Cart and Wishlist workflow handle guest transition to authenticated user?
**Answer:**
When an unauthenticated guest user performs an action (e.g., Add to Cart, Buy Now), the frontend stores the pending action object in `sessionStorage` and redirects to `/login`. Upon successful authentication, the pending action payload is re-submitted to the backend API (`/api/cart` or `/api/wishlist`).

---

### Q41: Explain how the Product Review System moderates and calculates ratings.
**Answer:**
1. Customer submits review (`rating`, `comment`, optional `photoUrls`).
2. Review is created with `status = 'APPROVED'` or `PENDING_MODERATION`.
3. Backend service dynamically calculates product average rating:
   $$\text{Average Rating} = \frac{\sum \text{ratings}}{\text{Total Approved Reviews}}$$
4. Product response includes overall average, review count, and rating distribution percentage bars (5-star through 1-star).

---

### Q42: How is double-submission or race conditions prevented during stock reduction?
**Answer:**
- **Pessimistic Locking**: Executing SQL `SELECT ... FOR UPDATE` locks the target product row until checkout transaction completes.
- **Optimistic Locking**: Using `@Version` column in `Product` entity. If another thread updates stock concurrently, Hibernate throws `OptimisticLockException`, prompting a retry.

---

### Q43: How is email notification dispatched asynchronously?
**Answer:**
Using Spring's `@EnableAsync` and `@Async` annotations in `EmailService`. Order confirmation emails (sent via JavaMailSender) run on a separate background thread pool, preventing API response blocking for the user during checkout.

---

## 6. Security Best Practices, Testing & Performance

### Q44: How are SQL Injection attacks prevented in Spring Data JPA?
**Answer:**
Spring Data JPA uses parameterized JPQL queries under the hood (`PreparedStatement` in JDBC). Parameters are automatically escaped before SQL execution, rendering user input harmless against SQL Injection.

---

### Q45: How is sensitive information protected in `application.yml`?
**Answer:**
Sensitive data (JWT secret key, database passwords, SMTP credentials, Razorpay secret) should not be hardcoded in repository source code. They are injected via Environment Variables:
```yaml
jwt:
  secret: ${JWT_SECRET_KEY}
```

---

### Q46: What integration test tools are used for Spring Boot testing?
**Answer:**
- **JUnit 5 & AssertJ**: Core testing framework and fluent assertions.
- **Spring Boot Test (`@SpringBootTest`)**: Loads full application context for integration testing.
- **`MockMvc`**: Simulates HTTP requests to controllers without starting full server.
- **Testcontainers / H2**: In-memory or containerized databases for isolated test execution.

---

### Q47: How does `test_razorpay_integration.py` validate payment workflows?
**Answer:**
`test_razorpay_integration.py` is an automated Python test script that executes end-to-end integration tests:
1. Performs HTTP authentication to obtain JWT.
2. Invokes payment order creation endpoint.
3. Generates valid HMAC-SHA256 signature matching backend algorithm.
4. Posts verification request and asserts HTTP 200 OK and order creation in database.

---

### Q48: What performance optimization strategies are applied to the MySQL database?
**Answer:**
1. **Indexes**: Added B-Tree indexes on foreign keys (`category_id`, `user_id`) and search columns (`name`, `status`).
2. **Lazy Loading**: Avoids pulling unused entity sub-trees.
3. **Pagination**: Prevents returning thousands of rows in a single REST response.
4. **Hikari Connection Pooling**: Minimizes database connection setup latency.

---

### Q49: How does the application prevent XSS (Cross-Site Scripting) attacks?
**Answer:**
1. **Spring HTTP Request Sanitization**: Encodes request body strings.
2. **Jackson JSON Encoding**: Escapes dangerous HTML characters during serialization.
3. **React Frontend Auto-Escaping**: React automatically escapes values rendered in JSX (`{product.name}`).

---

### Q50: How can this Spring Boot backend be packaged and deployed to production?
**Answer:**
1. Build executable uber-JAR using Maven:
   ```bash
   mvn clean package -DskipTests
   ```
2. Containerize using Docker (`Dockerfile`):
   ```dockerfile
   FROM eclipse-temurin:17-jdk-alpine
   COPY target/sarees-for-naaris-backend.jar app.jar
   ENTRYPOINT ["java", "-jar", "/app.jar"]
   ```
3. Deploy container onto AWS ECS, Azure App Service, or Render connected to a managed MySQL database instance (e.g. AWS RDS).

---
*End of Backend Technical Interview Guide (50 Questions)*
