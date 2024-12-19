import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


const OptionFilter = ({ data, onReaction }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const handleCheckboxChange = (optionId) => {
        let updatedSelectedOptions = [...selectedOptions];
        if (updatedSelectedOptions.includes(optionId)) {
            updatedSelectedOptions = updatedSelectedOptions.filter((id) => id !== optionId);
        } else {
            updatedSelectedOptions.push(optionId);
        }

        setSelectedOptions(updatedSelectedOptions);


        let params = new URLSearchParams(searchParams.toString());
        params.delete('filter_option[]');
        updatedSelectedOptions.forEach((id) => params.append('filter_option[]', id));


        onReaction({ 'category': params.toString() });


    };

    return (

        <div className="flex flex-col   min-w-[300px]">
            {data.filter_options.map((optionSet, index) => (
                <div
                    key={index}
                    className="bg-white shadow-lg mb-3 mt-3 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                >
                    {optionSet.map((option, idx) => (
                        <div
                            key={option.option_id}
                            className={`flex items-center justify-between   border-b last:border-b-0 border-gray-200 dark:border-gray-700 ${option.option_n === '-1' && idx === 0 ? 'rounded-t-lg bg-gray-100 dark:bg-gray-700' : ''
                                }`}
                        >
                            {option.option_n === '-1' ? ( // Title header at the top of the card
                                <div className="w-full  py-0 px-2 text-gray-800 dark:text-gray-200 font-semibold flex items-center">
                                    <i className="fa-solid fa-list-alt text-gray-600 dark:text-gray-300 mr-2"></i>
                                    <strong className="text-lg p-3">{option.name}</strong>
                                </div>
                            ) : (

                                <Label
                                    htmlFor={`input-option-filter-${option.option_id}`}
                                    className="flex hover:bg-gray-200 dark:hover:bg-gray-700 py-4 px-4 items-center space-x-2 text-gray-800 dark:text-gray-200 w-full"
                                >
                                    <Checkbox
                                        type="checkbox"
                                        name="filter_option[]"
                                        value={option.option_id}
                                        id={`input-option-filter-${option.option_id}`}
                                        className="form-check-input mr-2"
                                        checked={selectedOptions.includes(option.option_id)}
                                        onClick={() => handleCheckboxChange(option.option_id)}
                                    />

                                    {option.image && (
                                        <img
                                            src={`${window.siteUrl}/index.php?route=product/product.getImage&image=${option.image}&width=20&height=20`}
                                            alt="Option Image"
                                            className="rounded-full"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    )}
                                    <span className="font-medium">{option.name}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        ({option.product_count})
                                    </span>
                                </Label>

                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>



    );
};

export default OptionFilter;
