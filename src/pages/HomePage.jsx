import BannerCarousel from '../modules/BannerCarousel';
import ProductThumnailsContainer from '../app-components/ProductThumnailsContainer';
import React, { useEffect, useState } from 'react';
import LatestProducts from '@/modules/LatestProducts';
import MostviewedProducts from '@/modules/MostviewedProducts';

export default function HomePage({ data, loading }) {


    const modulesMap = {
        LatestProducts,
        MostviewedProducts,
        BannerCarousel,

    };



    useEffect(() => {

        document.title = `${data.header.title} `;
    }, []);


    const handleReaction = (e) => {
        //  All modules for parent communcation return an object in prop function onReaction() 


    }

    return (
        <div className="flex w-full">
            {/* Left column */}

            {/* Dynamically render column left div modules only if there are any */}
            {data?.column_left?.modules.length > 0 && <div className="hidden md:flex md:flex-none md:w-auto  p-4">
                {data?.column_left?.modules?.map((item, index) => {
                    const Component = modulesMap[item.module];
                    if (Component) {
                        return (
                            <div key={index}>
                                <Component data={item} onReaction={(e) => handleReaction(e)} />
                            </div>
                        );
                    } else {
                        console.warn(`Component ${item.module} not found`);

                    }
                })}

            </div>}



            {/* Middle column */}
            <div className="flex-1 p-0">
                {/* Render a BannerCarousel or other elements based on ventocart layout set by admin */}



                {/* Dynamically render column top modules */}
                {data?.content_top?.modules?.map((item, index) => {
                    const Component = modulesMap[item.component];
                    if (Component) {
                        return (
                            <div key={index}>
                                <Component data={item} onReaction={(e) => handleReaction(e)} />
                            </div>
                        );
                    } else {
                        console.warn(`Component ${item.module} not found`);

                    }
                })}




            </div>



            {/* Right column */}
            {data?.column_right?.modules.length > 0 && <div className="hidden md:flex md:flex-none md:w-auto  p-4">
                <div className="hidden md:flex md:flex-none md:w-auto  p-4">
                    {data?.column_right?.modules?.map((item, index) => {
                        const Component = modulesMap[item.module];
                        if (Component) {
                            return (
                                <div key={index}>
                                    <Component data={item} onReaction={(e) => handleReaction(e)} />
                                </div>
                            );
                        } else {
                            console.warn(`Component ${item.module} not found`);

                        }
                    })}

                </div>


            </div>}


        </div>
    )
}


