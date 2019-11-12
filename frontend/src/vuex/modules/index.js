"use strict"

export default opts => ({
  blocks: require(`./blocks.ts`).default(opts),
  transactions: require(`./transactions.ts`).default(opts),
  distribution: require(`./distribution.ts`).default(opts),
  delegates: require(`./delegates.ts`).default(opts),
  delegation: require(`./delegation.ts`).default(opts),
  connection: require(`./connection.ts`).default(opts),
  notifications: require(`./notifications.js`).default(opts),
  proposals: require(`./governance/proposals.js`).default(opts),
  votes: require(`./governance/votes.js`).default(opts),
  deposits: require(`./governance/deposits.js`).default(opts),
  governanceParameters: require(`./governance/parameters.js`).default(opts),
  send: require(`./send.js`).default(opts),
  session: require(`./session.js`).default(opts),
  keystore: require(`./keystore.js`).default(opts),
  ledger: require(`./ledger.js`).default(opts),
  wallet: require(`./wallet.js`).default(opts),
  stakingParameters: require(`./parameters.js`).default(opts),
  pool: require(`./pool.js`).default(opts),
  extension: require(`./extension.js`).default(opts),
  minting: require(`./minting.js`).default(opts),
  validators: require(`./validators.js`).default(opts),
})