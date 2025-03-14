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

enum Status {
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




export { AdditionalData, Shop, Category, Status, PaymentMethod, PaymentStatus };