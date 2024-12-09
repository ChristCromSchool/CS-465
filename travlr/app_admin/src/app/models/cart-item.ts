// 📂 travlr/app_admin/src/app/models/cart-item.ts
export interface CartItem {
  code: string;      // Using code instead of tripId
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

