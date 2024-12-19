import React from 'react';
import ProductThumbnail from './ProductThumbnail';
import { Skeleton } from "@/components/ui/skeleton"
const ProductThumnailsContainer = ({ module, loading }) => {

  if (loading) {
    return (

      <div className="product-thumbnails-container max-w-7xl mt-2 mb-2 mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-4">
        <Skeleton className="text-2xl h-[30px] font-semibold text-center text-gray-800 dark:text-white  ">

        </Skeleton>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
          <Skeleton className="container h-[400px] w-[300px] mx-auto p-6 mb-5  dark:bg-gray-900  shadow-md rounded-md">
            <Skeleton className="container h-[200px] w-[200px] mx-auto p-6 mb-5  dark:bg-gray-900  shadow-md rounded-md" />
            <Skeleton className="text-2xl h-[30px] font-semibold text-center  mb-5  shadow-md text-gray-800 dark:text-white  " />

          </Skeleton>

          <Skeleton className="container h-[400px] w-[300px] mx-auto p-6 mb-5  dark:bg-gray-900  shadow-md rounded-md">
            <Skeleton className="container h-[200px] w-[200px] mx-auto p-6 mb-5  dark:bg-gray-900  shadow-md rounded-md" />
            <Skeleton className="text-2xl h-[30px] font-semibold text-center  mb-5  shadow-md text-gray-800 dark:text-white  " />

          </Skeleton>
          <Skeleton className="container h-[400px] w-[300px] mx-auto p-6 mb-5  dark:bg-gray-900  shadow-md rounded-md">
            <Skeleton className="container h-[200px] w-[200px] mx-auto p-6 mb-5  dark:bg-gray-900  shadow-md rounded-md" />
            <Skeleton className="text-2xl h-[30px] font-semibold text-center  mb-5  shadow-md text-gray-800 dark:text-white  " />

          </Skeleton>
          <Skeleton className="container h-[400px] w-[300px] mx-auto p-6 mb-5  dark:bg-gray-900  shadow-md rounded-md">
            <Skeleton className="container h-[200px] w-[200px] mx-auto p-6 mb-5  dark:bg-gray-900  shadow-md rounded-md" />
            <Skeleton className="text-2xl h-[30px] font-semibold text-center  mb-5  shadow-md text-gray-800 dark:text-white  " />

          </Skeleton>
        </div></div>
    )
  }
  return (
    <div className="product-thumbnails-container max-w-7xl mt-2 mb-2 mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-4">
      {/* Heading */}
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white  ">
        {module?.lang_values?.heading_title ? module?.lang_values?.heading_title : (module?.heading_title ? module?.heading_title : ' ')}

      </h2>

      {/* Product grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
        {module?.products?.map((product, index) => (
          <div> <ProductThumbnail key={index} product={product} loading={loading} /></div>
        ))}
      </div>
    </div>
  );
}

export default ProductThumnailsContainer;
