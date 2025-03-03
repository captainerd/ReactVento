import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Navigation from './app-components/Menu';
import { Provider } from 'react-redux';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductCategoryPage from './pages/ProductCategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import config from './config';
import store from './store/store';
import apiRequest from '@/lib/apiRequest';
import AddressesPage from './pages/AddressesPage';


function App() {
  const [homeData, setHomedata] = useState([]);

  const params = useParams();


  useEffect(() => {

    if (Object.keys(params).length > 0) return;
    const fetchData = async () => {
      try {
        const response = await apiRequest(`${config.apiUrl}/?route=api/home`, {
          method: "GET",
        });

        // Parse JSON if the response is expected to be JSON
        if (response.ok) {
          const data = await response.json();
          console.log(data)

          setHomedata(data);

          // set Language Values


        } else {
          console.error("API request failed with status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    homeData && homeData.header && homeData.header.menu ? (
      <Provider store={store}>

        <Router>
          <>
            <Navigation headerData={homeData.header} menuData={homeData.header.menu.categories} />
            <Routes>
              <Route
                path="/"
                element={<HomePage data={homeData} />}
              />
              <Route
                path="/"
                element={<HomePage data={homeData} />}
              />
              <Route
                path="/product/:productId/:name"
                element={<ProductPage />}
              />
              <Route path="/category/:path" element={<ProductCategoryPage />} />
              <Route
                path="/checkout"
                element={<CheckoutPage />}
              />
              <Route
                path="/Addresses"
                element={<AddressesPage />}
              />
            </Routes>
          </>
        </Router>
      </Provider>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 w-full h-full border-4 border-t-transparent border-orange-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    )
  );
}
export default App;
