import React, { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton"

function CheckoutTotals({ products, totals, loading }) {

    if (loading) {
        return (

            <Skeleton className="container h-[150px] mx-auto p-6 mb-5    shadow-md rounded-md">

                <Skeleton className="container h-[16px] mx-auto mb-5 rounded-md" />
                <Skeleton className="container h-[16px] mx-auto  mb-5  rounded-md" />

                <Skeleton className="container h-[40px] mx-auto mb-10   rounded-md" />
            </Skeleton>


        )
    }

    return (
        <div className="container mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Summary</h2>
            <div className="space-y-4">
                {products.map((product, index) => (
                    <div
                        key={index}
                        className="border-b border-gray-200  text-gray-700 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 p-4 flex justify-between items-center"
                    >
                        <div className="flex-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">
                                {product.quantity} x {product.name}
                            </h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {product.option.map((opt, i) => (
                                    <span key={i}>   {opt.name}: {opt.value}</span>

                                ))}
                            </div>
                        </div>
                        <div className="ml-4 text-right">
                            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">{product.total}</p>
                        </div>
                    </div>
                ))}

                <div className="space-y-1 mt-1">
                    {totals.map((total, index) => (
                        <div
                            key={index + "totals"}
                            className={`flex justify-between items-center p-1 font-semibold border-t border-gray-200 dark:border-gray-700 ${index === totals.length - 1
                                ? 'text-black dark:text-white'
                                : 'text-sm text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <span>{total.title}</span>
                            <span>{total.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>


    );
}

export default CheckoutTotals;