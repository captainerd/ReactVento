import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { Label } from "@/components/ui/label";
import ComboSelect from '@/app-components/ComboSelect';
import apiRequest from '@/lib/apiRequest';
import CheckoutTotals from '@/app-components/CheckoutTotals';
import { Switch } from "@/components/ui/switch"
import { Button } from '@/components/ui/button';
import { extractLinks } from '@/lib/utils';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from "@/components/ui/hooks/use-toast";
import { fromHtmlEntities } from '@/lib/utils';
import { ToastAction } from "@/components/ui/toast"
import PaymentMethods from '@/app-components/PaymentMethods';
import SuccessCheckoutPage from './SuccessCheckOutPage';
import { selectUserData } from "@/store/slices/userInfoSlice"
import { useSelector } from 'react-redux';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import AddressesPage from './AddressesPage';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,

} from "@/components/ui/select"


export default function CheckOutGuestPage({ data }) {
    const [formFields, setFormFields] = useState({});

    const [formTypes, setFormTypes] = useState([{ prefix: 'payment' }]);
    const [countries, setCountries] = useState({});
    const [disableGuest, setdisableGuest] = useState(false);
    const [loading, setLoading] = useState(true);
    const [zones, setZones] = useState({});
    const [langValues, setLangValues] = useState({});
    const [checkoutData, setCheckoutData] = useState({
        products: [],
        totals: [],
        methods: {},
        payment: {},
    });
    const [totals, setTotals] = useState({});

    const linkData = extractLinks(checkoutData?.register?.text_agree)[0];
    const linkDataCheckout = extractLinks(checkoutData?.text_agree_checkout)[0];
    const [Component, setComponent] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const { toast } = useToast();
    const methodsRef = React.useRef();
    const userInfo = useSelector(selectUserData);
    let selectedTypePost = 'payment';
    let selectedAddressPost = '';

    const allowedKeys = [
        "account",
        "agree",            // register terms
        "agree_checkout",   // checkout terms
        "password",
        "customer_group_id",
        "payment_firstname",
        "payment_lastname",
        "payment_email",
        "account_custom_field",
        "payment_company",
        "payment_address_1",
        "payment_phone",
        "payment_postcode",
        "payment_city",
        "payment_country_id",
        "payment_zone_id",
        "payment_custom_field",
        "address_match",
    ];
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Function to toggle the dialog state
    const toggleDialog = () => {
        if (isDialogOpen) {
            fetchOrderData();
        }
        setIsDialogOpen(!isDialogOpen);
    };
    const handleChange = async (prefix, field, value) => {

        if (field == "country_id") {
            let pcode = await loadZones(value.value);

            if (getFieldValue(prefix, 'phone').length < 5) {
                handleChange(prefix, 'phone', "+" + pcode);

            }
        }
        if (prefix.length > 0) {
            setFormFields((prev) => ({
                ...prev,
                [`${prefix}_${field}`]: value,
            }));
        } else {
            setFormFields((prev) => ({
                ...prev,
                [`${field}`]: value,
            }));

        }
    };
    const toggleShippingAddress = () => {
        setFormTypes((prev) =>
            prev.some((type) => type.prefix === 'shipping')
                ? prev.filter((type) => type.prefix !== 'shipping') // Remove 'shipping'
                : [...prev, { prefix: 'shipping' }] // Add 'shipping'
        );
    };

    useEffect(() => {
        fetchOrderData();

        // console.log(checkoutData.products);
    }, []);

    // Toast messages from childs, to avoid imports.
    const handleOnToast = (e) => {
        toast({
            variant: e.variant,
            title: e.msg,

            action: <ToastAction altText="{langValues['text_ok']}">{langValues['text_ok']}</ToastAction>,
        })

        if (e.variant == "default") {

            // AutoSave the address/information form
            handlePost(true);
        }


    }
    const handlePost = async (ingnorePayment = false) => {

        if (userInfo.loggedIn) {
            handlePostAccount(ingnorePayment)

        } else {
            handlePostGuest(ingnorePayment)

        }
    }

    const handlePostAccount = async (ingnorePayment = false) => {

        // If there is no a selected address id, and not a type(shipping/paymnet) and also the call is not comming 
        // from the "methods" component (ignorePayment is true), we just reload the orderdata.
        if (!selectedAddressPost || !selectedTypePost || ingnorePayment) {
            fetchOrderData();
            console.log('returning.. ' + selectedTypePost + ' ' + selectedAddressPost)
            return;
        }
        setLoading(true);
        try {
            // Otherwise, we set the adress id and type and after we will reload order data.
            const response = await apiRequest(`${window.siteUrl}/?route=checkout/address.address&address_id=${selectedAddressPost}&address_type=${selectedTypePost}`, {
                method: 'GET',

            });
            let data = await response.json();
            if (data?.error) {


                toast({
                    variant: "destructive",
                    title: fromHtmlEntities(data.error),

                    action: <ToastAction altText="{langValues['text_ok']}">{langValues['text_ok']}</ToastAction>,
                })
                setFormFields((prev) => ({
                    ...prev,
                    errors: {
                        ...data.error,
                    }
                }));
            } if (data.success) {

                toast({
                    variant: "default",
                    title: data.success,

                    action: <ToastAction altText="{langValues['text_ok']}">{langValues['text_ok']}</ToastAction>,
                })

                if (!ingnorePayment && methodsRef.current) {

                    methodsRef.current.saveMethods();
                }
                // refetch order data for new address


            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
        fetchOrderData();
        setLoading(false);

    }
    const handlePostGuest = async (ingnorePayment = false) => {
        // Convert formFields to a FormData object
        const formData = new FormData();

        let hasShipping = formTypes.some((type) => type.prefix === 'shipping');

        if (!hasShipping) {
            formData.append('address_match', '1')
        }
        ['account', 'agree', 'agree_checkout'].forEach(field => {
            if (!formFields[field]) {
                formFields[field] = ''; // Server expects !isset()
            }
        });


        const extendedAllowedKeys = new Set(
            allowedKeys.flatMap(key =>
                key.startsWith("payment_")
                    ? [key, key.replace("payment_", "shipping_")]
                    : key
            )
        );

        Object.entries(formFields).forEach(([key, value]) => {

            if (extendedAllowedKeys.has(key)) {

                if (key.endsWith("_zone_id") || key.endsWith("_country_id")) {
                    value = value.value;
                }
                if (value !== undefined) {
                    formData.append(key, value);
                }
            }
        });
        setLoading(true);
        try {
            const response = await apiRequest(`${window.siteUrl}/?route=checkout/register.save`, {
                method: 'POST',
                body: formData,
            });
            let data = await response.json();
            if (data?.error) {

                let firstKey = Object.keys(data.error)[0];
                toast({
                    variant: "destructive",
                    title: fromHtmlEntities(data.error[firstKey]),

                    action: <ToastAction altText="{langValues['text_ok']}">{langValues['text_ok']}</ToastAction>,
                })
                setFormFields((prev) => ({
                    ...prev,
                    errors: {
                        ...data.error,
                    }
                }));
            } if (data.success) {

                toast({
                    variant: "default",
                    title: data.success,

                    action: <ToastAction altText="{langValues['text_ok']}">{langValues['text_ok']}</ToastAction>,
                })



                if (data.methods) {


                    setCheckoutData((prev) => ({
                        ...prev,
                        methods: data.methods,

                    }));
                    setTotals(data.totals);
                }
                if (!ingnorePayment && methodsRef.current) {

                    methodsRef.current.saveMethods();
                }
                if (data.payment) {

                    handlePaymentComponent(data.payment);
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
        setLoading(false);
    };


    const handlePaymentComponent = async (data) => {

        if (data.component) {
            try {

                setCheckoutData((prev) => ({
                    ...prev,
                    payment: data,

                }));

                const module = await import(`../payment-methods/${data.component}`);
                setComponent(() => module.default);
            } catch (error) {
                console.error("Error loading component:", error);
                setComponent(() => () => <div>Component could not be loaded</div>);
            }
        } else {
            setComponent(null)
        }
    };



    const loadZones = async (country_id) => {
        try {
            let response = await apiRequest(`${window.siteUrl}/?route=localisation/country&country_id=${country_id}`, {
                method: 'GET',
            });
            if (response.ok) {
                let data = await response.json();

                setZones(Object.values(data.zone).map(item => ({
                    value: item.zone_id,
                    label: item.name,

                })));
                return data.phone_code;

            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const fetchOrderData = async () => {

        setLoading(true);
        try {
            const response = await apiRequest(`${window.siteUrl}/?route=checkout/confirm.confirm`, {
                method: 'GET',
            });
            if (response.ok) {
                const data = await response.json();
                setFormFields(data.register)
                setCheckoutData(data);

                setLangValues(data.lang_values);
                setTotals(data.totals);
                if (data.payment) {

                    handlePaymentComponent(data.payment);
                }

                if (!checkoutData.register?.config_checkout_guest || (data && data.register && parseInt(data.register.account) === 1)) {

                    // Pre-Checkbox checkings
                    setFormFields((prev) => ({
                        ...prev,
                        newsletter: true,
                        agree: true, // agree for register terms
                        agree_checkout: true, // agree checkout to pre-check for checkout terms
                        account: true, // Turn account to false if you want "guest checkout" checked by default
                    }));

                    setdisableGuest(true);
                }
                data?.register?.countries && setCountries(Object.values(data.register.countries).map(item => ({
                    value: item.country_id,
                    label: item.name,
                    phone_code: item.phone_code,
                })));
            } else {
                console.error('Failed to load order data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching order data:', error);
        }
        setLoading(false);
    };
    function getFieldValue(prefix, field) {
        return formFields[`${prefix}_${field}`] || '';
    }





    function getFieldError(prefix, fieldName) {
        const errorField = prefix ? `${prefix}_${fieldName}` : fieldName;

        return formFields?.errors?.[errorField] ?? false;
    }
    function handleAddressChange(value, perfix) {
        setSelectedAddress(value)

        selectedAddressPost = value;
        selectedTypePost = perfix;
        handlePost();
    }

    useEffect(() => {
        if (checkoutData.address) {
            const defaultAddress = Object.values(checkoutData.address)
                .find((value) => parseInt(value.default) === 1);

            if (defaultAddress) {
                // Check if the new address ID is different from the current selected one
                if (selectedAddress !== defaultAddress.address_id) {
                    setSelectedAddress(defaultAddress.address_id);
                    setTimeout(() => {
                        handlePost(); // set to the server the selected address for the order
                    }, 600);

                }
            }
        }
    }, [checkoutData.address, selectedAddress]);



    const handleDialogChange = (open) => {
        if (!open) {

            fetchOrderData();
        }
        setIsDialogOpen(open);
    };





    // Return form for logged in Users
    if (userInfo.loggedIn) {
        return (
            <div className="container mx-auto p-6 max-w-6xl dark:bg-gray-900 dark:text-gray-100 shadow">
                <div className="flex flex-wrap">
                    <div className="w-full sm:w-1/2 p-4  ">


                        <h1 className="text-2xl font-semibold mb-6  ">
                            {langValues.heading_title}

                        </h1>
                        <div>


                            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                                <DialogTrigger asChild>
                                    <Button variant="outline"> {langValues.text_edit_addresses}</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[625px] max-h-[100%] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>  {langValues.text_addresses}</DialogTitle>
                                        <DialogDescription>
                                            {langValues.text_addresses_view}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <AddressesPage /> {/* Render the AddressesPage component here */}
                                    <DialogFooter>
                                        <Button onClick={toggleDialog} type="button">
                                            Close
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {formTypes.map(({ prefix }) => (
                            <div key={prefix} className="bg-white mb-4 mt-4 dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {langValues[`text_${prefix}_address`]}
                                </h3>
                                <Select
                                    value={selectedAddress}
                                    onValueChange={(value) => handleAddressChange(value, prefix)}
                                >
                                    <SelectTrigger className="w-full px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 dark:text-gray-300">
                                        <SelectValue placeholder={langValues[`text_${prefix}_address`]} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {checkoutData.address &&
                                                Object.values(checkoutData.address).map((value, index) => (

                                                    <SelectItem
                                                        key={index}
                                                        value={value.address_id}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                                                    >
                                                        {value.firstname}, {value.lastname}, {value.address_1}, {value.city}
                                                    </SelectItem>

                                                ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                        <div className="flex flex-col gap-4">



                            {checkoutData?.text_agree_checkout && linkDataCheckout && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="agreeCheckout"
                                        checked={formFields.agree_checkout}
                                        onClick={() => setFormFields((prev) => ({ ...prev, agree_checkout: !prev.agree_checkout }))}
                                    />
                                    <Label htmlFor="agreeCheckout">
                                        {linkDataCheckout.text} <a href={linkDataCheckout.url}>{linkDataCheckout.linktext}</a>
                                    </Label>
                                </div>
                            )}


                            <div className="flex items-center mb-4 space-x-2">
                                <Checkbox
                                    id="shipping-different"
                                    checked={formTypes.some((type) => type.prefix === 'shipping')}
                                    onClick={(e) => toggleShippingAddress()}
                                />
                                <Label htmlFor="shipping-different">{langValues.entry_match}</Label>
                            </div>
                        </div>


                    </div>
                    <div className="w-full sm:w-1/2 p-4  ">
                        <h1 className="text-2xl font-semibold mb-6">

                            {langValues?.payment_method?.text_options}

                        </h1>
                        <PaymentMethods agreeCheckOut={formFields.agree_checkout} onTotals={(e) => setTotals(e)} onToast={(e) => handleOnToast(e)} ref={methodsRef} loading={loading} methods={checkoutData.methods} langValues={langValues?.payment_method} />
                    </div>
                </div>
                <CheckoutTotals loading={loading} totals={totals} products={checkoutData.products} />
                {Component}
                <div className="dynamic-component-container mb-4 mt-4">
                    {Component && <Component payment={checkoutData.payment} />}
                </div>
                <SuccessCheckoutPage />

            </div>

        );



    }









    // This will be returned to Guests
    return (
        <div className="container mx-auto p-6 max-w-6xl dark:bg-gray-900 dark:text-gray-100 shadow">
            <div className="flex flex-wrap">
                <div className="w-full sm:w-1/2 p-4  ">


                    <h1 className="text-2xl font-semibold mb-6  ">
                        {formFields.account ? langValues.text_register : langValues.text_guest}

                    </h1>

                    {formTypes.map(({ prefix }) => (
                        <div key={prefix} className="border mb-4 rounded-lg p-4  dark:border-gray-500  ">
                            <h2 className="text-lg font-medium  mb-4  ">

                                {prefix == "payment" ? langValues.text_payment_address : langValues.text_shipping_address}

                            </h2>

                            {prefix === "payment" && checkoutData.register?.config_checkout_guest && disableGuest && (
                                <div className="flex items-center mb-3 space-x-2">
                                    <Switch
                                        id="register"

                                        checked={formFields.account}
                                        onClick={() => setFormFields((prev) => ({ ...prev, account: !prev.account }))}
                                    />
                                    <Label htmlFor="register">{langValues.text_register}</Label>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                <div>
                                    <Label htmlFor={prefix + "_email"} className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                                        {langValues.entry_email}:
                                    </Label>
                                    <Input
                                        className={`border ${getFieldError(prefix, 'email') ? 'border-red-500' : 'border-gray-300'} focus:ring ${getFieldError(prefix, 'email') ? 'focus:ring-red-500' : 'focus:ring-blue-500'} p-2 w-full`}
                                        placeholder="Email"
                                        id={prefix + "_email"}
                                        value={getFieldValue(prefix, 'email')}
                                        onChange={(e) => handleChange(prefix, 'email', e.target.value)}
                                    />
                                </div>

                                {/* Password */}
                                {prefix === "payment" && formFields.account == true && (
                                    <div>
                                        <Label htmlFor="password" className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                                            {langValues.entry_password}:
                                        </Label>
                                        <PasswordInput
                                            className={`border ${getFieldError('', 'password') ? 'border-red-500' : 'border-gray-300'} focus:ring ${getFieldError('', 'password') ? 'focus:ring-red-500' : 'focus:ring-blue-500'} p-2 w-full`}
                                            placeholder="Password"
                                            id="password"

                                            value={formFields['password'] || ''}
                                            onChange={(e) => handleChange('', 'password', e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Firstname */}
                                <div>
                                    <Label htmlFor={prefix + "_firstname"} className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                                        {langValues.entry_firstname || "Firstname"}:
                                    </Label>
                                    <Input
                                        className={`border ${getFieldError(prefix, 'firstname') ? 'border-red-500' : 'border-gray-300'} focus:ring ${getFieldError(prefix, 'firstname') ? 'focus:ring-red-500' : 'focus:ring-blue-500'} p-2 w-full`}
                                        placeholder="Firstname"
                                        id={prefix + "_firstname"}
                                        value={getFieldValue(prefix, 'firstname')}
                                        onChange={(e) => handleChange(prefix, 'firstname', e.target.value)}
                                    />
                                </div>

                                {/* Lastname */}
                                <div>
                                    <Label htmlFor={prefix + "_lastname"} className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                                        {langValues.entry_lastname || "Lastname"}:
                                    </Label>
                                    <Input
                                        className={`border ${getFieldError(prefix, 'lastname') ? 'border-red-500' : 'border-gray-300'} focus:ring ${getFieldError(prefix, 'lastname') ? 'focus:ring-red-500' : 'focus:ring-blue-500'} p-2 w-full`}
                                        placeholder="Lastname"
                                        id={prefix + "_lastname"}
                                        value={getFieldValue(prefix, 'lastname')}
                                        onChange={(e) => handleChange(prefix, 'lastname', e.target.value)}
                                    />
                                </div>

                                {/* Company */}
                                {checkoutData.register?.config_show_company_field === "1" && (
                                    <div>
                                        <Label htmlFor={prefix + "_company"} className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                                            {langValues.entry_company || "Company"}:
                                        </Label>
                                        <Input
                                            className={`border ${getFieldError(prefix, 'company') ? 'border-red-500' : 'border-gray-300'} focus:ring ${getFieldError(prefix, 'company') ? 'focus:ring-red-500' : 'focus:ring-blue-500'} p-2 w-full`}
                                            placeholder="Company"
                                            id={prefix + "_company"}
                                            value={getFieldValue(prefix, 'company')}
                                            onChange={(e) => handleChange(prefix, 'company', e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Country */}
                                <div>
                                    <Label htmlFor={prefix + "_country"} className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                                        {langValues.entry_country || "Country"}:
                                    </Label>
                                    <ComboSelect
                                        className={`border ${getFieldError(prefix, 'country') ? 'border-red-500' : 'border-gray-300'} focus:ring ${getFieldError(prefix, 'country') ? 'focus:ring-red-500' : 'focus:ring-blue-500'} p-2 w-full`}
                                        name="Country"
                                        selected={getFieldValue(prefix, 'country_id')}
                                        onChange={(value) => handleChange(prefix, 'country_id', value)}
                                        values={countries}
                                    />
                                </div>

                                {/* Zone */}
                                <div>
                                    <Label htmlFor={prefix + "_zone"} className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                                        {langValues.entry_zone || "Zone"}:
                                    </Label>
                                    <ComboSelect
                                        className={`border ${getFieldError(prefix, 'zone') ? 'border-red-500' : 'border-gray-300'} focus:ring ${getFieldError(prefix, 'zone') ? 'focus:ring-red-500' : 'focus:ring-blue-500'} p-2 w-full`}
                                        name="Zone"
                                        selected={getFieldValue(prefix, 'zone_id')}
                                        onChange={(value) => handleChange(prefix, 'zone_id', value)}
                                        values={zones}
                                    />
                                </div>

                                {/* Address Fields */}
                                {['address_1', 'city', 'postcode', 'phone'].map((field) => (
                                    <div key={field}>
                                        <Label htmlFor={prefix + "_" + field} className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                                            {field.replace('_', ' ').replace(/(?:^\w|\s\w)/g, (match) => match.toUpperCase())}:
                                        </Label>
                                        <Input
                                            className={`border ${getFieldError(prefix, field) ? 'border-red-500' : 'border-gray-300'} focus:ring ${getFieldError(prefix, field) ? 'focus:ring-red-500' : 'focus:ring-blue-500'} p-2 w-full`}
                                            placeholder={field.replace('_', ' ').replace(/(?:^\w|\s\w)/g, (match) => match.toUpperCase())}
                                            id={prefix + "_" + field}
                                            value={getFieldValue(prefix, field)}
                                            onChange={(e) => handleChange(prefix, field, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}

                    {/* Newsletter, Agree, and Shipping Address Checkboxes */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="newsletter"

                                checked={formFields.newsletter}
                                onClick={() => setFormFields((prev) => ({ ...prev, newsletter: !prev.newsletter }))}
                            />
                            <Label htmlFor="newsletter"> {checkoutData?.register?.entry_newsletter}</Label>
                        </div>

                        {formFields.account && checkoutData?.register?.text_agree && linkData && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="agree"
                                    checked={formFields.agree}
                                    onClick={() => setFormFields((prev) => ({ ...prev, agree: !prev.agree }))}
                                />
                                <Label htmlFor="agree">
                                    {linkData.text} <a href={linkData.url}>{linkData.linktext}</a>
                                </Label>
                            </div>
                        )}
                        {checkoutData?.text_agree_checkout && linkDataCheckout && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="agreeCheckout"
                                    checked={formFields.agree_checkout}
                                    onClick={() => setFormFields((prev) => ({ ...prev, agree_checkout: !prev.agree_checkout }))}
                                />
                                <Label htmlFor="agreeCheckout">
                                    {linkDataCheckout.text} <a href={linkDataCheckout.url}>{linkDataCheckout.linktext}</a>
                                </Label>
                            </div>
                        )}


                        <div className="flex items-center mb-4 space-x-2">
                            <Checkbox
                                id="shipping-different"
                                checked={formTypes.some((type) => type.prefix === 'shipping')}
                                onClick={(e) => toggleShippingAddress()}
                            />
                            <Label htmlFor="shipping-different">{langValues.entry_match}</Label>
                        </div>
                    </div>
                    <button onClick={handlePost} className=" px-20 bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                        {checkoutData?.lang_values?.text_save}
                    </button>

                </div>
                <div className="w-full sm:w-1/2 p-4  ">
                    <h1 className="text-2xl font-semibold mb-6">

                        {langValues?.payment_method?.text_options}

                    </h1>
                    <PaymentMethods agreeCheckOut={formFields.agree_checkout} onTotals={(e) => setTotals(e)} onToast={(e) => handleOnToast(e)} ref={methodsRef} loading={loading} methods={checkoutData.methods} langValues={langValues?.payment_method} />
                </div>
            </div>
            <CheckoutTotals loading={loading} totals={totals} products={checkoutData.products} />

            <div className="dynamic-component-container mb-4 mt-4">
                {Component && <Component payment={checkoutData.payment} />}
            </div>
            <SuccessCheckoutPage />

        </div>
    );

}
