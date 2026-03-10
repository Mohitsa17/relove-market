import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { router } from '@inertiajs/react';

export const CheckoutForm = ({
    total,
    setActiveStep,
    paymentMethod,
    onPaymentSuccess,
    onPaymentError,
    list_product,
    subtotal,
    shipping
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial address details
    const [addressDetails, setAddressDetails] = useState({
        name: '',
        phone: '',
        address_line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'MY' // default
    });

    const handleAddressChange = (e) => {
        setAddressDetails({
            ...addressDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) return;
        
        // Basic validation
        if (!addressDetails.name || !addressDetails.address_line1 || !addressDetails.city || !addressDetails.postal_code) {
            onPaymentError("Please fill in all required shipping address fields.");
            return;
        }

        setIsProcessing(true);
        setActiveStep(2); // Processing

        try {
            // 1. Validate stocks
            await axios.post('/validate-stock', { items: list_product });

            // 2. Create Payment Intent
            const { data: intentData } = await axios.post('/create-payment-intent', {
                amount: total,
                items: list_product,
                shipping_address: addressDetails
            });

            // 3. Confirm card payment
            const result = await stripe.confirmCardPayment(intentData.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: addressDetails.name,
                        phone: addressDetails.phone,
                        address: {
                            line1: addressDetails.address_line1,
                            city: addressDetails.city,
                            state: addressDetails.state,
                            postal_code: addressDetails.postal_code,
                            country: addressDetails.country
                        }
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            // 4. Confirm Payment on backend
            const { data: confirmData } = await axios.post('/confirm-payment', {
                paymentIntentId: result.paymentIntent.id,
                items: list_product,
                shipping_address: addressDetails,
                subtotal,
                shipping,
                total
            });

            if (confirmData.success) {
                onPaymentSuccess(confirmData.order);
            } else {
                throw new Error(confirmData.message || "Failed to confirm order.");
            }

        } catch (error) {
            console.error("Payment error:", error);
            onPaymentError(error.response?.data?.message || error.message || "An error occurred during payment.");
            setActiveStep(1); // Revert step on error
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Shipping Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text" name="name" required value={addressDetails.name} onChange={handleAddressChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="text" name="phone" value={addressDetails.phone} onChange={handleAddressChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3" placeholder="+60 123456789" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                        <input type="text" name="address_line1" required value={addressDetails.address_line1} onChange={handleAddressChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3" placeholder="Street Address" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input type="text" name="city" required value={addressDetails.city} onChange={handleAddressChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3" placeholder="City" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input type="text" name="state" value={addressDetails.state} onChange={handleAddressChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3" placeholder="State/Province" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                        <input type="text" name="postal_code" required value={addressDetails.postal_code} onChange={handleAddressChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3" placeholder="Zip/Postal Code" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select name="country" value={addressDetails.country} onChange={handleAddressChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3">
                            <option value="MY">Malaysia</option>
                            <option value="SG">Singapore</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Credit Card Information</h3>
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }} />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {isProcessing ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    `Pay RM ${total.toFixed(2)}`
                )}
            </button>
        </form>
    );
};
