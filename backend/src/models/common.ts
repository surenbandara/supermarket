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
    PROCESSIONG = "PROCESSING",
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
        // return priceBags.map(priceBag =>
        //     ` {
        //         productId: ${priceBag.productId},
        //         quantity: ${priceBag.quantity},
        //         requestedPrice: ${priceBag.requestedPrice},
        //         truePrice: ${priceBag.truePrice},
        //         availableQuantity: ${priceBag.availableQuantity}
        //     }`
        // ).join('\n');
        return JSON.stringify(priceBags);
    }

    public static fromString(input: string): PriceBag[] {
        try {
            const parsedArray = JSON.parse(input);

            return parsedArray.map(
                (obj: any) =>
                    new PriceBag(
                        obj.productId,
                        obj.quantity,
                        obj.requestedPrice,
                        obj.truePrice,
                        obj.availableQuantity
                    )
            );
        } catch (error) {
            console.error("Error parsing PriceBag string:", error);
            return [];
        }
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

    public static toString(totalBill: TotalBill): string {
        return JSON.stringify(totalBill);
    }

    public static fromString(input: string): TotalBill | null {
        try {
            const obj = JSON.parse(input);
            return new TotalBill(obj.totalCost, obj.deliveryCost, obj.loyaltyPoints, obj.discount);
        } catch (error) {
            console.error("Error parsing TotalBill string:", error);
            return null;
        }
    }
}


export { AdditionalData, Shop, Category, OrderStatus, PaymentMethod, PaymentStatus };