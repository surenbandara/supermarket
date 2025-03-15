"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.PaymentMethod = exports.OrderStatus = exports.Category = exports.Shop = exports.PriceBag = void 0;
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
    OrderStatus["PROCESSIONG"] = "PROCESSIONG";
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
    constructor(productId, quantity, requestedPrice, truePrice, priceChange) {
        this.productId = productId;
        this.quantity = quantity;
        this.requestedPrice = requestedPrice;
        this.truePrice = truePrice;
        this.priceChange = priceChange;
    }
    static toString(priceBags) {
        return priceBags.map(priceBag => ` {
                productId: ${priceBag.productId},
                quantity: ${priceBag.quantity},
                requestedPrice: ${priceBag.requestedPrice},
                truePrice: ${priceBag.truePrice},
                priceChange: ${priceBag.priceChange}
            }`).join('\n');
    }
}
exports.PriceBag = PriceBag;
