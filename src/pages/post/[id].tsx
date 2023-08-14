import Head from "next/head";
import type { NextPage } from "next";
import { api } from "~/utils/api"
import { PageLayout } from "~/components/layout";
import type { GetStaticProps } from 'next';
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PostView } from "~/components/postView";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {

  const { data, isLoading } = api.posts.getPostByPostId.useQuery({ id });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.id} -@${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");


  await ssg.posts.getPostByPostId.prefetch({id})

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    }
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
}

export default SinglePostPage;
