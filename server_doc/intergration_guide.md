# Woosh API Integration Guide

This guide provides practical examples and best practices for integrating with the Woosh API in your applications.

## Quick Start

### 1. Authentication Setup

First, authenticate to get a JWT token:

```javascript
// JavaScript/Node.js Example
const loginResponse = await fetch('https://your-api-domain.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phoneNumber: '+254123456789',
    password: 'your-password'
  })
});

const { access_token, user } = await loginResponse.json();

// Store the token for subsequent requests
const authHeaders = {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json'
};
```

```dart
// Flutter/Dart Example
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<String> login(String phoneNumber, String password) async {
  final response = await http.post(
    Uri.parse('https://your-api-domain.com/api/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'phoneNumber': phoneNumber,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['access_token'];
  } else {
    throw Exception('Failed to login');
  }
}
```

```python
# Python Example
import requests

def login(phone_number, password):
    url = "https://your-api-domain.com/api/auth/login"
    payload = {
        "phoneNumber": phone_number,
        "password": password
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        return data['access_token']
    else:
        raise Exception(f"Login failed: {response.text}")

# Usage
token = login("+254123456789", "your-password")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
```

### 2. Making Authenticated Requests

```javascript
// Get all clients
const clientsResponse = await fetch('https://your-api-domain.com/api/clients', {
  headers: authHeaders
});
const clients = await clientsResponse.json();
```

## Common Integration Patterns

### 1. Client Management Workflow

```javascript
// Complete client management workflow
class ClientManager {
  constructor(apiUrl, authToken) {
    this.apiUrl = apiUrl;
    this.headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getAllClients() {
    const response = await fetch(`${this.apiUrl}/clients`, {
      headers: this.headers
    });
    return response.json();
  }

  async searchClients(searchTerm, page = 1, limit = 10) {
    const params = new URLSearchParams({
      name: searchTerm,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await fetch(`${this.apiUrl}/clients/search?${params}`, {
      headers: this.headers
    });
    return response.json();
  }

  async createClient(clientData) {
    const response = await fetch(`${this.apiUrl}/clients`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(clientData)
    });
    return response.json();
  }

  async findNearbyClients(latitude, longitude, radius = 10) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString()
    });
    
    const response = await fetch(`${this.apiUrl}/clients/location/nearby?${params}`, {
      headers: this.headers
    });
    return response.json();
  }
}
```

### 2. Order Management Workflow

```javascript
// Order management with error handling
class OrderManager {
  constructor(apiUrl, authToken) {
    this.apiUrl = apiUrl;
    this.headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async createOrder(orderData) {
    try {
      const response = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }

  async getOrders(filters = {}) {
    const params = new URLSearchParams({
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 10).toString(),
      ...(filters.status && { status: filters.status }),
      ...(filters.clientId && { clientId: filters.clientId.toString() }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate })
    });

    const response = await fetch(`${this.apiUrl}/orders?${params}`, {
      headers: this.headers
    });

    return response.json();
  }
}

// Example usage
const orderManager = new OrderManager('https://your-api-domain.com/api', token);

const newOrder = await orderManager.createOrder({
  clientId: 1,
  orderDate: new Date().toISOString(),
  expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  notes: "Urgent delivery",
  orderItems: [
    {
      productId: 1,
      quantity: 10,
      unitPrice: 25.50
    }
  ]
});
```

### 3. Journey Planning Integration

```dart
// Flutter example for journey planning
class JourneyPlanService {
  final String baseUrl;
  final String token;

  JourneyPlanService(this.baseUrl, this.token);

  Future<List<dynamic>> getTodaysJourneyPlans() async {
    final today = DateTime.now().toIso8601String().split('T')[0];
    
    final response = await http.get(
      Uri.parse('$baseUrl/journey-plans/by-date?startDate=$today&endDate=$today'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'] ?? [];
    } else {
      throw Exception('Failed to load journey plans');
    }
  }

  Future<Map<String, dynamic>> checkoutFromPlan(int planId, double lat, double lng) async {
    final response = await http.post(
      Uri.parse('$baseUrl/journey-plans/$planId/checkout'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'checkoutTime': DateTime.now().toIso8601String(),
        'checkoutLatitude': lat,
        'checkoutLongitude': lng,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to checkout');
    }
  }
}
```

### 4. Clock In/Out Integration

