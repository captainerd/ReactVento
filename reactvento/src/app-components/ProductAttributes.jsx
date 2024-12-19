import React from 'react';

const ProductAttributes = ({ product }) => {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Top Section */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-1 dark:text-white">{product.lang_values['tab_attribute']}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300  ">
                    <span className="font-semibold">{product.lang_values['text_sku']}:</span> {product.sku}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300  ">
                    <span className="font-semibold">{product.lang_values['text_stock']}:</span> {product.stock}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                    <span className="font-semibold">{product.lang_values['text_model']}:</span> {product.model}
                </p>
            </div>

            {/* Package Section */}
            {product.package && Object.keys(product.package).length > 0 && (
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-1 dark:text-gray-200 ">
                        {product.lang_values['tab_package']}
                    </h4>
                    <ul className="list-none  ">
                        <li className="text-sm text-gray-500 dark:text-gray-300">
                            <span className="font-semibold">{product.lang_values['text_dimensions']}:</span> {Number(product.package.length).toFixed(2)}  x {Number(product.package.width).toFixed(2)} x {Number(product.package.height).toFixed(2)} (L x W x H)
                        </li>
                        <li className="text-sm text-gray-500 dark:text-gray-300">
                            <span className="font-semibold">{product.lang_values['text_weight']}:</span> {Number(product.package.weight).toFixed(2)} {product.package.weight_class}
                        </li>
                    </ul>
                </div>
            )}

            {/* Attributes Section */}
            <div className="space-y-6">
                {Object.entries(product.attribute_groups).map(([groupKey, group]) => (
                    <div key={groupKey} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
                            {group.name || product.lang_values['attribute_general']}
                        </h4>
                        <ul className="list-none space-y-2 pl-4">
                            {group.values.map((value, index) => (
                                <li key={index} className="text-sm text-gray-500 dark:text-gray-300">
                                    <span className="font-semibold">{value.name}:</span> {value.text_value}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductAttributes;
