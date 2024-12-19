import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"
import { useGetLanguage } from '@/store/languageStore';
import { Tooltip } from 'react-tooltip'

export default function ProductOptions({ productVariations, productOptions, onOptionChange }) {

    const [selectedOptions, setSelectedOptions] = useState({})
    const [optionSelectedName, setOptionSelectedName] = useState({})
    const [enableDisable, setEnableDisable] = useState({});
    const stateClone = useRef({ quantity: 1, selectedOptions: {} });
    const { toast } = useToast();

    const LanguageKeys = useGetLanguage();
    const handleFileChange = (e, optionId) => {

    }
    /* Rejection Level Aggressiveness:
       Controls the behavior for enabling and disabling available variation options based on stock quantity and subtract settings.
       Set this value to 2 or 1 for a more flexible approach where more options remain enabled.
       Set this value to 0 for loose control, all options remain enabled, and just rejected on select. */

    const RejectionLevel = 2;

    const handleOptionChange = (optionId, value) => {
        let selectedOptionsCalc = {};
        let image = null;
        if (value.image) {
            image = value.image.replace(/-(\d+)x(\d+)(\.[a-zA-Z0-9]+)/, '-500x500$3');

        }
        selectedOptionsCalc = selectedOptions
        selectedOptionsCalc[optionId] = {
            valueId: value.product_option_value_id,
            name: value.name,
            option_id: optionId,
            stock: value.stock,
            subtract: value.subtract,
            pricePrefix: value.price_prefix,
            price: parseFloat(value.price.replace('$', ''))
        }

        // enable everything:
        setEnableDisable({});
        disableOutOfStock(); // disable those outofstock [that subtract stock] and out of variations

        if (RejectionLevel == 2) {
            Object.keys(selectedOptionsCalc).forEach((index) => {
                disableOutOfStockVariations(selectedOptionsCalc[index].valueId, value.product_option_value_id)
            });
        } else if (RejectionLevel == 1) {
            disableOutOfStockVariations(value.product_option_value_id, value.product_option_value_id)
        }



        // disable siblings of out of stock/subtract. variations
        let matchedVariation = findMatchingVariations(productVariations, selectedOptionsCalc); // get a fully matched variation, check for stock and trigger price change
        if (matchedVariation) {
            //  console.log(matchedVariation)
            if (matchedVariation.subtract == "1" && matchedVariation.quantity == "0") {
                // cancel users choise, unselect all
                toast({
                    variant: "destructive",
                    title: LanguageKeys['text_error'],
                    description: LanguageKeys['text_variation_out_of_stock'],
                    action: <ToastAction altText="{LanguageKeys['text_ok']}">{LanguageKeys['text_ok']}</ToastAction>,
                })
                setSelectedOptions({})
                return;
            }
        }
        setOptionSelectedName((prevState) => ({
            ...prevState,
            [optionId]: value.name
        }));

        setSelectedOptions((prevSelectedOptions) => ({
            ...prevSelectedOptions,
            [optionId]: {
                valueId: value.product_option_value_id,
                name: value.name,
                option_id: optionId,
                stock: value.stock,
                subtract: value.subtract,
                pricePrefix: value.price_prefix,
                price: parseFloat(value.price.replace('$', ''))
            }
        }));

        stateClone.current.selectedOptions = selectedOptionsCalc;
        if (typeof onOptionChange === "function") {
            onOptionChange(optionId, image, selectedOptionsCalc, matchedVariation);
        }

    }

    const getOptionType = (optionId) => {
        let option = productOptions.find((opt) => opt.product_option_id === optionId);
        return option ? option.type : null; // Returns the type or null if not found
    };
    useEffect(() => {
        if (productOptions.length > 0) {
            disableOutOfStock();
        }



        //console.log(productOptions)
    }, [productOptions]);


    function disableOutOfStockVariations(product_option_id, last_click_option_id) {
        let variations = optionInVariation(product_option_id);
        if (variations) {

            let disableSet = new Set();

            variations
                .filter(variation => variation.quantity === "0" && variation.subtract === "1")
                .flatMap(variation =>
                    variation.options.map(option => {
                        if (product_option_id !== option.product_option_id) {
                            disableSet.add(option.product_option_id);
                        }
                        return option.product_option_id;
                    })
                );
            variations
                .filter(variation => variation.quantity > 0)
                .flatMap(variation =>
                    variation.options.map(option => {
                        if (option.product_option_id === last_click_option_id) {
                            // Remove related option IDs from the Set if they match last_click_option_id
                            variation.options.forEach(relatedOption => {
                                disableSet.delete(relatedOption.product_option_id);
                            });
                        }
                        return option.product_option_id;
                    })
                );
            disableSet.forEach(optionId => {
                setEnableDisable(prevState => ({
                    ...prevState,
                    [optionId]: true,
                }));
            });
        }
    }
    // Disable out of stock products with stock subtract enabled 
    function disableOutOfStock() {
        productOptions.flatMap(option => {
            return option.product_option_value.filter(value => {

                if (selectableOptions(option.type) &&
                    value.subtract === "1" &&
                    value.stock === "0" &&
                    !optionInVariation(value.product_option_value_id)) {

                    setEnableDisable(prevState => ({
                        ...prevState,
                        [value.product_option_value_id]: true,
                    }));
                }

                return false;
            });
        });

    }
    // returns matching variations 
    function findMatchingVariations(variations, options) {

        const selectedOptionIds = new Set(Object.keys(options).map(option => options[option].valueId));


        for (const variationId in variations) {
            let variation = variations[variationId];
            let variationOptionIds = variation.options.map(opt => opt.product_option_id);
            let isMatch = variationOptionIds.every(optionId => selectedOptionIds.has(optionId));

            if (isMatch) {
                return variation;
            }
        }

        return false;
    }

    const selectableOptions = (type) => ["radio", "checkbox", "select"].includes(type);

    const optionInVariation = (option_value_id) => {

        let variations = Object.values(productVariations).filter(variation =>
            variation.options.some(option => option.product_option_id === option_value_id)
        );

        // Return the variations if found, otherwise return false
        return variations.length > 0 ? variations : false;
    };

    return (<>
        {productOptions.map((option) => (
            <div key={option.product_option_id} className="mb-6 ">
                <div className="flex items-center  ">
                    <h2 className="text-lg font-medium m-0">{option.name}:</h2>
                    <small
                        className="inline-block ml-2">{optionSelectedName[option.product_option_id]}</small>
                </div>


                <div className="flex flex-wrap sm:flex-nowrap space-x-2  mt-2">
                    {option.type === 'radio' && option.product_option_value.map((value) => (



                        <div data-tooltip-content={
                            enableDisable[value.product_option_value_id]
                                ? LanguageKeys['text_variation_out_of_stock']
                                : ""
                        } data-tooltip-id={`option-tooltip-${value.product_option_value_id}`} key={`option-key-${value.product_option_value_id}`}>
                            {/* Button for options with an image */}
                            {value.image && (
                                <Button

                                    disabled={enableDisable[value.product_option_value_id]}
                                    className={`
                              bg-gray-200 dark:bg-blue-900 mb-3 dark:hover:bg-blue-700
                              border border-gray-300 dark:border-gray-600 rounded-lg p-2 transition-all
                              hover:shadow-lg flex justify-center items-center w-16 h-16
                             ${selectedOptions[option.product_option_id]?.valueId === value.product_option_value_id
                                            ? "text-white bg-blue-500 "
                                            : "text-black dark:bg-gray-500"}
                              `}
                                    onClick={() => handleOptionChange(option.product_option_id, value)}
                                >
                                    <img
                                        src={value.image}
                                        alt={value.name}
                                        className="w-12 h-12 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                                    />

                                </Button>
                            )}

                            {/* Button for options without an image */}
                            {!value.image && (
                                <Button

                                    disabled={enableDisable[value.product_option_value_id]}
                                    className={`
                                bg-gray-200 dark:bg-blue-900 dark:hover:bg-blue-700
                                border border-gray-300 dark:border-gray-600 rounded-lg p-0 transition-all
                                hover:shadow-lg flex justify-center items-center h-8 
                                ${selectedOptions[option.product_option_id]?.valueId === value.product_option_value_id
                                            ? "text-white bg-blue-500 "
                                            : "text-black dark:bg-gray-500"}
                              `}
                                    onClick={() => handleOptionChange(option.product_option_id, value)}
                                >
                                    <span
                                        className="text-sm pr-4 pl-4"
                                    >
                                        {value.name}
                                    </span>

                                </Button >
                            )}
                            <Tooltip id={`option-tooltip-${value.product_option_value_id}`} />
                        </div>

                    ))}
                    {option.type === 'text' && (
                        <Input defaultValue="" type="text" className="bg-gray-200 dark:bg-gray-700 dark:text-white" />
                    )}
                    {option.type === 'textarea' && (
                        <Input defaultValue="" as="textarea" className="bg-gray-200 dark:bg-gray-700 dark:text-white" />
                    )}
                    {option.type === 'checkbox' && option.product_option_value.map((value) => (
                        <label key={value.product_option_value_id} className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={selectedOptions[option.product_option_id]?.valueId === value.product_option_value_id}
                                onChange={() => handleOptionChange(option.product_option_id, value)}
                                className="mr-2"
                            />
                            {value.image ? (
                                <img src={value.image} alt={value.name} className="w-12 h-12 object-cover" />
                            ) : (
                                value.name
                            )}
                        </label>
                    ))}
                    {option.type === 'file' && (
                        <input
                            type="file"
                            className="bg-gray-200 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
                            onChange={(e) => handleFileChange(e, option.product_option_id)}
                        />
                    )}
                </div>
            </div >
        ))
        }</>
    )
}
