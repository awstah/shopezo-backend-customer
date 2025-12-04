import { calculateDiscountPrice } from "./product.utils";

export const formatShopProduct = (shopProduct: any) => {
  const { product, created_at, updated_at, ...shopProductWithoutProduct } = shopProduct;
  const price = Number(shopProductWithoutProduct.price);
  const discountedPriceWRaw = calculateDiscountPrice(price, shopProductWithoutProduct.discount);

  return {
    ...shopProductWithoutProduct,
    price,
    product_name: product?.product_name,
    images: product?.images?.filter((img: any) => !img.is_deleted).map((img: any) => img.url) || [],
    discountedPrice: discountedPriceWRaw > 0 ? discountedPriceWRaw : price
  };
};

export const formatCartResponse = (cart: any, includeTotals = false) => {
  let totalAmount = 0;
  let totalQuantity = 0;
  let totalAmountWithDiscount = 0;

  // Handle null or undefined cart_items
  const cartItemsArray = cart.cart_items || [];
  
  const cartItems = cartItemsArray.map((item: any) => {
    const shopProduct = formatShopProduct(item.shop_product);
    const itemTotal = Number(item.quantity) * shopProduct.price;
    const itemTotalWithDiscount = Number(item.quantity) * shopProduct?.discountedPrice

    if (includeTotals) {
      totalAmount += itemTotal;
      totalAmountWithDiscount += itemTotalWithDiscount;
      totalQuantity += item.quantity;
    }

    return {
      cart_item_id: item.id,
      shop_Product: shopProduct,
      quantity: item.quantity,
      ...(includeTotals ? { itemTotal, itemTotalWithDiscount } : {}), // only include if asked
    };
  });

  return {
    cart_id: cart.id,
    cart_items: cartItems,
    ...(includeTotals ? { totalAmount, totalAmountWithDiscount, totalQuantity } : {}),
  };
};
