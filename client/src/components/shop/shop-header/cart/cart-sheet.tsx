import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

import { useGetCartProductsApi } from "@/services/cart/cart-queries";
import { ShoppingCartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CartLineItems from "./cartline-items";
import EmptyCart from "@/components/common/cart/empty-cart";

export default function CartSheet() {
  const navigate = useNavigate();

  const { data: cartItems } = useGetCartProductsApi();

  const totalAmount = cartItems?.reduce(
    (total, item) => total + item.quantity * item.product.price,
    0
  );
  const count = cartItems?.reduce((total, item) => total + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"icon"} className="relative">
          {count
            ? count > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -right-2 -top-2 size-6 justify-center rounded-full p-2.5"
                >
                  {count}
                </Badge>
              )
            : ""}
          <ShoppingCartIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Cart {count && count > 0 && `(${count})`}</SheetTitle>
          <Separator />
          {cartItems && count && count > 0 ? (
            <>
              <CartLineItems items={cartItems} />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="flex-1">Shipping</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>{totalAmount?.toFixed(2)}</span>
                </div>
              </div>
              <SheetFooter>
                <SheetTrigger asChild>
                  <Button className="w-full" onClick={() => navigate("/cart")}>
                    Continue to checkout
                  </Button>
                </SheetTrigger>
              </SheetFooter>
            </>
          ) : (
            <EmptyCart />
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}