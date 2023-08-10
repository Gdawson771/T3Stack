import Head from "next/head";
import type { NextPage } from "next";
import { api } from "~/utils/api"
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/layout";
import type { GetStaticProps } from 'next';
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postView";

const ProfileFeed = (props: { userId: string }) => {

  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>

  return <div className="flex flex-col">
    {data.map((fullPost) => (<PostView {...fullPost} key={fullPost.post.id} author={fullPost.author} />))}
    </div>
}
const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data, isLoading } = api.profiles.getUserByUsername.useQuery({ username });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative  h-48 border-slate-400 bg-slate-600">
          <Image
            src={data.profilePicture}
            alt={`${data.username}'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black" />

        </div>
        <div className="h-[48px]"></div>
        <div className="p-4 text-2xl font-bold border-b border-slate-400">{`@${data.username}`}</div>
        <ProfileFeed userId={data.id}/>
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");
  await helpers.profiles.getUserByUsername.prefetch({ username: username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username
    }
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
}

export default ProfilePage;
