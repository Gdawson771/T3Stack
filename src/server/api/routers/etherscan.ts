import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
type ResponseData = {
    status: string;
    message: string;
    result: string;
  };

// Create a new ratelimiter, that allows 10 requests per 10 seconds
// const ratelimit = new Ratelimit({
//     redis: Redis.fromEnv(),
//     limiter: Ratelimit.slidingWindow(2, "1 m"),
//     analytics: true,
//     /**
//      * Optional prefix for the keys used in redis. This is useful if you want to share a redis
//      * instance with other applications and want to avoid key collisions. The default prefix is
//      * "@upstash/ratelimit"
//      */
//     prefix: "@upstash/ratelimit",
// });

export const etherscanRouter = createTRPCRouter({
    //publicProcedure is a query which anyone should have access to. In this case all users should be able to get all of the posts
    getBalance: privateProcedure
        .input(
            z.object({
                address: z.string().length(42)
            })
        ).query(async ({ input }) => {
            // if (response.ok && response?.json ){
                
                //     const j: ResponseData  = await response.json();
                
                // }
                // const response = await fetch(url);
              //  https://api.etherscan.io/api?module=account&action=balancemulti&address=0x59D68B3646E31A7a681EfA0c73C02ECC8FAFF8eA&tag=latest&apikey=T94VC1D1W7F96AFGVNY9KTU6VN4MJXMJGD
            if(!process.env.ETHERSCAN_API_TOKEN){     throw new Error(`Request failed with API key Error`);}
            console.log("getting response!")
            //const response = (await fetch('https://api.etherscan.io/api?module=account&action=balancemulti&address=0x59D68B3646E31A7a681EfA0c73C02ECC8FAFF8eA&tag=latest&apikey='.concat(process.env.ETHERSCAN_API_TOKEN)));
            const response = (await fetch('https://api.etherscan.io/api?module=account&action=balance&address='
            .concat(input.address).concat('&tag=latest&apikey=').concat(process.env.ETHERSCAN_API_TOKEN)));
            if (!response.ok) {
              throw new Error(`Request failed with status: ${response.status}`);
            }
            console.log("response got")
        
            const data = await response.json() as ResponseData
            return data
            // response.json()
            // if (response?.json?.())
            // {

            // }
            // else{ throw new TRPCError({ code: "NOT_FOUND" });}
            // if (!jsonData) throw new TRPCError({ code: "NOT_FOUND" });
            // else { return jsonData }


            // const xhr = new XMLHttpRequest();
            // xhr.open('GET', 'https://api.etherscan.io/api?module=account&action=balancemulti' 
            // + '&address=0x' + input.address +
            // + '&tag=latest&apikey='+process.env.ETHERSCAN_API_TOKEN);
            // xhr.onload = function () {
            //     if (xhr.status === 200) {
            //        (JSON.parse(xhr.responseText));
            //     }
            // };
            // xhr.send();
            // console.log("API REQ SUCCESSFUL?")
            //return (input.address)
        })

});
