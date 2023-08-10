import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { TRPCError } from "@trpc/server";

// Create a new ratelimiter, that allows 10 requests per 10 seconds


export const profileRouter = createTRPCRouter({

    getUserByUsername: publicProcedure.input(z.object({username: z.string()})).
    query(async ({ input}) => {
        const [user] = await clerkClient.users.getUserList({
            username: [input.username],
        })
        if(!user){
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "User not found",
            })
        }
        return filterUserForClient(user);
    }),
});
