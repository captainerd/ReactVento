import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { parsePrice, stripHtmlTags } from "@/lib/utils"
import { useSaveLanguage } from '@/store/languageStore';
import apiRequest from '../lib/apiRequest';
import ProductAttributes from "@/app-components/ProductAttributes"
import ProductOptions from "@/app-components/ProductOptions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import { ToastAction } from "@/components/ui/toast"
import { useDispatch } from 'react-redux';
import { addToCart, loadCart } from '../store/slices/cartSlice';
import { Skeleton } from "@/components/ui/skeleton"
import config from '@/config';
export default function ProductPage() {
  const [product, setProduct] = useState([])
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [mainImage, setMainImage] = useState('')
  const { productId } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [initialPrice, setInitialPrice] = useState({ symbol: '$', start: false, price: 0 });
  const stateClone = useRef({ quantity: 1, selectedOptions: {} });
  const [selectedVariation, setSelectedVariation] = useState(false);
  const [exludingTax, setExludingtax] = useState(0)
  const saveLanguage = useSaveLanguage();

  const { toast } = useToast();
  const dispatch = useDispatch();

  const handleAddToBasket = async () => {

    if (product.minimum > quantity) {
      const message = product.lang_values['text_minimum'].replace('%s', product.minimum);
      alert(message);
      return;
    }

    const missingOptions = product.options
      .filter(option => option.required === "1")
      .filter(option => !selectedOptions[option.product_option_id]);

    if (missingOptions.length > 0) {
      const missingOptionNames = missingOptions.map(option => option.name).join(", ");


      toast({
        variant: "destructive",
        title: product.lang_values['text_error'],
        description: product.lang_values['text_select_value'] + '  ' + missingOptionNames,
        action: <ToastAction altText="{LanguageKeys['text_ok']}">{product.lang_values['text_ok']}</ToastAction>,
      })


      return;
    }



    const addingCart = await dispatch(addToCart(product, quantity, selectedOptions)); // Await the result

    if (addingCart.success) {
      toast({
        variant: "default",
        title: product.lang_values['text_success'],
        description: stripHtmlTags(addingCart.message, []), // Use `message` from the result
        action: <ToastAction altText="{LanguageKeys['text_ok']}">{product.lang_values['text_ok']}</ToastAction>,
      });

    } else {
      toast({
        variant: "destructive",
        title: product.lang_values['text_error'],
        description: stripHtmlTags(addingCart.message, []), // Use `message` from the result
        action: <ToastAction altText="{LanguageKeys['text_ok']}">{product.lang_values['text_ok']}</ToastAction>,
      });
    }




  };




  useEffect(() => {

    stateClone.current.quantity = quantity;
    calculateTotalPrice(); // Call the function
  }, [quantity]);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        let response = await fetch(`${config.apiUrl}/index.php?route=api/home.getProduct&language=en-gb&product_id=${productId}&api=true`)

        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }

        let data = await response.json()

        saveLanguage(data.lang_values);
        setProduct(data)
        setPrice(data.tax ? data.tax : data.price);
        setInitialPrice(parsePrice(data.tax ? data.tax : data.price));
        setMainImage(data.thumb)
        setQuantity(parseInt(data.minimum))
        setExludingtax(data.tax)


      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)

      }
    }

    fetchProduct()
  }, [productId])

  function buildPrice(number) {
    let { symbol, start } = initialPrice;
    return start ? `${symbol}${number}` : `${number}${symbol}`;
  }


  const calculateTotalPrice = (variation = selectedVariation) => {
    //Calculate Regular Options

    let priceinit = 0;
    let noTaxprice = 0;
    if (!variation) {
      priceinit = initialPrice.price;
      Object.values(stateClone.current.selectedOptions).map((value) => {
        if (value.pricePrefix == "=" && value.price > 0) {
          priceinit = value.price;

        }
      })
      Object.values(stateClone.current.selectedOptions).map((value) => {
        if (value.pricePrefix == "+" && value.price > 0) {
          priceinit += value.price;
        }
        if (value.pricePrefix == "-" && value.price > 0) {
          priceinit -= value.price;
        }
      })

      // Calculate Quantity
      noTaxprice = priceinit * stateClone.current.quantity;
      priceinit = calculateTax(priceinit) * stateClone.current.quantity;

    } else {
      priceinit = parseFloat(variation.price);
      setSelectedVariation(variation);

      noTaxprice = priceinit * stateClone.current.quantity;
      priceinit = calculateTax(priceinit) * stateClone.current.quantity;

    }
    setPrice(buildPrice(priceinit.toFixed(2)));
    setExludingtax(buildPrice(noTaxprice.toFixed(2)));
  }


  useEffect(() => {
    document.title = `${product?.heading_title} - ${config.appName}`;
  }, [product]);
  const handleThumbnailClick = (thumbUrl) => {
    setMainImage(thumbUrl)
  }


  const onOptionChange = (optionId, image, options, variation) => {

    if (image) {
      setMainImage(image)
    }
    if (!variation) {
      setSelectedVariation(false);
    }
    stateClone.current.selectedOptions = options;
    setSelectedOptions(options);
    calculateTotalPrice(variation);

  };

  function calculateTax(price, fixed = true) {
    if (!product || !product?.tax || product.taxrates.length == 0) {
      return price;
    }

    // Initialize total price with the original price
    let totalPrice = price;

    // Loop through each tax rate
    for (const taxRateId in product.taxrates) {
      const taxRate = product.taxrates[taxRateId];
      // Apply tax based on the type
      if (taxRate.type === "P") {
        // Percentage tax
        const taxAmount = (price * (parseFloat(taxRate.rate) / 100));
        totalPrice += taxAmount;
      } else if (taxRate.type === "F" && fixed) {
        // Fixed tax
        totalPrice += taxRate.amount;
      }
    }

    // Return the total price including all taxes
    return totalPrice.toFixed(2);
  }
  const buttonsQuantity = (e) => {

    stateClone.current.quantity = Math.max(1, quantity + e);
    setQuantity(stateClone.current.quantity);

    calculateTotalPrice();


  }


  if (loading) return (

    <Skeleton className="container h-[100vh] w-[100%] mx-auto p-6 mb-5 dark:bg-gray-900 shadow-md rounded-md">
      {/* Main Image */}

      {/* Product Title */}
      <Skeleton className="text-2xl h-[30px] font-semibold text-center mb-5 shadow-md text-gray-800 dark:text-white" />

      {/* Product Details Section */}
      <div className="flex flex-col md:flex-row items-start gap-4">
        {/* Larger Image on the Left */}
        <Skeleton className="h-[300px] w-[300px] md:h-[350px] md:w-[350px] dark:bg-gray-900 shadow-md rounded-md" />

        {/* Text Skeletons */}
        <div className="flex flex-col flex-grow gap-2">
          <Skeleton className="h-[20px] w-[full] dark:bg-gray-700 shadow-md rounded-md" />
          <Skeleton className="h-[20px] w-[full] dark:bg-gray-700 shadow-md rounded-md" />
          <Skeleton className="h-[20px] w-[full] dark:bg-gray-700 shadow-md rounded-md" />
          <Skeleton className="h-[20px] w-[full] dark:bg-gray-700 shadow-md rounded-md" />
        </div>
      </div>

      {/* Product Description */}
      <Skeleton className="h-[200px] w-full mt-6 dark:bg-gray-800 shadow-md rounded-md" />
    </Skeleton>


  )
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!product) return <div>No product found</div>



  // Function to check if the file is a video type (mp4 or avi)
  const isVideo = (url) => {
    return /\.(mp4|avi)$/i.test(url)
  }

  return (
    <div className="flex flex-col bg-gray-50 shadow-md rounded   p-5 max-w-6xl mx-auto my-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Title Section */}
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">{product.heading_title}</h1>

      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Photo Section */}
        <div className="flex flex-col space-y-4 lg:w-1/2 w-full">
          {isVideo(mainImage) ? (
            <video
              controls
              className="w-full h-auto rounded-md"
              width="600"
              height="400"
              style={{ aspectRatio: "600/400", objectFit: "cover" }}
            >
              <source src={config.apiUrl + mainImage} type="video/mp4" />
              <source src={config.apiUrl + mainImage} type="video/avi" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={config.apiUrl + mainImage || "/placeholder.svg"}
              alt={product.heading_title}
              className="w-full h-auto"
              width="600"
              height="400"
              style={{ aspectRatio: "600/400", objectFit: "cover" }}
            />
          )}

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-2">
            {product.images && product.images.map((image, index) => (
              <div key={index} className="relative group">
                {isVideo(image.thumb) ? (
                  <video
                    className="w-full h-auto cursor-pointer rounded-md transition-all hover:scale-105"
                    width="100"
                    height="100"
                    style={{ aspectRatio: "100/100", objectFit: "cover" }}
                    onClick={() => handleThumbnailClick(image.popup)}
                    muted
                  >
                    <source src={image.thumb} type="video/mp4" />
                    <source src={image.thumb} type="video/avi" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={config.apiUrl + image.thumb || config.apiUrl + "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full   h-auto cursor-pointer rounded-md transition-all hover:scale-105"
                    width="100"
                    height="100"
                    style={{ aspectRatio: "100/100", objectFit: "cover" }}
                    onClick={() => handleThumbnailClick(image.popup)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Options Section */}
        <div className="w-full lg:w-1/2 px-8 lg:px-12">
          <h2 className="text-lg font-medium"> {product.lang_values['text_option']}:</h2>
          <ProductOptions
            productOptions={product.options}
            productVariations={product.variations}
            onOptionChange={onOptionChange}
          />
          <div className="mb-6">
            <h2 className="text-lg font-medium">Price:</h2>
            <span className="text-2xl sm:text-4xl font-semibold">
              {price}

            </span>
            {product.tax && <p><small>
              {product.lang_values['text_tax']}: {exludingTax}
            </small></p>}
          </div>

          <div className="flex items-baseline mb-6">
            <span className="text-sm sm:text-lg">{product.stock}</span>
          </div>

          {/* Quantity/Basket Section */}
          <div className="flex items-center mb-6">
            <Button
              className="bg-gray-200 dark:bg-gray-700 dark:text-white"
              onClick={() => buttonsQuantity(-1)}
            >
              -
            </Button>
            <Input
              className="mx-2 w-12 text-center bg-gray-200 dark:bg-gray-700 dark:text-white"
              value={quantity}
              onChange={(e) => {
                !isNaN(e.target.value) &&
                  e.target.value > 0 &&
                  e.target.value.trim() !== "" &&
                  setQuantity(Number(e.target.value));
              }}
              min="1"
            />
            <Button
              className="bg-gray-200 dark:bg-gray-700 dark:text-white"
              onClick={() => buttonsQuantity(1)}
            >
              +
            </Button>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={handleAddToBasket}
              className="bg-black text-white dark:bg-gray-800 dark:text-gray-300 w-full lg:w-auto"
            >
              ADD TO BASKET
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
      {/* Description Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">{product.lang_values['tab_description']}</TabsTrigger>
            <TabsTrigger value="attrs">{product.lang_values['tab_attribute']}</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <span
                dangerouslySetInnerHTML={{ __html: stripHtmlTags(product.description) }}
              ></span>
            </div>
          </TabsContent>
          <TabsContent value="attrs">
            <ProductAttributes product={product} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
