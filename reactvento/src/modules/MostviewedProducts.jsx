import React from 'react';
import ProductThumnailsContainer from '@/app-components/ProductThumnailsContainer';

const MostviewedProducts = ({ data }) => {
    return <ProductThumnailsContainer module={data} loading={false} />;
};

export default MostviewedProducts;

