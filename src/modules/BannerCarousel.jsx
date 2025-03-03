import React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import config from '@/config';
const BannerCarousel = ({ data }) => {
  if (!data.banners || data.banners.length === 0) {
    return '';
  }

  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: parseInt(data.interval),
        }),
      ]}
      opts={{ align: "start", loop: true }}
      className="relative text-center w-full"
    >
      <CarouselContent className="relative w-full text-center m-0 p-0">
        {data.banners.map((banner, index) => (
          <CarouselItem key={index}>
            <div
              className="relative w-full  h-[${module.height}px]  sm:h-[calc(${module.height}px / 2)]"
              style={{
                maxHeight: `calc(${data.height}px)`,

              }}
            >

              <img
                src={config.apiUrl + banner.image}
                alt={banner.title}
                style={{
                  maxHeight: `calc(${data.height}px)`,

                }}
                className="object-cover object-center w-full h-full rounded-lg"
              />

              <div className="relative  bottom-1/2  md:bottom-1/3">
                <div
                  className="absolute left-1/2    transform -translate-x-1/2 w-[400px] text-center m-6 bottom-1/2 bg-black/30 text-white p-2 rounded cursor-pointer hover:bg-black/50 hover:scale-105 transition-all duration-300"
                  onClick={() => console.log(banner.link)}
                >
                  <div dangerouslySetInnerHTML={{ __html: banner.title }} />
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Fix buttons with absolute positioning */}
      <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/50 text-white rounded-full p-2">
        &#8592;
      </CarouselPrevious>
      <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2  bg-gray-800/50 text-white rounded-full p-2">
        &#8594;
      </CarouselNext>
    </Carousel>
  );
};

export default BannerCarousel;
