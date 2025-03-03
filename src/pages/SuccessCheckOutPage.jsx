// components/SuccessCheckoutPage.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { closeDialog, selectSuccess } from '@/store/slices/successCheckoutSlice';
import { loadCartApi } from "@/store/slices/cartSlice";

import { useNavigate } from 'react-router-dom';

function SuccessCheckoutPage() {
    const dispatch = useDispatch();
    const { showDialog, dialogMessage } = useSelector(selectSuccess);
    const navigate = useNavigate();
    const handleCloseDialog = async () => {
        await dispatch(closeDialog());
        navigate('/');
        dispatch(loadCartApi()); // the cart should be empty, refresh from server
    };

    useEffect(() => {
        if (showDialog) {

        }
    }, [showDialog]);

    return (
        <AlertDialog open={showDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialogMessage.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {/* Render raw HTML safely */}
                        <span dangerouslySetInnerHTML={{ __html: dialogMessage.text_message }} />
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleCloseDialog}>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default SuccessCheckoutPage;
