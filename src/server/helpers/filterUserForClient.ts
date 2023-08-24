import type { User } from "@clerk/nextjs/dist/types/server";
export const filterUserForClient = (user: User) => {
    if (user?.primaryWeb3WalletId && user.web3Wallets) {
        const primaryWallet = user.web3Wallets.filter((wallet) => wallet.id === user.primaryWeb3WalletId)[0];
        if (primaryWallet) {
            return {
                id: user.id,
                username: primaryWallet.web3Wallet,
                profilePicture: user.imageUrl,
                web3:primaryWallet,
            }
        }
        else return {
            id: user.id,
            username: "Unknown",
            profilePicture: user.imageUrl,
            web3:false,
        }
    }
    return {
        id: user.id,
        username: user.username,
        profilePicture: user.imageUrl,
        web3:false,
    }
}

