Selah Backend Development Report: Airbnb-style Application
1. Introduction
The purpose of this project is to develop a backend server for an Airbnb-style web application. The backend provides RESTful APIs for:
User management (registration and login)

Listing management (CRUD operations)

TourPlace management (CRUD operations for tourist places)

Authentication and authorization are implemented using JWT (JSON Web Tokens), and data is stored in a MongoDB database.

2. Objectives
Design a secure and scalable backend architecture using Node.js and Express.

Implement user authentication (register and login) with password hashing.

Implement CRUD operations for Listings and TourPlaces:

Create, Read (all and single), Update, Delete.

Protect certain routes using JWT so that only authorized users can modify their own listings or tour places.

Provide clear documentation and test cases for all routes.


3. Technology Stack
Layer
Technology / Tool
Runtime Environment
Node.js
Framework
Express.js
Database
MongoDB (Mongoose ODM)
Authentication
JWT (jsonwebtoken)
Password Security
bcryptjs
Environment Config
dotenv
Testing
Postman / cURL / Supertest (optional)

4. Folder Structure
backend/
│
├── config/
│   └── db.js                # MongoDB connection
│
├── controllers/
│   ├── listingController.js # Listing CRUD logic
│   ├── userController.js    # User registration/login logic
│   └── tourPlaceController.js # TourPlace CRUD logic
│
├── models/
│   ├── Listing.js           # Listing schema
│   ├── User.js              # User schema
│   └── TourPlace.js         # TourPlace schema
│
├── routes/
│   ├── listingRoutes.js     # Listing endpoints
│   ├── userRoutes.js        # User endpoints
│   └── tourPlaceRoutes.js   # TourPlace endpoints
│
├── middleware/
│   └── authMiddleware.js    # JWT authentication
│
├── .env                     # Environment variables
└── server.js                # Entry point


5. Implementation Details
5.1 Database Connection
MongoDB is connected using Mongoose.

Environment variables store sensitive data like connection URI and JWT secret.

5.2 Models
User Model
Fields: name, email, password

Passwords are hashed using bcrypt before saving.

Listing Model
Fields: title, location, price, imageUrl, description, host (reference to User)

host ensures updates and deletes are allowed only by the listing creator.

TourPlace Model
Fields: name, state, city, description, imageUrl


5.3 Controllers
User Controller
registerUser → Creates a new user.

loginUser → Authenticates and returns a JWT token.

Listing Controller
getListings → Returns all listings (public).

getListingById → Returns a single listing.

createListing → Adds a listing (protected, sets host).

updateListing → Updates a listing (protected, host only).

deleteListing → Deletes a listing (protected, host only).

TourPlace Controller
getTourPlaces → Returns all tour places (public).

getTourPlaceById → Returns a single tour place.

createTourPlace → Adds a tour place (protected).

updateTourPlace → Updates a tour place (protected).

deleteTourPlace → Deletes a tour place (protected, uses .deleteOne() instead of deprecated .remove()).


5.4 Routes
User Routes: /api/users/register, /api/users/login

Listing Routes: /api/listings (GET, POST), /api/listings/:id (GET, PUT, DELETE)

TourPlace Routes: /api/tourplaces (GET, POST), /api/tourplaces/:id (GET, PUT, DELETE)


5.5 Middleware
authMiddleware.js verifies JWT tokens and attaches the authenticated user to req.user.

Used in protected routes (create, update, delete listings and tour places).


6. API Documentation
Endpoint
Method
Auth
Description
/api/users/register
POST
❌
Register new user
/api/users/login
POST
❌
Login and get JWT token
/api/listings
GET
❌
Get all listings
/api/listings/:id
GET
❌
Get single listing
/api/listings
POST
✅
Create new listing
/api/listings/:id
PUT
✅
Update listing (host only)
/api/listings/:id
DELETE
✅
Delete listing (host only)
/api/tourplaces
GET
❌
Get all tour places
/api/tourplaces/:id
GET
❌
Get single tour place
/api/tourplaces
POST
✅
Create new tour place
/api/tourplaces/:id
PUT
✅
Update tour place
/api/tourplaces/:id
DELETE
✅
Delete tour place

7. Testing (with Examples)
7.1 User Registration & Login
Register User
POST /api/users/register
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123"
}

Response
{
  "id": "6738a2c6e3f9b4...",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "token": "<JWT_TOKEN>"
}

Login User
POST /api/users/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}

Response
{
  "user": {
    "id": "6738a2c6e3f9b4...",
    "name": "Alice Johnson",
    "email": "alice@example.com"
  },
  "token": "<JWT_TOKEN>"
}

Copy this token for all protected routes.

7.2 Listings (Protected Routes)
Create Listing
POST /api/listings
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Modern Loft Apartment",
  "location": "New York City",
  "price": 350,
  "imageUrl": "https://example.com/loft.jpg",
  "description": "Stylish loft in Manhattan"
}

Update Listing
PUT /api/listings/<listingId>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "price": 420,
  "description": "Updated luxury loft with rooftop view"
}

Delete Listing
DELETE /api/listings/<listingId>
Authorization: Bearer <JWT_TOKEN>

Get All Listings
GET /api/listings


7.3 TourPlaces
Create TourPlace (Protected)
POST /api/tourplaces
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Eiffel Tower",
  "state": "Île-de-France",
  "city": "Paris",
  "description": "Iconic landmark",
  "imageUrl": "https://example.com/eiffel.jpg"
}

Update TourPlace
PUT /api/tourplaces/<tourPlaceId>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "description": "Famous tourist attraction in Paris"
}

Delete TourPlace
DELETE /api/tourplaces/<tourPlaceId>
Authorization: Bearer <JWT_TOKEN>

Get All TourPlaces
GET /api/tourplaces

Get Single TourPlace
GET /api/tourplaces/<tourPlaceId>


7.4 Verified Error Handling
Listings & TourPlaces:
Update without token → 401 Unauthorized

Delete not owned or non-existing → 401 Unauthorized or 404 Not Found

Update non-existing listing/tour place → 404 Not Found


8. Challenges & Solutions
Challenge
Solution
listing.host undefined → update/delete fail
Ensure host is set when creating a listing; safety checks in controller
JWT token handling for protected routes
Implement authMiddleware and Authorization: Bearer <token> headers
MongoDB connection errors
Added error handling in db.js and environment variables
.remove() deprecated in Mongoose
Replaced with .deleteOne() for document deletion

9. Conclusion
The backend now provides a secure and functional API for an Airbnb-style application:
Users can register, login, and receive JWT tokens.

Listings can be created, read, updated, and deleted with proper authentication and authorization.

TourPlaces can be created, updated, and deleted (protected) and retrieved publicly.

Error handling ensures unauthorized or invalid operations are safely rejected.

The backend is ready to integrate with a frontend application (React, Vue, etc.) and supports Postman testing for all routes.

