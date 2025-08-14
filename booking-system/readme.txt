User Registration:

Method: POST
URL: http://localhost:3000/api/auth/register

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "strongpassword123"
}


User Login:
Method: POST
URL: http://localhost:3000/api/auth/login


{
  "email": "john.doe@example.com",
  "password": "strongpassword123"
}

Expected Response: A JSON object containing a token. You will need to use this token for authenticated requests.


Create a Booking (Requires Authentication):
Method: POST

URL: http://localhost:3000/api/bookings

Headers: Authorization: Bearer <your_jwt_token> (replace <your_jwt_token> with the token from the login response)


{
  "resource_name": "Meeting Room A",
  "start_time": "2025-08-05T14:00:00Z",
  "end_time": "2025-08-05T15:00:00Z"
}



Get Your Bookings (Requires Authentication):
Method: GET

URL: http://localhost:3000/api/bookings

Headers: Authorization: Bearer <your_jwt_token>


{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "strongpassword123"
}
user 1 token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1NDM4NTk5OCwiZXhwIjoxNzU0Mzg5NTk4fQ.X6QhjyyWm3NbJLFF_EUQ42eYpXyqnpQnWCXaig3DwSw