```javascript
// Time tracking integration
class TimeTracker {
  constructor(apiUrl, authToken) {
    this.apiUrl = apiUrl;
    this.headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async clockIn(userId, location = null) {
    const position = location || await this.getCurrentPosition();
    
    const clockInData = {
      userId: userId,
      clockInTime: new Date().toISOString(),
      latitude: position.latitude,
      longitude: position.longitude,
      location: position.address || 'Unknown Location'
    };

    const response = await fetch(`${this.apiUrl}/clock-in-out/clock-in`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(clockInData)
    });

    return response.json();
  }

  async clockOut(userId, location = null) {
    const position = location || await this.getCurrentPosition();
    
    const clockOutData = {
      userId: userId,
      clockOutTime: new Date().toISOString(),
      latitude: position.latitude,
      longitude: position.longitude,
      location: position.address || 'Unknown Location'
    };

    const response = await fetch(`${this.apiUrl}/clock-in-out/clock-out`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(clockOutData)
    });

    return response.json();
  }

  async getCurrentStatus(userId) {
    const response = await fetch(`${this.apiUrl}/clock-in-out/status/${userId}`, {
      headers: this.headers
    });
    return response.json();
  }

  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
        error => reject(error)
      );
    });
  }
}
```

### 5. Payment Upload with Image

```javascript
// Payment upload with file handling
class PaymentManager {
  constructor(apiUrl, authToken) {
    this.apiUrl = apiUrl;
    this.authToken = authToken;
  }

  async uploadPayment(clientId, amount, method, invoiceFile) {
    const formData = new FormData();
    formData.append('amount', amount.toString());
    formData.append('method', method);
    formData.append('image', invoiceFile);

    const response = await fetch(`${this.apiUrl}/outlets/${clientId}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
        // Don't set Content-Type for FormData - browser will set it automatically
      },
      body: formData
    });

    return response.json();
  }

  async getClientPayments(clientId) {
    const response = await fetch(`${this.apiUrl}/outlets/${clientId}/payments`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }
}
```

### 6. Leave Request with Attachment

```dart
// Flutter example for leave request with file upload
import 'package:http/http.dart' as http;
import 'dart:io';

class LeaveService {
  final String baseUrl;
  final String token;

  LeaveService(this.baseUrl, this.token);

  Future<Map<String, dynamic>> submitLeaveRequest({
    required int userId,
    required String leaveType,
    required String startDate,
    required String endDate,
    required String reason,
    File? attachment,
  }) async {
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/leave'),
    );

    // Add headers
    request.headers['Authorization'] = 'Bearer $token';

    // Add form fields
    request.fields['userId'] = userId.toString();
    request.fields['leaveType'] = leaveType;
    request.fields['startDate'] = startDate;
    request.fields['endDate'] = endDate;
    request.fields['reason'] = reason;

