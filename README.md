# VentoCart React Frontend Rect+Vite

[Live demo](https://demo.ventocart.com/reactjs/)


This project is a React.js frontend for the VentoCart project, utilizing a headless API to manage e-commerce functionalities. The frontend is built with the following technologies:

- **React.js**: The core JavaScript library for building the user interface.
- **Tailwind CSS**: For utility-first styling.
- **Shadcn/ui**: For UI components to maintain consistency across the app.
- **Redux**: Used for state management, specifically for updating the cart and handling language values across the app.

## Features

The entire application is powered by the VentoCart API, meaning all content (including language-specific text and the layout of modules) is dynamically fed by the backend. The layout of modules (e.g., banners, newest products, etc.) is configurable via the backend, allowing the admin to control the order in which content is displayed on the frontend.

### Completed Sections

- **Products**: Displaying product listings pulled from the VentoCart API.
- **Categories**: Dynamic product category rendering based on API data.
- **Checkout**: Full checkout functionality, including the ability to:
  - Log in and register
  - Checkout as a guest
  - Select shipping methods
  - Retrieve saved client addresses
  - Handle payment methods (currently only **Payment by Bank** is implemented)
  
- **Session Management**: For managing login states, user sessions, and cart persistence.

### Remaining Work

- **Regular Registration Page**: Currently, registration is handled through the checkout process, but a dedicated registration page is still in progress.
- **Account Panel**: The user account panel, where users can manage their details, is also in development.

### How It Works

1. **Headless API Integration**: Everything, from product data to language values, is fed by the VentoCart API.
2. **Dynamic Layout**: The order of modules (e.g., banner, products, etc.) is determined by the backend admin configuration, so the frontend dynamically renders the content in the correct order.
3. **State Management with Redux**: We use Redux for handling global state, particularly for the cart and language values. This ensures a smooth user experience with data consistency.

## Setup Instructions



### 1. Clone the repository

### Edit `index.html` to switch the URL:

```html
<script>
  window.siteUrl = "https://demo.ventocart.com";
</script>

-----------------------------------------------------------

```bash
git clone https://github.com/your-repo/ventocart-react.git
cd reactvento
npm install
npm run dev



