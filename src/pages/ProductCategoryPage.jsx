import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiRequest from '../lib/apiRequest';
import ProductThumnailsContainer from '@/app-components/ProductThumnailsContainer';
import OptionFilter from '@/modules/filters/OptionFilter';
import config from '@/config';

export default function ProductCategoryPage() {
    const { path } = useParams();
    const { state } = useLocation();
    const categoryId = state?.categoryId;
    const [categoryData, setCategoryData] = useState({});
    const [loading, setLoading] = useState(true);


    const modulesMap = {
        OptionFilter,

    };



    useEffect(() => {

        fetchCategory();

    }, [path]);

    const fetchCategory = async (add = null) => {
        try {


            const url = `${config.apiUrl}/?route=api/home.getCategory&path=${categoryId}`;
            console.log("Fetching from URL:", url);
            // Make the API request
            let response = await apiRequest(url);

            // Check if the response is OK
            if (!response.ok) {
                throw new Error('Failed to fetch product: ' + response.statusText);
            }

            // Log the response to inspect it
            console.log('API response:', response);

            // Parse the response body
            let data = await response.json();

            // Log the data to inspect it
            console.log('Fetched data:', data);

            // If data contains products, process it
            if (data.products) {
                data.products = Object.values(data.products);
                setCategoryData(data);
                console.log(data.products); // Corrected from 'products' to 'data.products'
            }

        } catch (err) {
            // Log the error to see what went wrong
            console.error('Error fetching category:', err);
        } finally {
            // Ensure the loading state is updated even if there's an error
            setLoading(false);
        }
    }


    const handleReaction = (e) => {

        if (typeof e.category == "string") {

            fetchCategory(e.category);
        }

    }
    return (
        <div className="flex w-full">
            {/* Left column */}

            {/* Dynamically render column left div modules only if there are any */}
            {categoryData?.column_left?.modules.length > 0 && <div className="hidden md:flex md:flex-none md:w-auto  p-4">
                {categoryData?.column_left?.modules?.map((item, index) => {
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
            <div className="flex-1  p-4">

                {/* Dynamically render conetnt top modules */}
                {categoryData?.content_top?.modules?.map((item, index) => {
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



                <ProductThumnailsContainer module={categoryData} loading={loading} />


                {/* Dynamically render content bottom modules  */}



                {categoryData?.content_bottom?.modules?.map((item, index) => {
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

            {/* Right column */}
            {categoryData?.column_right?.modules.length > 0 && <div className="hidden md:flex md:flex-none md:w-auto  p-4">
                <div className="hidden md:flex md:flex-none md:w-auto bg-gray-200 p-4">
                    {categoryData?.column_right?.modules?.map((item, index) => {
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
    );
}