import React, { useRef, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton"
import { SEOfy } from '@/lib/utils';
import config from '@/config';
const ProductThumbnail = ({ product, loading }) => {
  // Desc to 200 chars
  const truncatedDescription = product.description.length > 200
    ? product.description.substring(0, 200) + "..."
    : product.description;
  const navigate = useNavigate();
  // Title to 50 chars
  const truncatedName = product.name.length > 50
    ? product.name.substring(0, 50) + "..."
    : product.name;


  const [isHovered, setIsHovered] = useState(false);


  const videoRef = useRef(null);


  const isVideo = product.thumb.endsWith('.mp4') || product.thumb.endsWith('.webm');

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleProductClick = (e) => {
    e.preventDefault();
    console.log(product.product_id);
    navigate(`/product/${product.product_id}/${SEOfy(product.name)}`);
  };


  return (
    <TooltipProvider>
      <Card className="max-w-[300px] w-full h-full  shadow-md rounded-lg bg-white dark:bg-gray-900 flex flex-col justify-between">
        <CardHeader className="relative overflow-hidden">

          <a
            href="#"
            onClick={handleProductClick}
            className="relative block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >

            {isVideo ? (
              <video
                ref={videoRef}
                src={`${config.apiUrl}${product.thumb}`}
                width="100%"
                height="auto"
                className="object-cover rounded-lg transition-all duration-200"
                alt={product.name}
                muted
                loop
              />
            ) : (
              <img
                src={`${config.apiUrl}${product.thumb}`}
                alt={product.name}
                width="100%"
                height="auto"
                className="object-cover rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105" // Zoom on hover
              />
            )}


            {isHovered && (
              <div className="absolute inset-0 flex  left-1/2  top-1/3  transform -translate-x-1/2 items-center justify-center bg-black bg-opacity-50 text-white text-lg font-semibold w-20 h-20 rounded-md z-10">
                View
              </div>
            )}
          </a>
        </CardHeader>

        <CardContent className="flex flex-col items-center">

          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-xl font-semibold text-center">
                {truncatedName}
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent>
              <p>{product.name}</p>
            </TooltipContent>
          </Tooltip>

          <CardDescription className="text-lg text-gray-500 text-center">{product.price}</CardDescription>


          <p
            className="text-sm text-gray-600 text-center overflow-hidden text-ellipsis max-h-[4.5rem] line-clamp-3"
            title={product.description}
          >
            {truncatedDescription}
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-full">
                Add to Cart
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to add to cart</p>
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default ProductThumbnail;
