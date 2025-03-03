// src/store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
import apiRequest from '@/lib/apiRequest';
import config from '@/config';
const initialState = {
    items: [], // Array to hold cart items
    totals: [], // Array to hold totals
    isOpen: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartState: (state, action) => {

            state.isOpen = action.payload;
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        removeItem: (state, action) => {
            // Action expects a `cart_id`
            state.items = state.items.filter(item => item.cart_id !== action.payload.cart_id);
        },
        clearCart: (state) => {
            state.items = [];
        },
        loadCart: (state, action) => {
            // Add items from API response
            action.payload.products.forEach(product => {
                state.items.push({
                    cart_id: product.cart_id,
                    name: product.name,
                    model: product.model,
                    options: product.option,
                    quantity: product.quantity,
                    minimum: product.minimum,
                    price: product.price,
                    total: product.total,
                    thumb: product.thumb,
                });
            });
            // Add totals from API response
            if (action.payload.totals) {
                state.totals = action.payload.totals;
            }
        }

    },
});

export const { addItem, removeItem, clearCart, loadCart, setCartState } = cartSlice.actions;
export const selectState = (state) => state.cart.isOpen;
// Thunk for loading cart data from the API
export const loadCartApi = () => async dispatch => {
    try {
        const response = await apiRequest(`${config.apiUrl}/?route=api/home.getCartInfo`, {
            method: 'GET',
        });
        if (response.ok) {
            const data = await response.json();
            dispatch(clearCart());
            dispatch(loadCart(data)); // Dispatch `loadCart` action with API data
        } else {
            console.error('Error fetching cart:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
export const clearCartApi = () => async dispatch => {
    try {
        const response = await apiRequest(`${config.apiUrl}/?route=common/cart.clearCart&api=true`, {
            method: 'GET',
        });
        if (response.ok) {
            const data = await response.json();
            if (data.status == 'ok') {
                dispatch(clearCart());
            }

        } else {
            console.error('Error clear cart:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
export const addToCart = (product, quantity, options) => async dispatch => {
    // Prepare basket form to post
    const basketItem = {
        product_id: product.product_id,
        quantity: quantity,
    };

    const option = {};
    Object.values(options).forEach(opt => {
        option[`option[${opt.option_id}]`] = opt.valueId;
    });
    const finalBasket = {
        ...basketItem,
        ...option,
    };

    try {
        const response = await apiRequest(`${config.apiUrl}/?route=checkout/cart.add&api=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(finalBasket).toString(),
        });

        const data = await response.json();

        if (data.success) {
            // Reload the cart to reflect changes

            dispatch(loadCartApi());
            return { success: true, message: data.success || 'Item added to cart successfully.' };
        } else {
            return { success: false, message: data.message || data.error || 'Error Cart' };
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, message: 'An error occurred while adding the item to the cart.' };
    }
};


// Thunk for removing an item by `cart_id` through API
export const removeItemFromCart = (cart_id) => async dispatch => {
    try {
        const formData = new URLSearchParams();
        formData.append('key', cart_id);

        const response = await apiRequest(
            `${config.apiUrl}/index.php?route=common/cart.removeProduct&api=true`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            }
        );

        const data = await response.json();
        if (data.success) {
            dispatch(removeItem({ cart_id }));
            dispatch(fetchCart());
            return data.success
        } else {

            console.error('Error removing item:', data.message || 'Unknown error');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


export default cartSlice.reducer;
