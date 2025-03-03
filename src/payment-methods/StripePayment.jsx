// Unfinished and untested, this is a template for the component
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import { openDialog } from '@/store/slices/successCheckoutSlice';



const StripPayment = ({ payment }) => {
    const { billingDetails, paymentCode, actionUrl, locale, textPurchase, textSuccess } = payment;

    const [stripe, setStripe] = useState(null);
    const [elements, setElements] = useState(null);
    const [isButtonDisabled, setButtonDisabled] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingText, setLoadingText] = useState(textPurchase);
    const [completed, setCompleted] = useState({
        cardNumber: false,
        cardExpiry: false,
        cardCvc: false,
    });


    // LOAD public key here
    //const stripePromise = loadStripe('YOUR_PUBLIC_STRIPE_KEY');


    const dispatch = useDispatch();

    useEffect(() => {
        async function initializeStripe() {
            const stripeInstance = await stripePromise;
            setStripe(stripeInstance);
            setElements(stripeInstance.elements({ locale }));
        }
        initializeStripe();
    }, [locale]);

    const handleCardChange = (field, event) => {
        setCompleted((prev) => ({ ...prev, [field]: event.complete }));
        setButtonDisabled(!Object.values(completed).every((status) => status));
    };

    const handleServerResponse = async (response) => {
        if (response.error) {
            setErrorMessage(response.error);
        } else if (response.requires_action) {
            setLoadingText('Processing...');
            const { error } = await stripe.confirmCardPayment(response.payment_intent_client_secret);
            if (error) {
                setErrorMessage(error.message);
            } else {
                await submitPaymentIntent(response.payment_intent_client_secret);
            }
        } else if (response.success) {


            // Final payment success logic
            // Redirect to success end point route, and then Dispatch success dialog with the success message

            dispatch(openDialog({
                title: textSuccess,
                text_message: response.message,
            }));
        }
    };

    const submitPaymentIntent = async (clientSecret) => {
        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_intent_id: clientSecret }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();
            handleServerResponse(data);
        } catch (error) {
            console.error('Error submitting payment intent:', error.message);
        }
    };

    const handlePaymentSubmit = async () => {
        setLoadingText('Processing...');
        if (paymentCode !== 'stripe') {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_method_id: paymentCode }),
            }).then((res) => res.json());
            handleServerResponse(response.data);
        } else {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardNumberElement),
                billing_details: billingDetails,
            });

            if (error) {
                setErrorMessage(error.message);
                setLoadingText(textPurchase);
            } else {
                const response = await fetch(actionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ payment_method_id: paymentMethod.id }),
                }).then((res) => res.json());
                handleServerResponse(response.data);
            }
        }
    };

    return (
        <Elements stripe={stripe}>
            <div className="credit-card-box">
                <div className="panel-heading">
                    <h3>Credit Card Payment</h3>
                </div>
                {paymentCode !== 'stripe' && (
                    <small className="text-info">Test Mode is Active</small>
                )}
                <div className="panel-body">
                    <div id="card-errors" className="payment-errors">
                        {errorMessage}
                    </div>
                    {paymentCode === 'stripe' && (
                        <form>
                            <div>
                                <label>CARD NUMBER</label>
                                <CardNumberElement
                                    className="form-control"
                                    onChange={(e) => handleCardChange('cardNumber', e)}
                                />
                            </div>
                            <div>
                                <label>EXPIRY DATE</label>
                                <CardExpiryElement
                                    className="form-control"
                                    onChange={(e) => handleCardChange('cardExpiry', e)}
                                />
                            </div>
                            <div>
                                <label>CV CODE</label>
                                <CardCvcElement
                                    className="form-control"
                                    onChange={(e) => handleCardChange('cardCvc', e)}
                                />
                            </div>
                        </form>
                    )}
                    <button
                        disabled={isButtonDisabled}
                        onClick={handlePaymentSubmit}
                        className="btn btn-success btn-lg btn-block"
                    >
                        {loadingText}
                    </button>
                </div>
            </div>
        </Elements>
    );
};

export default StripPayment;
