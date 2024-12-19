import React from 'react';
import ProductThumnailsContainer from '@/app-components/ProductThumnailsContainer';

const LatestProducts = ({ data }) => {
    return <ProductThumnailsContainer module={data} loading={false} />;
};

export default LatestProducts;

