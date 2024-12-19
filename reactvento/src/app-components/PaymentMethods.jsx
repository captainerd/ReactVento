import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import apiRequest from '../lib/apiRequest';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton"


import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const PaymentMethods = forwardRef(({ langValues, methods, loading, onToast, onTotals, agreeCheckOut }, ref) => {
    const [paymentMethods, setPaymentMethods] = useState(null);
    const [shippingMethods, setShippingMethods] = useState(null);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);


    useImperativeHandle(ref, () => ({
        saveMethods() {
            if (selectedPaymentMethod != null || selectedShippingMethod != null) {
                saveSelection(selectedPaymentMethod, selectedShippingMethod);
            }
        }
    }));


    useEffect(() => {


        setPaymentMethods(methods?.payment_methods);
        setShippingMethods(methods?.shipping_methods);
        saveSelection();
    }, [methods]);

    const handlePaymentMethodClick = async (code) => {
        if (selectedPaymentMethod !== code) {
            setSelectedPaymentMethod(code);
            // Send POST request to save the selected payment method
            await saveSelection(code, selectedShippingMethod);
        }
    };

    const handleShippingMethodClick = async (code) => {
        if (selectedShippingMethod !== code) {
            setSelectedShippingMethod(code);
            // Send POST request to save the selected shipping method
            await saveSelection(selectedPaymentMethod, code);
        }
    };

    const saveSelection = async (paymentMethod, shippingMethod) => {

        if (paymentMethod != null || shippingMethod != null)
            try {
                const formData = new FormData();
                formData.append('shipping_method', shippingMethod);
                formData.append('payment_method', paymentMethod);

                const response = await apiRequest(`${window.siteUrl}/index.php?route=checkout/shipping_payment_methods.save&agree_checkout=${agreeCheckOut}`, {
                    method: 'POST',
                    body: formData,
                });
                let data = await response.json();

                if (data.error && typeof onToast == "function") {
                    if (selectedPaymentMethod != null && selectedShippingMethod != null) {
                        onToast({ variant: 'destructive', msg: data.error });
                    }
                }
                if (data.success && typeof onToast == "function") {
                    onToast({ variant: 'default', msg: data.success });
                }
                if (data.totals && typeof onTotals == "function") {
                    onTotals(data.totals);
                }
                if (!response.ok) {
                    throw new Error('Failed to save selection');
                }

                console.log('Selection saved successfully');
            } catch (err) {
                console.error('Error saving selection:', err);
            }
    };

    useEffect(() => {
        if (paymentMethods) {
            for (const key in paymentMethods) {
                const method = paymentMethods[key];
                for (const optionKey in method.option) {
                    const option = method.option[optionKey];
                    if (option.checked) {
                        setSelectedPaymentMethod(option.code);
                    }
                }
            }
        }
        if (shippingMethods) {
            for (const key in shippingMethods) {
                const method = shippingMethods[key];
                for (const quoteKey in method.quote) {
                    const quote = method.quote[quoteKey];
                    if (quote.checked) {
                        setSelectedShippingMethod(quote.code);
                    }
                }
            }
        }
    }, [paymentMethods, shippingMethods]);
    if (loading) {
        return (
            <div className="w-full">
                <div className="flex mb-5 flex-col bt-4 space-y-3">
                    <Skeleton className="h-[125px] w-full rounded-xl" />

                </div>
                <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-full rounded-xl" />

                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Payment Methods Card */}
            {methods?.error_payment ? <>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md dark:shadow-gray-800 flex items-center space-x-2">
                    <AlertTriangle className="text-yellow-500 dark:text-yellow-400 h-6 w-6" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {methods?.error_payment}
                    </h3>
                </div>

            </> :
                <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800 dark:text-gray-100">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">{langValues?.text_payment_method}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paymentMethods && Object.keys(paymentMethods).map((key) => {
                            const method = paymentMethods[key];
                            return (
                                <div key={key}>
                                    {/* Loop through the `option` object of each payment method */}
                                    {Object.keys(method.option).map((optionKey) => {
                                        const option = method.option[optionKey];
                                        return (
                                            <div key={optionKey} className="flex items-center space-x-2 mb-2">
                                                <Switch
                                                    id={`payment-switch-${option.code}`}  // Unique ID for the switch
                                                    checked={selectedPaymentMethod === option.code}
                                                    onClick={() => handlePaymentMethodClick(option.code)}
                                                />
                                                <Label htmlFor={`payment-switch-${option.code}`}>
                                                    {option.name}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>}

            {/* Shipping Methods Card */}
            {methods?.error_shipping ? <>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md dark:shadow-gray-800 flex items-center space-x-2">
                    <AlertTriangle className="text-yellow-500 dark:text-yellow-400 h-6 w-6" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {methods?.error_shipping}
                    </h3>
                </div>

            </> :
                <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow  dark:bg-gray-800 dark:text-gray-100">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">{langValues?.text_shipping_method}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {shippingMethods && Object.keys(shippingMethods).map((key) => {
                            const method = shippingMethods[key];
                            return (
                                <div key={key}>
                                    {/* Loop through the `quote` object of each shipping method */}
                                    {Object.keys(method.quote).map((quoteKey) => {
                                        const quote = method.quote[quoteKey];
                                        return (
                                            <div key={quoteKey} className="flex items-center space-x-2 mb-2">
                                                <Switch
                                                    id={`shipping-switch-${quote.code}`}  // Unique ID for the switch
                                                    checked={selectedShippingMethod === quote.code}
                                                    onClick={() => handleShippingMethodClick(quote.code)}
                                                />
                                                <Label htmlFor={`shipping-switch-${quote.code}`}>
                                                    {quote.name} - {quote.text}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>}
        </div>



    );
});

export default PaymentMethods;
