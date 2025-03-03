// Finished and tested*
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import apiRequest from '@/lib/apiRequest';
import { openDialog } from '@/store/slices/successCheckoutSlice';

function BankPayment({ payment }) {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();


    const handleClick = async () => {
        setLoading(true);
        try {
            const response = await apiRequest(`${window.siteUrl}/?route=${payment?.route}`);
            const data = await response.json();
            if (data.error) {
                // Handle error here if needed
            }

            if (data.success) {
                const successResponse = await apiRequest(`${window.siteUrl}/?route=checkout/success`);
                const successData = await successResponse.json();
                // Dispatch the action to show the success dialog
                dispatch(openDialog({
                    title: successData.title,
                    text_message: successData.text_message
                }));

            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <fieldset className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{payment?.lang_values?.text_instruction}</h3>
            <p className="mb-4"><b>{payment?.lang_values?.text_description}</b></p>
            <div className="border rounded p-3 mb-4">
                <p>{payment?.bank}</p>
                <p>{payment?.lang_values?.text_payment}</p><br />
                <p>{payment?.lang_values?.text_bank_deposit} {payment.order_id}</p>
            </div>
            <div className="text-end">
                <Button
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                    type="button"
                    onClick={handleClick}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Confirm Payment'}
                </Button>
            </div>
        </fieldset>
    );
}

export default BankPayment;
