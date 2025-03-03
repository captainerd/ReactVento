import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { ShoppingCart } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { removeItemFromCart, clearCartApi, loadCartApi, selectState, setCartState } from "@/store/slices/cartSlice";
import { useGetLanguage } from '@/store/languageStore';
import { Tooltip } from 'react-tooltip';
import { useToast } from "@/components/ui/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { Link } from 'react-router-dom';
import config from '@/config';

const CartButton = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const isOpen = useSelector(selectState);
    const cartItems = useSelector((state) => state.cart.items);
    const totals = useSelector((state) => state.cart.totals);
    const LanguageKeys = useGetLanguage();

    const handleReload = () => {
        dispatch(loadCartApi())
    }

    const setNewState = (e) => {
        dispatch(setCartState(e))
    }

    useEffect(() => {

        dispatch(loadCartApi());
    }, []);


    const handleRemoveItem = async (itemId) => {
        let result = await dispatch(removeItemFromCart(itemId));
        if (result) {

            toast({
                variant: "default",
                title: LanguageKeys['text_success'],
                description: result,
                action: <ToastAction altText="{LanguageKeys['text_ok']}">{LanguageKeys['text_ok']}</ToastAction>,
            });
        }

    };





    const handleClearCart = () => {
        dispatch(clearCartApi());
        toast({
            variant: "default",
            title: LanguageKeys['text_success'],
            description: "Cart cleared successfully",
            action: <ToastAction altText="{LanguageKeys['text_ok']}">{LanguageKeys['text_ok']}</ToastAction>,
        });
    };

    return (
        <div>
            {/* Trigger button */}
            <Sheet open={isOpen} onOpenChange={setNewState}>
                <SheetTrigger
                    variant="ghost"
                    size="icon"
                    className="inline-flex text-gray-500 dark:text-gray-400 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-full"
                >
                    <ShoppingCart size={18} />
                </SheetTrigger>

                {/* Sheet content */}
                <SheetContent side="right" className="w-80 p-4 overflow-y-auto bg-gray-100 dark:bg-gray-800">
                    <SheetDescription className="md:hidden" />
                    <SheetTitle className="text-gray-900 dark:text-gray-100">Shopping Cart</SheetTitle>
                    <div className="relative right-10">
                        {cartItems.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
                        ) : (
                            <ul className="mt-4" style={{ width: '314px' }}>
                                {cartItems.map((item, index) => (
                                    <li key={index} className="items-center justify-between p-2  mb-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <div className="flex   ">
                                            <div className="relative flex items-center" data-tooltip-id={"my-tooltip-" + index} data-tooltip-content={item.name}>
                                                <img src={config.apiUrl + item.thumb} alt={item.name} className="w-8 h-8 object-cover rounded mr-2" />
                                                <Tooltip id={"my-tooltip-" + index} />
                                                {/* Badge for quantity */}

                                                <span style={{ maxWidth: '220px' }} className="text-sm font-medium truncate text-gray-800 dark:text-gray-100">

                                                    <span className="text-gray-600 dark:text-gray-200  text-xs"> x {item.quantity}</span> {item.name}</span>

                                            </div>
                                            <div className="flex items-center gap-4 ml-auto">

                                                <Button
                                                    onClick={() => handleRemoveItem(item.cart_id)}
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-600"
                                                >
                                                    <span className="text-xs">✕</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <span className="text-xs dark:text-gray-200 text-gray-700  dark:text-gray-300"> [ {item.price} ]</span>
                                        {item.options.map((option, index) => (
                                            <React.Fragment key={index}>
                                                <span className="text-gray-600 dark:text-gray-200  text-xs">   {option.name}: {option.value}</span>
                                            </React.Fragment>
                                        ))}

                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Display Totals */}
                        {cartItems.length > 0 && totals.length > 0 && (
                            <div className="mt-4 ml-5">
                                <ul>
                                    {totals.map((total, index) => (
                                        <li key={index} style={{ width: '280px' }} className="flex border-b hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 border-b-gray-300 justify-between py-1">
                                            <span className="font-semibold text-xs text-gray-600 dark:text-gray-100">{total.title}</span>
                                            <span className="text-gray-600 text-xs dark:text-gray-300">{total.text}</span>
                                        </li>
                                    ))}
                                </ul>
                                {/* Clear Cart Button */}
                                <div className="mt-4 flex ml-10 gap-2">
                                    <Button
                                        onClick={handleClearCart}
                                        variant="destructive"
                                        className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                                    >
                                        Clear Cart
                                    </Button>
                                    <Link to="/checkout"  >
                                        <Button
                                            onClick={(e) => setNewState(false)}
                                            variant="success"
                                            className="w-full bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                                        >
                                            Checkout
                                        </Button> </Link>


                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
            <Toaster />
            {/* Badge */}
            {cartItems.length > 0 && (
                <span style={{ right: '76px' }} className="absolute top-1   bg-red-500 text-white text-xs font-bold px-1 rounded-full">
                    {cartItems.length}
                </span>
            )}

        </div>
    );

};

export default CartButton;
