import Head from "next/head";
import dayjs from "dayjs";
import React from "react";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import type { NextPage } from "next";
import { LoadingPage } from "~/components/loading";
const CreatePostWizard = () => {

  const { user } = useUser();
  const [input, setInput] = React.useState("");
  const ctx= api.useContext();
  const { mutate } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
  });


  if (!user) return null;
  return <div className="flex gap-3 md:max-w-l w-full">
    <Image
      src={user.imageUrl}
      alt="Profile imgage"
      width={56} height={56}
      className="rounded-full h-14 w-14" />
    <input
      placeholder="Grace the world with your opinions!"
      className="bg-transparent w-full"
      value={input}
      onChange={(e) => setInput(e.target.value)} />
    <button onClick={() => mutate({ content: input })}>Post</button>
  </div>
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="p-4 border-b border-slate-400 flex items-center gap-2 ">
      <Image src={author.profilePicture} className="rounded-full h-14 w-14" alt={`@${author.username}'s profile picture`} width={56} height={56} />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1"><span>{`@${author.username}`}</span>
          <div className="text-slate-400">{` · ${dayjs(post.createdAt).fromNow()}`}</div>
        </div>
        <span>
          {post.content}
        </span>
      </div>
    </div>)
}

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;
  return (<div className="flex flex-col">
    {[...data]?.map((fullPost) => (
      <PostView {...fullPost} key={fullPost.post.id} />
    ))}
  </div>)
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  //start fetching ASAP
  api.posts.getAll.useQuery();

  //return empty div if user isn't loaded  yet
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="h-full w-full md:max-w-2xl border-x border-slate-100">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && <div className="flex justify-center">
              <SignInButton />
            </div>}
            {!!isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}

export default Home;
