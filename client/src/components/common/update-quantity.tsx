import { useUpdateQuantityMutation } from "@/services/cart/cart-mutation";
import { Button } from "../ui/button";
import { MinusIcon, PlusIcon } from "./icons";
import { useVerifyAuthApi } from "@/services/auth/auth-queries";
import { useCart } from "@/hooks/useCart";

interface UpdateCartButtonsProps {
  productId: string;
  quantity: number;
}

export default function UpdateCartQuantity({
  productId,
  quantity,
}: UpdateCartButtonsProps) {
  const { mutate: update } = useUpdateQuantityMutation();
  const { data: isAuth } = useVerifyAuthApi();
  const { updateInLocalStorage, removeFromLocalStorage } = useCart();
  const handleUpdateIncrement = (Id: string, currentQuantity: number) => {
    if (!isAuth) {
      updateInLocalStorage(productId, currentQuantity + 1);
    } else {
      update({ productId: Id, quantity: currentQuantity + 1 });
    }
  };

  const handleUpdatDecrement = (Id: string, currentQuantity: number) => {
    if (!isAuth) {
      if (currentQuantity === 1) {
        removeFromLocalStorage(Id);
      } else {
        updateInLocalStorage(productId, currentQuantity - 1);
      }
    } else {
      update({ productId: Id, quantity: currentQuantity - 1 });
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleUpdatDecrement(productId, quantity)}
      >
        <MinusIcon className="w-4 h-4" />
      </Button>
      <span className="font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleUpdateIncrement(productId, quantity)}
      >
        <PlusIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
