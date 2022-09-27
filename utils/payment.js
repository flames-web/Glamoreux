const paystack = (request) => {

    const initializePayment = (form, mycallback) => {
        const option = {
            url : 'https://api.paystack.co/transaction/initialize',
            headers : {
                authorization: process.env.PAYSTACK_KEY,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
           },
           form
        }
        const callback = (error, response, body)=>{
            return mycallback(error, body);
        }
        request.post(option,callback);
    }
    const verifyPayment = (ref,mycallback) => {
        const option = {
            url : 'https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref),
            headers : {
                authorization: process.env.PAYSTACK_KEY,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
           }
        }
        const callback = (error, response, body)=>{
            return mycallback(error, body);
        }
        request(option,callback);
    }
    const allTransactions = (page,mycallback) =>{
        const option = {
            url:'https://api.paystack.co/transaction?perPage=15&page='+encodeURIComponent(page),
            headers:{
                authorization:process.env.PAYSTACK_KEY,
                'content-type':'application/json',
                'cache-control':'no-cache'
            }
        }
        const callback = (error,response,body) => {
            return mycallback(error,body);
        }
        request(option,callback)
    }
    return {initializePayment, verifyPayment,allTransactions};
}
module.exports = paystack