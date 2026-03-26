const Razorpay = require("razorpay");

async function testRzp() {
  try {
    const keyId = "rzp_test_SUCjoTf6rqF6T2";
    const keySecret = "4YfScP50m8gvTBz4XlW6SiYA";
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    
    const options = {
      amount: 10000,
      currency: "INR",
      payment_capture: 1,
    };
    
    console.log("Calling instance.orders.create...");
    const order = await instance.orders.create(options);
    console.log("Success:", order);
  } catch (err) {
    console.error("Error creating order:", err);
  }
}

testRzp();
