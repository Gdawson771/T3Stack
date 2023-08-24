 if (!user.username && user.primaryWeb3WalletId && user.web3Wallets) {
    const primaryWallet = user.web3Wallets.filter((wallet) => wallet.id === user.primaryWeb3WalletId)[0];}
  const IsWealthy = api.ethAPI.getBalance.useQuery({address: "0x"})