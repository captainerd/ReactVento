 # ReactJs + Vite

This is a Vite-powered frontend for VentoCart, built with ReactJS, Redux Toolkit, and TailwindCSS.

**Note**: This project is still a work in progress and requires refactoring to align with the changes introduced in VentoCart v5.0.0.1 which broke compatibility, specifically how we handle the API.

### Current Features:
- Fully operational homepage
- Hero-Banners
- Product thumbnails
- Product page
- Cart functionality
- Basic category listing

### API Integration (VentoCart v5.0.0.1+):
Starting with VentoCart v5 and beyond, we use a dedicated controller to transform data from interactions with controllers into API-consumable JSON.

The API endpoint is located under `/api/`, e.g., `route=api/home`. To understand how the API works, refer to the following controller:  
[https://github.com/captainerd/VentoCart/blob/main/upload/catalog/controller/api/home.php](/controller/api/home.php).

### Authentication:
Since VentoCart is headless and does not rely on conventional cookies for mobile app compatibility, all API requests must include the `apitoken` parameter, e.g., `?apitoken=xxx`.

The `apitoken` is a base64-encoded JSON string containing two keys:
- `sessionId`
- `expires`

To refresh the session, set the client token to `"refresh"`, which signals the server to issue a new session. 

For more details, refer to the `apiRequest.js` file in the ReactJS project:  
`src/lib/apiRequest.js`.

---

