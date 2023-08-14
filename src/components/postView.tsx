
import Image from "next/image";
import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import type { RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="p-4 border-b border-slate-400 flex items-center gap-2 ">
      <Image
        src={author.profilePicture}
        className="rounded-full h-14 w-14"
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56} />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <Link href={`/@${author.username}`}>
            <span>
              {`@${author.username}`}
            </span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="text-slate-400">{` · ${dayjs(post.createdAt).fromNow()}`} </span>
          </Link>
          {/* <div className="text-slate-400">{` · ${dayjs(post.createdAt).fromNow()}`}</div> */}
        </div>
        <span className="break-words">
          {post.content}
        </span>
      </div>
    </div>)
}
