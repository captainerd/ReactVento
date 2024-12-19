import React, { useState, useEffect, useRef } from 'react';
import apiRequest from '@/lib/apiRequest';
import ComboSelect from '@/app-components/ComboSelect';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select"; // Adjust this import as needed
export default function AddressesPage({ data }) {
    const [countries, setCountries] = useState([]);
    const [zones, setZones] = useState([]);
    const [zoneId, setZoneId] = useState(0)
    const [editDisabled, setEditDisabled] = useState(true);
    const [formFields, setFormFields] = useState({
        firstname: '',
        lastname: '',
        company: '',
        address_1: '',
        address_id: '',
        country_id: '',
        zone_id: '',
        phone: '',
        postcode: '',
        city: '',
        default: false,
    });
    let postForm = useRef({});
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [langValues, setLangValues] = useState({});
    const [addresses, setAddresses] = useState([]);
    const fetchData = async () => {
        try {
            const response = await apiRequest(`${window.siteUrl}/?route=account/address`, {
                method: 'GET',
            });
            if (response.ok) {
                const result = await response.json();
                setCountries(result.countries);
                setLangValues(result.lang_values);
                setAddresses(result.list);
                setEditDisabled(true);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    useEffect(() => {

        fetchData();
    }, []);

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
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleInputChange = (field, value) => {

        if (field === "default") {
            value = value ? "1" : "0";
            setFormFields((prev) => ({
                ...prev,
                [field]: value,
            }));

        }

        postForm.current[field] = value;


    };

    const handleCountryChange = (value) => {
        postForm.current.country_id = value.value;
        postForm.current.zone_id = -1;
        setFormFields(postForm.current);

        setZoneId(-1)
        loadZones(value.value);      // Load zones for the new country_id
    };

    const handleZoneChange = (value) => {
        setZoneId(value.value)

    };

    const handleSave = (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        console.log(postForm.current)
        postForm.current.country_id = formFields.country_id
        postForm.current.zone_id = zoneId;
        postForm.current.address_id = formFields.address_id
        const form = new FormData();
        Object.keys(postForm.current).forEach((key) => {
            form.append(key, postForm.current[key]);
        });
        setFormFields(postForm.current)
        // Create a POST request using the FormData object

        let urlPost = `${window.siteUrl}/?route=account/address.save&address_id=${postForm.current.address_id}`;
        if (postForm.current.address_id === -1) {
            urlPost = `${window.siteUrl}/?route=account/address.save`;
        }
        apiRequest(urlPost, {
            method: 'POST',
            body: form,
        })
            .then((response) => {
                if (response.ok) {
                    let data = response.json();
                    if (data.success) {
                        setShowForm(false)
                        fetchData();

                    }

                    if (data.error || data.warning) {
                        let msg = data.error ? data.error : data.warning;

                        msg = (typeof msg === 'object' && !Array.isArray(msg)) ? Object.values(msg)[0] : undefined;


                        toast({
                            variant: "destructive",
                            title: msg,

                            action: <ToastAction altText="{langValues['text_ok']}">{langValues['text_ok']}</ToastAction>,
                        })

                    }
                } else {
                    throw new Error('Failed to save address');
                }
            })
            .then((result) => {
                console.log('Save successful:', result);
            })
            .catch((error) => {
                console.error('Error saving address:', error);
            });
    };


    function FormInput({ id, label, value, onChange }) {
        return (
            <div className="mb-4">
                <Label htmlFor={id} className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                    {label}
                </Label>
                <Input
                    id={id}
                    label={label}
                    defaultValue={value}
                    onChange={onChange}
                />
            </div>
        );
    }
    const handleAddressChange = (value) => {

        const selectedAddress = Object.values(addresses).find((address) => address.address_id === value);
        //state breaks balls
        let la = selectedAddress.zone_id;
        setTimeout(() => {
            setZoneId(la)
        }, 500);
        postForm.current = selectedAddress;
        postForm.current.zone_id = selectedAddress.zone_id;
        setFormFields(selectedAddress);



        setEditDisabled(false);

    }
    const deleteAddress = () => {
        apiRequest(`${window.siteUrl}/?route=account/address.delete&address_id=${formFields.address_id}`, {
            method: 'GET',

        })
            .then((response) => {
                if (response.ok) {

                    let data = response.json();
                    if (data.success) {
                        toast({
                            variant: "default",
                            title: data.success,

                            action: <ToastAction altText="{langValues['text_ok']}">{langValues['text_ok']}</ToastAction>,
                        })
                        fetchData();
                    }
                    if (data.error || data.warning) {
                        let msg = data.error ? data.error : data.warning
                        toast({
                            variant: "destructive",
                            title: msg,

                            action: <ToastAction altText="{langValues['text_ok']}">{langValues['text_ok']}</ToastAction>,
                        })
                        fetchData();
                    }



                } else {
                    throw new Error('Failed to save address');
                }
            })
            .then((result) => {
                console.log('Save successful:', result);
            })
            .catch((error) => {
                console.error('Error saving address:', error);
            });

    }

    const editAddress = () => {
        setShowForm(true)

    }
    const newAddress = () => {
        // empty old data
        postForm.current = {};
        setFormFields({});

        //set a zero address id
        setFormFields((prev) => ({
            ...prev,
            address_id: -1,
        }));
        postForm.current.address_id = -1;

        setShowForm(true)


    }
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">{langValues.text_address_book || 'Address Book Entries'}</h2>
                {Object.values(addresses).length > 0 ? (
                    <Select
                        onValueChange={(value) => handleAddressChange(value)}
                    >
                        <SelectTrigger className="w-full px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 dark:text-gray-300">
                            <SelectValue placeholder={langValues.text_select_address || 'Select an address'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {Object.values(addresses).map((address, index) => (
                                    <SelectItem
                                        key={address.address_id || index} // Unique key, fallback to index if necessary
                                        value={address.address_id}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                                    >
                                        {`${address.firstname} ${address.lastname}, ${address.address_1}, ${address.city}`}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                ) : (
                    <p>{langValues.text_no_results || 'You have no addresses in your account.'}</p>
                )}


                <div className="flex space-x-4">
                    <button
                        onClick={editAddress}
                        disabled={editDisabled}
                        className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-800 dark:hover:bg-blue-900 dark:focus:ring-blue-600 ${editDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {langValues.text_address_edit}
                    </button>
                    {/* Add Button */}
                    <button onClick={newAddress} className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-800 dark:hover:bg-green-900 dark:focus:ring-green-600">
                        {langValues.text_address_add}
                    </button>

                    {/* Delete Button */}
                    <button
                        disabled={editDisabled}
                        onClick={deleteAddress}
                        className={`px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-800 dark:hover:bg-red-900 dark:focus:ring-red-600 ${editDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {langValues.text_address_delete}
                    </button>
                </div>
            </div>
            <div className={`${!showForm ? "hidden" : " mt-4 p-4"}`}>
                <FormInput
                    id="firstname-addresses"
                    label={langValues.entry_firstname || 'First Name'}
                    value={formFields.firstname}
                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                />

                <FormInput
                    id="lastname-addresses"
                    label={langValues.entry_lastname || 'Last Name'}
                    value={formFields.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                />

                <FormInput
                    id="company-addresses"
                    label={langValues.entry_company || 'Company'}
                    value={formFields.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                />

                <FormInput
                    id="address_1-addresses"
                    label={langValues.entry_address_1 || 'Address 1'}
                    value={formFields.address_1}
                    onChange={(e) => handleInputChange('address_1', e.target.value)}
                />

                <FormInput
                    id="phone-addresses"
                    label={langValues.entry_phone || 'Phone'}
                    value={formFields.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                />

                <FormInput
                    id="postcode-addresses"
                    label={langValues.entry_postcode || 'Post Code'}
                    value={formFields.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                />

                <FormInput
                    id="city-addresses"
                    label={langValues.entry_city || 'City'}
                    value={formFields.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                />


                <div className="mb-4">
                    <Label htmlFor="country-addresses" className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                        {langValues.entry_country || 'Country'}:
                    </Label>
                    <ComboSelect
                        id="country-addresses"
                        className="w-full border-gray-300 p-2"
                        name="Country"
                        selected={formFields.country_id}
                        onChange={(e) => handleCountryChange(e)}
                        values={countries.map((country) => ({
                            value: country.country_id,
                            label: country.name,
                        }))}
                    />
                </div>

                <div className="mb-4">
                    <Label htmlFor="zone-addresses" className="block font-medium dark:text-gray-100 text-gray-600 mb-2">
                        {langValues.entry_zone || 'Region / State'}:
                    </Label>
                    <ComboSelect
                        id="zone-addresses"
                        className="w-full border-gray-300 p-2"
                        name="Zone"
                        selected={zoneId}
                        onChange={(e) => handleZoneChange(e)}
                        values={zones}
                    />
                </div>

                <div className="flex items-center mb-4 space-x-2">
                    <input
                        type="checkbox"
                        id="defaultAddress-addresses"
                        defaultChecked={formFields.default === "1" ? true : false}
                        onClick={(e) => handleInputChange('default', e.target.checked)}
                    />
                    <Label htmlFor="defaultAddress-addresses">{langValues.entry_default || 'Default Address'}</Label>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                    {langValues.text_save || 'Save Address'}
                </button>

            </div>

        </div>

    );
}