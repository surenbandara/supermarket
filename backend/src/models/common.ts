interface AdditionalData {
    color: string;
    expirationDate: number;
    size: string;
    description: string;
}

enum Shop {
    DWLKBR_SM = "Diwulkumbura-Supermarket",
    BNTY_RSTRNT = "Bounty-Restaurant",
}

enum Category {
    FOOD = "food",
    ELECTRONICS = "electronics",
    OTHER = "other",
}

enum OrderStatus {
    NEW = "NEW",
    INITIATED = "INITIATED",
    CONFIRMED = "CONFIRMED",
    PROCESSIONG = "PROCESSIONG",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED",
}

enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    ONLINE = "ONLINE",
}

enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}

export class PriceBag {
    productId: number;
    quantity: number;
    requestedPrice: number;
    truePrice: number;
    priceChange: number;

    constructor(
        productId: number,
        quantity: number,
        requestedPrice: number,
        truePrice: number,
        priceChange: number
    ) {
        this.productId = productId;
        this.quantity = quantity;
        this.requestedPrice = requestedPrice;
        this.truePrice = truePrice;
        this.priceChange = priceChange;
    }
    public static toString(priceBags: PriceBag[]): string {
        return priceBags.map(priceBag => 
            ` {
                productId: ${priceBag.productId},
                quantity: ${priceBag.quantity},
                requestedPrice: ${priceBag.requestedPrice},
                truePrice: ${priceBag.truePrice},
                priceChange: ${priceBag.priceChange}
            }`
        ).join('\n');
    }
}


export { AdditionalData, Shop, Category, OrderStatus, PaymentMethod, PaymentStatus };