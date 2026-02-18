import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: ProductId;
    categoryId: CategoryId;
    featured: boolean;
    name: string;
    description: string;
    available: boolean;
    priceCents: bigint;
    images: Array<ExternalBlob>;
}
export type OrderId = string;
export interface Category {
    id: CategoryId;
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface OrderItem {
    productId: ProductId;
    quantity: bigint;
    priceCents: bigint;
}
export interface Order {
    id: OrderId;
    customerName: string;
    status: OrderStatus;
    createdAt: Time;
    totalAmountCents: bigint;
    shippingAddress: string;
    customerId: Principal;
    items: Array<OrderItem>;
    customerEmail: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type CategoryId = string;
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type ProductId = string;
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(category: Category): Promise<void>;
    addProduct(product: Product): Promise<void>;
    addProductImage(productId: ProductId, image: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(customerName: string, customerEmail: string, shippingAddress: string, items: Array<OrderItem>, totalAmountCents: bigint): Promise<OrderId>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getOrder(orderId: OrderId): Promise<Order>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getProduct(productId: ProductId): Promise<Product>;
    getProductsByCategory(categoryId: CategoryId): Promise<Array<Product>>;
    getProductsSortedByPrice(ascending: boolean): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    removeProductImage(productId: ProductId, imageId: ExternalBlob): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    uploadProductImage(blob: ExternalBlob): Promise<ExternalBlob>;
}