    // Add file if provided
    if (attachment != null) {
      request.files.add(
        await http.MultipartFile.fromPath(
          'attachment',
          attachment.path,
        ),
      );
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to submit leave request: ${response.body}');
    }
  }

  Future<List<dynamic>> getLeaveTypes() async {
    final response = await http.get(
      Uri.parse('$baseUrl/leave/types/all'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load leave types');
    }
  }
}
```

## Error Handling Best Practices

### 1. HTTP Status Code Handling

```javascript
class ApiClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      // Handle different status codes
      switch (response.status) {
        case 200:
        case 201:
          return await response.json();
        
        case 401:
          // Token expired or invalid
          this.handleAuthError();
          throw new Error('Authentication required');
        
        case 403:
          throw new Error('Access forbidden');
        
        case 404:
          throw new Error('Resource not found');
        
        case 500:
          throw new Error('Server error');
        
        default:
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  handleAuthError() {
    // Clear stored token and redirect to login
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  }
}
```

### 2. Network Error Handling

```javascript
// Retry mechanism for network failures
class RobustApiClient extends ApiClient {
  async makeRequestWithRetry(endpoint, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest(endpoint, options);
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication errors
        if (error.message.includes('Authentication required')) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    throw lastError;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Data Synchronization Patterns

### 1. Offline-First Approach

```javascript
// Local storage with API sync
class OfflineFirstClient {
  constructor(apiClient) {
    this.api = apiClient;
    this.storage = localStorage; // or IndexedDB for larger data
  }

  async getClients(forceRefresh = false) {
    const cacheKey = 'clients_cache';
    const cacheTimestamp = 'clients_cache_timestamp';
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // Check cache first
    if (!forceRefresh) {
      const cached = this.storage.getItem(cacheKey);
      const timestamp = this.storage.getItem(cacheTimestamp);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < cacheExpiry) {
          return JSON.parse(cached);
        }
      }
    }

    try {
      // Fetch from API
      const clients = await this.api.makeRequest('/clients');
      
      // Update cache
      this.storage.setItem(cacheKey, JSON.stringify(clients));
      this.storage.setItem(cacheTimestamp, Date.now().toString());
      
      return clients;
    } catch (error) {
      // Return cached data if API fails
      const cached = this.storage.getItem(cacheKey);
      if (cached) {
        console.warn('API failed, returning cached data');
        return JSON.parse(cached);
      }
      throw error;
    }
  }
}
```

### 2. Real-time Updates

```javascript
// Polling for real-time updates
class RealtimeUpdater {
  constructor(apiClient) {
    this.api = apiClient;
    this.intervals = new Map();
  }

  startPolling(endpoint, callback, intervalMs = 30000) {
    const intervalId = setInterval(async () => {
      try {
        const data = await this.api.makeRequest(endpoint);
        callback(data);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, intervalMs);

    this.intervals.set(endpoint, intervalId);
    return intervalId;
  }

  stopPolling(endpoint) {
    const intervalId = this.intervals.get(endpoint);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(endpoint);
    }
  }

  stopAllPolling() {
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals.clear();
  }
}

// Usage
const updater = new RealtimeUpdater(apiClient);

// Poll for new orders every 30 seconds
updater.startPolling('/orders', (orders) => {
  updateUI(orders);
});
```

## Mobile App Integration

### 1. Flutter Integration Class

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class WooshApiService {
  final String baseUrl;
  String? _token;

  WooshApiService(this.baseUrl);

  // Initialize with stored token
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('jwt_token');
  }

  // Login and store token
  Future<Map<String, dynamic>> login(String phoneNumber, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phoneNumber': phoneNumber,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _token = data['access_token'];
      
      // Store token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', _token!);
      
      return data;
    } else {
      throw Exception('Login failed');
    }
  }

  // Generic API request method
  Future<dynamic> request(String endpoint, {
    String method = 'GET',
    Map<String, dynamic>? body,
    Map<String, String>? queryParams,
  }) async {
    if (_token == null) {
      throw Exception('Not authenticated');
    }

    Uri uri = Uri.parse('$baseUrl$endpoint');
    if (queryParams != null) {
      uri = uri.replace(queryParameters: queryParams);
    }

    final headers = {
      'Authorization': 'Bearer $_token',
      'Content-Type': 'application/json',
    };

    http.Response response;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = await http.get(uri, headers: headers);
        break;
      case 'POST':
        response = await http.post(uri, headers: headers, body: body != null ? jsonEncode(body) : null);
        break;
      case 'PUT':
        response = await http.put(uri, headers: headers, body: body != null ? jsonEncode(body) : null);
        break;
      case 'PATCH':
        response = await http.patch(uri, headers: headers, body: body != null ? jsonEncode(body) : null);
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        throw Exception('Unsupported HTTP method: $method');
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      // Token expired, clear it
      _token = null;
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('jwt_token');
      throw Exception('Authentication expired');
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }

  // Specific methods
  Future<List<dynamic>> getClients() async {
    return await request('/clients');
  }

  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> orderData) async {
    return await request('/orders', method: 'POST', body: orderData);
  }

  Future<List<dynamic>> getJourneyPlans({String? date}) async {
    final queryParams = date != null ? {'date': date} : null;
    return await request('/journey-plans', queryParams: queryParams);
  }
}
```

### 2. React Native Integration

```javascript
// React Native service with AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

class WooshApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  async init() {
    this.token = await AsyncStorage.getItem('jwt_token');
  }

  async login(phoneNumber, password) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.token = data.access_token;
        await AsyncStorage.setItem('jwt_token', this.token);
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (response.status === 401) {
        // Clear token and throw auth error
        this.token = null;
        await AsyncStorage.removeItem('jwt_token');
        throw new Error('Authentication expired');
      }

      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Location-based client search
  async findNearbyClients(latitude, longitude, radius = 10) {
    return this.request(
      `/clients/location/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
  }

  // Clock in with location
  async clockIn(userId, latitude, longitude, locationName) {
    return this.request('/clock-in-out/clock-in', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        clockInTime: new Date().toISOString(),
        latitude,
        longitude,
        location: locationName
      })
    });
  }
}
```

## Pagination Handling

```javascript
// Efficient pagination handling
class PaginatedDataManager {
  constructor(apiClient) {
    this.api = apiClient;
    this.cache = new Map();
  }

  async loadPage(endpoint, page = 1, limit = 10) {
    const cacheKey = `${endpoint}_${page}_${limit}`;
    
    // Return cached data if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const data = await this.api.makeRequest(
      `${endpoint}?page=${page}&limit=${limit}`
    );

    // Cache the result
    this.cache.set(cacheKey, data);
    
    return data;
  }

  async loadAllPages(endpoint, limit = 10) {
    const allData = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.loadPage(endpoint, page, limit);
      
      if (response.success && response.data) {
        allData.push(...response.data);
        hasMore = page < response.totalPages;
        page++;
      } else {
        hasMore = false;
      }
    }

    return allData;
  }

  clearCache() {
    this.cache.clear();
  }
}
```

## File Upload Patterns

### 1. Image Upload with Progress

```javascript
// File upload with progress tracking
async function uploadPaymentWithProgress(clientId, amount, method, file, onProgress) {
  const formData = new FormData();
  formData.append('amount', amount.toString());
  formData.append('method', method);
  formData.append('image', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.open('POST', `${API_BASE_URL}/outlets/${clientId}/payments`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}
```

### 2. Multiple File Uploads

```javascript
// Batch file upload
async function uploadMultipleFiles(files, endpoint) {
  const uploadPromises = files.map(file => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
  });

  try {
    const responses = await Promise.all(uploadPromises);
    const results = await Promise.all(
      responses.map(response => response.json())
    );
    return results;
  } catch (error) {
    console.error('Batch upload failed:', error);
    throw error;
  }
}
```

## Performance Optimization

### 1. Request Batching

```javascript
// Batch multiple API calls
class BatchRequestManager {
  constructor(apiClient) {
    this.api = apiClient;
    this.pendingRequests = [];
    this.batchTimeout = null;
  }

  async batchRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ endpoint, options, resolve, reject });
      
      // Clear existing timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      // Set new timeout to process batch
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, 100); // 100ms delay
    });
  }

  async processBatch() {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    // Execute all requests in parallel
    const promises = requests.map(async ({ endpoint, options, resolve, reject }) => {
      try {
        const result = await this.api.makeRequest(endpoint, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    await Promise.allSettled(promises);
  }
}
```

### 2. Data Caching Strategy

```javascript
// Smart caching with TTL
class SmartCache {
  constructor(defaultTTL = 300000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}
```

## Security Best Practices

### 1. Token Management

```javascript
// Secure token handling
class SecureTokenManager {
  constructor() {
    this.token = null;
    this.refreshTimer = null;
  }

  setToken(token) {
    this.token = token;
    this.scheduleRefresh();
    
    // Store in secure storage (not localStorage for sensitive apps)
    if (window.crypto && window.crypto.subtle) {
      // Use encrypted storage for sensitive applications
      this.storeTokenSecurely(token);
    }
  }

  getToken() {
    return this.token;
  }

  scheduleRefresh() {
    // Refresh token 30 minutes before expiry (8.5 hours)
    const refreshTime = 8.5 * 60 * 60 * 1000;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }

  async refreshToken() {
    // Implement token refresh logic if available
    // For now, redirect to login
    this.clearToken();
    window.location.href = '/login';
  }

  clearToken() {
    this.token = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    // Clear from storage
    localStorage.removeItem('jwt_token');
  }
}
```

### 2. Request Validation

```javascript
// Input validation before API calls
class RequestValidator {
  static validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  static validateCoordinates(latitude, longitude) {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude');
    }
  }

  static validateOrderData(orderData) {
    if (!orderData.clientId) {
      throw new Error('Client ID is required');
    }
    if (!orderData.orderItems || orderData.orderItems.length === 0) {
      throw new Error('Order items are required');
    }
    
    orderData.orderItems.forEach((item, index) => {
      if (!item.productId) {
        throw new Error(`Product ID is required for item ${index + 1}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Valid quantity is required for item ${index + 1}`);
      }
    });
  }
}
```

## Testing Your Integration

### 1. Unit Tests Example

```javascript
// Jest test example
describe('WooshApiService', () => {
  let apiService;
  
  beforeEach(() => {
    apiService = new WooshApiService('http://localhost:3000/api');
  });

  test('should login successfully', async () => {
    const mockResponse = {
      access_token: 'test-token',
      user: { id: 1, name: 'Test User' }
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await apiService.login('+254123456789', 'password');
    
    expect(result.access_token).toBe('test-token');
    expect(result.user.name).toBe('Test User');
  });

  test('should handle network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      apiService.login('+254123456789', 'password')
    ).rejects.toThrow('Network error');
  });
});
```

### 2. Integration Testing

```javascript
// Integration test with real API
describe('API Integration Tests', () => {
  let token;
  
  beforeAll(async () => {
    // Login to get token
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: process.env.TEST_PHONE,
        password: process.env.TEST_PASSWORD
      })
    });
    
    const loginData = await loginResponse.json();
    token = loginData.access_token;
  });

  test('should get clients successfully', async () => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    expect(response.status).toBe(200);
    
    const clients = await response.json();
    expect(Array.isArray(clients)).toBe(true);
  });
});
```

## Common Patterns and Tips

### 1. Geographic Data Handling

```javascript
// Working with location data
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Find clients within radius
async function findClientsInRadius(userLat, userLon, radiusKm = 10) {
  const clients = await apiClient.request('/clients');
  
  return clients.filter(client => {
    if (!client.latitude || !client.longitude) return false;
    
    const distance = calculateDistance(
      userLat, userLon,
      client.latitude, client.longitude
    );
    
    return distance <= radiusKm;
  });
}
```

### 2. Date Handling

```javascript
// Consistent date handling
class DateHelper {
  static toApiFormat(date) {
    return date.toISOString();
  }

  static fromApiFormat(dateString) {
    return new Date(dateString);
  }

  static formatForDisplay(date, locale = 'en-US') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static getTodayRange() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString()
    };
  }
}
```

### 3. State Management Integration

```javascript
// Redux integration example
// actions/apiActions.js
export const fetchClients = () => async (dispatch, getState) => {
  dispatch({ type: 'FETCH_CLIENTS_START' });
  
  try {
    const { auth } = getState();
    const clients = await apiClient.makeRequest('/clients');
    
    dispatch({
      type: 'FETCH_CLIENTS_SUCCESS',
      payload: clients
    });
  } catch (error) {
    dispatch({
      type: 'FETCH_CLIENTS_ERROR',
      payload: error.message
    });
  }
};

// reducers/clientsReducer.js
const initialState = {
  data: [],
  loading: false,
  error: null
};

export default function clientsReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_CLIENTS_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_CLIENTS_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    
    case 'FETCH_CLIENTS_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    default:
      return state;
  }
}
```

## Environment Configuration

### Development Setup

```javascript
// config/api.js
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    timeout: 10000,
    retries: 3
  },
  staging: {
    apiUrl: 'https://staging-api.woosh.com/api',
    timeout: 15000,
    retries: 2
  },
  production: {
    apiUrl: 'https://api.woosh.com/api',
    timeout: 20000,
    retries: 1
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### Environment Variables

```bash
# .env file
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
```

## Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**
   - Ensure your domain is added to the CORS configuration
   - Check that you're using the correct protocol (http/https)

2. **Authentication Failures**
   - Verify phone number format matches the expected pattern
   - Check that the JWT token hasn't expired
   - Ensure the Authorization header is properly formatted

3. **File Upload Issues**
   - Don't set Content-Type header for FormData uploads
   - Check file size limits (10MB max)
   - Ensure file types are supported

4. **Geographic Data Problems**
   - Validate latitude/longitude ranges
   - Use proper decimal precision for coordinates
   - Handle cases where location data is unavailable

### Debug Mode

```javascript
// Enable debug logging
class DebugApiClient extends ApiClient {
  async makeRequest(endpoint, options = {}) {
    console.log(`🔍 API Request: ${options.method || 'GET'} ${endpoint}`);
    console.log('📤 Request options:', options);
    
    const startTime = Date.now();
    
    try {
      const result = await super.makeRequest(endpoint, options);
      const duration = Date.now() - startTime;
      
      console.log(`✅ API Success: ${endpoint} (${duration}ms)`);
      console.log('📥 Response:', result);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`❌ API Error: ${endpoint} (${duration}ms)`);
      console.error('💥 Error:', error);
      
      throw error;
    }
  }
}
```

## Support and Resources

- **API Documentation**: `API_DOCUMENTATION.md`
- **Postman Collection**: `Woosh_API.postman_collection.json`
- **Source Code**: Available in the `src/` directory
- **Database Schema**: See `mydb.sql` for complete schema

For additional support, refer to the source code or contact the development team.

---

*Integration Guide Version: 1.0.0*
*Last Updated: January 2024*