import dayjs from "dayjs";
import React from "react";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { api } from "~/utils/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import toast from "react-hot-toast";
import { PostView } from "~/components/postView";
import type { NextPage } from "next";
import { LoadingPage, LoadingSpinner } from "~/components/loading";

const CreatePostWizard = () => {
  
  const { user } = useUser();
  const [input, setInput] = React.useState("");
  const ctx = api.useContext();
  // api.ethAPI.getBalance();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },

    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      }
      else {
        toast.error("Error! Failed to post!")
      }
    }
  });

  if (!user) return null;
  const validateWealth = () => {
    if (!user.username && user.primaryWeb3WalletId && user.web3Wallets) {
      const primaryWallet = user.web3Wallets.find((wallet) => wallet.id === user.primaryWeb3WalletId);
      console.log("primary wallet", primaryWallet)
      if (primaryWallet) {
        const userWEI =  api.ethAPI.getBalance.useQuery({ address: primaryWallet.web3Wallet });
        console.log("userWEI!",userWEI)
        if(userWEI.data?.result && parseFloat(userWEI.data?.result)/1000000000000000000 >=0)
        {
          console.log("wealthy!")
          return true;
        }
      }
    }
    console.log("Too poor!")
    return false;
  }


  // if (!user.username && user.primaryWeb3WalletId && user.web3Wallets) {
  //   const primaryWallet = user.web3Wallets.filter((wallet) => wallet.id === user.primaryWeb3WalletId)[0];
  //   if (primaryWallet) {
  //     const a = api.ethAPI.getBalance.useQuery({ address: primaryWallet.web3Wallet })
  //   }
  // }

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
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (input !== "") {
            mutate({ content: input });
          }
        }
      }}
      disabled={isPosting || !validateWealth()} />
    {input !== "" && !isPosting && (<button
      onClick={() => mutate({ content: input })}
      disabled={isPosting}>
      Post
    </button>)}
    {isPosting &&
      (<div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>)}
  </div >
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

  //const {isWealthy, setIsWealthy} = api.
  //start fetching ASAP
  api.posts.getAll.useQuery();

  //return empty div if user isn't loaded  yet
  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {!isSignedIn &&
            (<div className="flex justify-center">
              <SignInButton />
            </div>
            )}
          {!!isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
}

export default Home;
