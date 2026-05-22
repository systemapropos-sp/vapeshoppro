import { create } from "zustand";

export interface CartItem {
  productId: number;
  name: string;
  image?: string;
  price: number;
  costPrice?: number;
  quantity: number;
  discount: number;
  total: number;
}

interface CartState {
  items: CartItem[];
  customerId?: number;
  customerName?: string;
  discount: number;
  tax: number;
  paymentMethod: "cash" | "card" | "transfer" | "credit" | "mixed";
  amountPaid: number;
  notes: string;
  heldOrders: HeldOrder[];

  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateDiscount: (productId: number, discount: number) => void;
  setCustomer: (id?: number, name?: string) => void;
  setDiscount: (discount: number) => void;
  setTax: (tax: number) => void;
  setPaymentMethod: (method: "cash" | "card" | "transfer" | "credit" | "mixed") => void;
  setAmountPaid: (amount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  holdOrder: () => void;
  resumeOrder: (orderId: string) => void;
  removeHeldOrder: (orderId: string) => void;
  getHeldOrders: () => HeldOrder[];
}

interface HeldOrder {
  id: string;
  items: CartItem[];
  customerId?: number;
  customerName?: string;
  createdAt: Date;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: undefined,
  customerName: undefined,
  discount: 0,
  tax: 0,
  paymentMethod: "cash",
  amountPaid: 0,
  notes: "",
  heldOrders: [],

  addItem: (item) => {
    const { items } = get();
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price - i.discount }
            : i
        ),
      });
    } else {
      set({ items: [...items, { ...item, quantity: 1, total: item.price - item.discount }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, quantity, total: quantity * i.price - i.discount } : i
      ),
    });
  },

  updateDiscount: (productId, discount) => {
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, discount, total: i.quantity * i.price - discount } : i
      ),
    });
  },

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setDiscount: (discount) => set({ discount }),
  setTax: (tax) => set({ tax }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setAmountPaid: (amount) => set({ amountPaid: amount }),
  setNotes: (notes) => set({ notes }),

  clearCart: () =>
    set({
      items: [],
      customerId: undefined,
      customerName: undefined,
      discount: 0,
      tax: 0,
      amountPaid: 0,
      notes: "",
    }),

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.total, 0),
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const taxAmount = subtotal * (get().tax / 100);
    return subtotal + taxAmount - get().discount;
  },

  holdOrder: () => {
    const { items, customerId, customerName } = get();
    if (items.length === 0) return;
    const heldOrder: HeldOrder = {
      id: Date.now().toString(),
      items: [...items],
      customerId,
      customerName,
      createdAt: new Date(),
    };
    set({
      heldOrders: [...get().heldOrders, heldOrder],
      items: [],
      customerId: undefined,
      customerName: undefined,
      discount: 0,
      tax: 0,
      amountPaid: 0,
      notes: "",
    });
  },

  resumeOrder: (orderId) => {
    const order = get().heldOrders.find((o) => o.id === orderId);
    if (!order) return;
    set({
      items: order.items,
      customerId: order.customerId,
      customerName: order.customerName,
      heldOrders: get().heldOrders.filter((o) => o.id !== orderId),
    });
  },

  removeHeldOrder: (orderId) => {
    set({ heldOrders: get().heldOrders.filter((o) => o.id !== orderId) });
  },

  getHeldOrders: () => get().heldOrders,
}));
