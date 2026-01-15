
# RideCompare - Principal Architecture & Design

RideCompare is a high-performance ride aggregation platform designed for the Indian mobility market. It allows users to compare and **book** rides directly from Uber, Ola, and Rapido without app redirection.

## 1. System Architecture

The application follows a **Modular Micro-Frontend** pattern on the client and a **Service-Oriented Architecture (SOA)** on the backend.

- **Frontend (Mobile-First React):** Built with React 19, Tailwind CSS, and Gemini-AI for intelligence. Uses a glassmorphic, iOS-inspired design system.
- **Backend (Simulated FastAPI):** Orchestrates multi-provider logic, payment intents, and ride state.
- **AI Layer (Gemini-3-Flash):** Provides market insights, surge prediction, and a conversational booking assistant.

## 2. Booking Flow Sequence (Logic)

1. **Discovery:** User selects pickup/drop. Aggregator fetches real-time estimates.
2. **Intent:** User selects a specific ride. App creates a `BookingIntent` in the backend.
3. **Payment Authorization:** Integrated with a Payment Gateway (Stripe/Razorpay). Funds are authorized but not yet captured.
4. **Provider Handshake:** Backend sends a booking request to the provider (Uber/Ola/Rapido API).
5. **Confirmation:** Provider returns `driver_id`, `vehicle_details`, and `otp`.
6. **Capture:** Once confirmed, payment is captured.
7. **Lifecycle:** App polls or listens (WebSockets) for status updates: `ARRIVING` -> `ON_TRIP` -> `COMPLETED`.

## 3. Database Schema Updates

### Table: `bookings`
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `provider`: Enum (Uber, Ola, Rapido)
- `status`: Enum (Confirmed, Arriving, OnTrip, Completed, Cancelled)
- `price`: Decimal
- `otp`: String
- `pickup_lat/lng`: Point
- `drop_lat/lng`: Point
- `driver_info`: JSONB (name, vehicle, rating)

### Table: `transactions`
- `id`: UUID (Primary Key)
- `booking_id`: UUID (FK to bookings)
- `status`: Enum (Pending, Authorized, Captured, Failed)
- `gateway_ref`: String (External ID)

## 4. Legal & Compliance Notes

- **API Usage:** Direct booking relies on official Provider Partner APIs. If APIs are revoked, the app falls back to **Mode 3: Redirection**.
- **Data Privacy:** GDPR/DPDP compliant. Geolocation is used only for active ride matching and is not stored long-term without consent.
- **PCI DSS:** All payment info is tokenized at the gateway. The backend never stores raw CVV/Card numbers.

## 5. Future Scalability

- **Multi-Tenancy:** Expanding to support regional providers (e.g., Namma Yatri).
- **Batch Processing:** AI surge analysis using historical Redis data.
- **Caching:** Using Redis to cache estimates for identical routes (TTL: 30s).
