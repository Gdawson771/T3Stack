import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient"
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import type { Post } from "@prisma/client";
// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(2, "1 m"),
    analytics: true,
    /**
     * Optional prefix for the keys used in redis. This is useful if you want to share a redis
     * instance with other applications and want to avoid key collisions. The default prefix is
     * "@upstash/ratelimit"
     */
    prefix: "@upstash/ratelimit",
});

const addUserDataToPosts = async (posts:Post[]) =>{
    const users = (await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
    })).map(filterUserForClient);

    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId)!
       // console.log("POST", post);
      //  console.log("AUTHOR", author);
        if (!author?.username  ) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author for post not found" });
        return {
            post,
            author,
        }
    });
}

export const postsRouter = createTRPCRouter({
    //publicProcedure is a query which anyone should have access to. In this case all users should be able to get all of the posts
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: [{ wealth:"desc"},{createdAt:"desc"}]
        });
        return addUserDataToPosts(posts);
    }),
    create: privateProcedure
        .input(
            z.object({
                content: z.string().min(1).max(280),
                wealth: z.number()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const authorId = ctx.userId;
            const { success } = await ratelimit.limit(authorId);

            if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

            const post = await ctx.prisma.post.create({
                data: {
                    authorId,
                    content: input.content,
                    wealth: input.wealth
                }
            });
            return post;
        }),

    getPostsByUserId: publicProcedure
        .input(
            z.object({
                userId: z.string()
            })
        ).query(async ({ ctx, input }) => {
            const posts = await ctx.prisma.post.findMany({
                take: 100,
                where: {
                    authorId: input.userId,
                },
                orderBy: [{ createdAt: "desc", }]
            }).then(addUserDataToPosts);
            return posts;
        }),

    getPostByPostId: publicProcedure
        .input(
            z.object({
                id: z.string()
            })
        ).query(async ({ ctx, input}) => {
            const post = await ctx.prisma.post.findUnique({
                where: {
                    id: input.id
                }
            })
            if(!post) throw new TRPCError({code : "NOT_FOUND"});

            return (await addUserDataToPosts([post]))[0];
        })

});
