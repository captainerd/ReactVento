import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import apiRequest from '../lib/apiRequest';
import ProductThumnailsContainer from '@/app-components/ProductThumnailsContainer';
import OptionFilter from '@/modules/filters/OptionFilter';


export default function ProductCategoryPage() {
    const { path } = useParams();
    const [categoryData, setCategoryData] = useState({});
    const [loading, setLoading] = useState(true);


    const modulesMap = {
        OptionFilter,

    };



    useEffect(() => {

        fetchCategory();

    }, [path]);

    const fetchCategory = async (add = null) => {


        setLoading(true);
        try {

            let response = await apiRequest(`${window.siteUrl}/?route=product/category&path=${path}&${add}`)

            if (!response.ok) {
                throw new Error('Failed to fetch product')
            }

            let data = await response.json()
            if (data.products) {
                data.products = Object.values(data.products);

                setCategoryData(data)
                console.log(products)
            }

        } catch (err) {

        } finally {


        }
        setLoading(false);
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