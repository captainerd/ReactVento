import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,

    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,

} from "@/components/ui/alert-dialog";


function DynamicAlertDialog({ title, description, onClose }) {
    // Local state to control the dialog open/close state
    const [open, setOpen] = useState(true);
    const handleClose = () => {

        // setOpen(false)
        if (typeof onClose === "function") {
            onClose();
        }
    }
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => handleClose()}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DynamicAlertDialog;
