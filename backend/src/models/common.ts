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
    availableQuantity: number;

    constructor(
        productId: number,
        quantity: number,
        requestedPrice: number,
        truePrice: number,
        availableQuantity: number
    ) {
        this.productId = productId;
        this.quantity = quantity;
        this.requestedPrice = requestedPrice;
        this.truePrice = truePrice;
        this.availableQuantity = availableQuantity;
    }
    public static toString(priceBags: PriceBag[]): string {
        return priceBags.map(priceBag =>
            ` {
                productId: ${priceBag.productId},
                quantity: ${priceBag.quantity},
                requestedPrice: ${priceBag.requestedPrice},
                truePrice: ${priceBag.truePrice},
                availableQuantity: ${priceBag.availableQuantity}
            }`
        ).join('\n');
    }
}

export class TotalBill {
    totalCost: number;
    deliveryCost: number;
    loyaltyPoints: number;
    discount: number;
    payableAmount: number;

    constructor(totalGoods: number, deliveryCost: number, loyaltyPoints: number, discount: number) {
        this.totalCost = totalGoods;
        this.deliveryCost = deliveryCost;
        this.loyaltyPoints = loyaltyPoints;
        this.discount = discount;
        this.payableAmount = this.calculatePayableAmount();
    }

    private calculatePayableAmount(): number {
        return this.totalCost + this.deliveryCost - this.loyaltyPoints - this.discount;
    }

    public toString(): string {
        return `TotalBill:
        - Total Cost: ${this.totalCost}
        - Delivery Cost: ${this.deliveryCost}
        - Loyalty Points Deducted: ${this.loyaltyPoints}
        - Discount Applied: ${this.discount}
        - Payable Amount: ${this.payableAmount}`;
    }
}


export { AdditionalData, Shop, Category, OrderStatus, PaymentMethod, PaymentStatus };