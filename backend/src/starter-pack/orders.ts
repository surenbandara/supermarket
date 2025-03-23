const orders = [
    {
      "id": 174791105154,
      "bill": "[{\"productId\":3,\"quantity\":10,\"requestedPrice\":120,\"truePrice\":120,\"availableQuantity\":10}]",
      "totalPrice": "{\"totalCost\":1200,\"deliveryCost\":200,\"loyaltyPoints\":0,\"discount\":15,\"payableAmount\":1385}",
      "status": "PROCESSING",
      "paymentMethod": "CASH",
      "paymentStatus": "PENDING",
      "userId": "GUAMCTtadpRtL9jqzLSsoZGEXdJ2",
      "userLocation": "string",
      "discount": 0,
      "additionalNote": "string",
      "timestamp": 1742662249736
    },
    {
      "id": 174791105155,
      "bill": "[{\"productId\":5,\"quantity\":2,\"requestedPrice\":500,\"truePrice\":490,\"availableQuantity\":2}, {\"productId\":7,\"quantity\":1,\"requestedPrice\":100,\"truePrice\":95,\"availableQuantity\":1}]",
      "totalPrice": "{\"totalCost\":1085,\"deliveryCost\":150,\"loyaltyPoints\":5,\"discount\":50,\"payableAmount\":1180}",
      "status": "PROCESSING",
      "paymentMethod": "CARD",
      "paymentStatus": "SUCCESS",
      "userId": "AABBCCDDEEFF123",
      "userLocation": "New York, NY",
      "discount": 50,
      "additionalNote": "Deliver before 6 PM",
      "timestamp": 1742662249737
    },
    {
      "id": 174791105156,
      "bill": "[{\"productId\":2,\"quantity\":5,\"requestedPrice\":300,\"truePrice\":290,\"availableQuantity\":5}, {\"productId\":4,\"quantity\":3,\"requestedPrice\":150,\"truePrice\":140,\"availableQuantity\":3}]",
      "totalPrice": "{\"totalCost\":1450,\"deliveryCost\":100,\"loyaltyPoints\":10,\"discount\":30,\"payableAmount\":1510}",
      "status": "PROCESSING",
      "paymentMethod": "CASH",
      "paymentStatus": "PENDING",
      "userId": "XYZ123456789",
      "userLocation": "San Francisco, CA",
      "discount": 30,
      "additionalNote": "Leave at the front door",
      "timestamp": 1742662249738
    },
    {
      "id": 174791105157,
      "bill": "[{\"productId\":8,\"quantity\":1,\"requestedPrice\":80,\"truePrice\":75,\"availableQuantity\":1}]",
      "totalPrice": "{\"totalCost\":75,\"deliveryCost\":50,\"loyaltyPoints\":0,\"discount\":5,\"payableAmount\":120}",
      "status": "PROCESSING",
      "paymentMethod": "CASH",
      "paymentStatus": "SUCCESS",
      "userId": "USER0987654321",
      "userLocation": "Los Angeles, CA",
      "discount": 5,
      "additionalNote": "Order canceled due to delay",
      "timestamp": 1742662249739
    },
    {
      "id": 174791105158,
      "bill": "[{\"productId\":6,\"quantity\":4,\"requestedPrice\":250,\"truePrice\":245,\"availableQuantity\":4}]",
      "totalPrice": "{\"totalCost\":980,\"deliveryCost\":120,\"loyaltyPoints\":20,\"discount\":40,\"payableAmount\":1040}",
      "status": "CANCELLED",
      "paymentMethod": "CASH",
      "paymentStatus": "SUCCESS",
      "userId": "LMNOP987654321",
      "userLocation": "Chicago, IL",
      "discount": 40,
      "additionalNote": "Handle with care",
      "timestamp": 1742662249740
    }
  ]

export default orders;