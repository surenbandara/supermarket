"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.PaymentMethod = exports.OrderStatus = exports.Category = exports.Shop = exports.TotalBill = exports.PriceBag = void 0;
var Shop;
(function (Shop) {
    Shop["DWLKBR_SM"] = "Diwulkumbura-Supermarket";
    Shop["BNTY_RSTRNT"] = "Bounty-Restaurant";
})(Shop || (exports.Shop = Shop = {}));
var Category;
(function (Category) {
    Category["FOOD"] = "food";
    Category["ELECTRONICS"] = "electronics";
    Category["OTHER"] = "other";
})(Category || (exports.Category = Category = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "NEW";
    OrderStatus["INITIATED"] = "INITIATED";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSIONG"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURNED"] = "RETURNED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["ONLINE"] = "ONLINE";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
class PriceBag {
    constructor(productId, quantity, requestedPrice, truePrice, availableQuantity) {
        this.productId = productId;
        this.quantity = quantity;
        this.requestedPrice = requestedPrice;
        this.truePrice = truePrice;
        this.availableQuantity = availableQuantity;
    }
    static toString(priceBags) {
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
    static fromString(input) {
        try {
            const parsedArray = JSON.parse(input);
            return parsedArray.map((obj) => new PriceBag(obj.productId, obj.quantity, obj.requestedPrice, obj.truePrice, obj.availableQuantity));
        }
        catch (error) {
            console.error("Error parsing PriceBag string:", error);
            return [];
        }
    }
}
exports.PriceBag = PriceBag;
class TotalBill {
    constructor(totalGoods, deliveryCost, loyaltyPoints, discount) {
        this.totalCost = totalGoods;
        this.deliveryCost = deliveryCost;
        this.loyaltyPoints = loyaltyPoints;
        this.discount = discount;
        this.payableAmount = this.calculatePayableAmount();
    }
    calculatePayableAmount() {
        return this.totalCost + this.deliveryCost - this.loyaltyPoints - this.discount;
    }
    static toString(totalBill) {
        return JSON.stringify(totalBill);
    }
    static fromString(input) {
        try {
            const obj = JSON.parse(input);
            return new TotalBill(obj.totalCost, obj.deliveryCost, obj.loyaltyPoints, obj.discount);
        }
        catch (error) {
            console.error("Error parsing TotalBill string:", error);
            return null;
        }
    }
}
exports.TotalBill = TotalBill;
