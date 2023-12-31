import { postsRouter } from "~/server/api/routers/posts";
import { createTRPCRouter } from "~/server/api/trpc";
import { profileRouter } from "~/server/api/routers/profile"
import { etherscanRouter } from "~/server/api/routers/etherscan"
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  profiles: profileRouter,
  ethAPI: etherscanRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
