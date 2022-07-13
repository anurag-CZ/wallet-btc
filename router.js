const express = require('express')
const bip39 = require('bip39')
const bip32 = require('bip32')
const bitcoin = require('bitcoinjs-lib')
const hdkey = require('hdkey')

const router = express.Router()
const btctx = require('bitcoin-transaction')

const bs58 = require('base58check')

const store = require('store2')
const { sha256 } = require('bitcoinjs-lib/src/crypto')

var mnemonics
var seeds
var publickey
var privatekey 
var address

router.get('/generateKey',async (req,res) => {
  const mnemonic = bip39.generateMnemonic()
  mnemonics = mnemonic

  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex')
  seeds = seed

  const key = hdkey.fromMasterSeed(Buffer.from(seeds, 'hex'))
  const RootPrivateKey = key.privateExtendedKey;
  const RootPublicKey = key.publicExtendedKey;
  // console.log("Root Private Key: ", RootPrivateKey, "\nRoot Public Key: ", RootPublicKey);

  const keyDerive =  key.derive("m/0")
  const DerivedPublicKey = keyDerive.publicExtendedKey
  const DerivedPrivateKey = keyDerive.privateExtendedKey
  // console.log("Derived Private Key: ", DerivedPrivateKey , "\nDerived Public Key: ", DerivedPublicKey);

  await import('tiny-secp256k1').then(ecc => bip32.BIP32Factory(ecc)).then(bip32 => {
      let nodePub = bip32.fromBase58(RootPublicKey)
      let nodePri = bip32.fromBase58(RootPrivateKey)
      let childPub = nodePub.derivePath('m/0/0').__Q;
      let childPri = nodePri.derivePath('m/0/0').__D;
      let publicKey = childPub.toString('hex');
      let privateKey = childPri.toString('hex');
      
      // console.log("public Key: ", publicKey ,"\nPrivate Key: ", privateKey);
      const Address = bitcoin.payments.p2pkh({pubkey: Buffer.from(publicKey, 'hex')})
      // console.log("Address: ",address.address.toString('hex'));
      publickey = publicKey

      const pri = 'ef'.concat(privateKey)
      console.log(pri);

      const sha2 = sha256(sha256(pri))
      console.log(sha2.toString('hex'));

      const checksum = sha2.slice(0,4).toString('hex')
      console.log(checksum);

      const sastaPrivate = pri.concat(checksum)
      console.log(sastaPrivate);

      const privateKey2 = bs58.encode(sastaPrivate)
      console.log(privateKey2);

      privatekey = privateKey
      address = Address.address.toString('hex')

      
  })
  store.set(address, {mnemonic, seed, RootPrivateKey, RootPublicKey, DerivedPrivateKey, DerivedPublicKey, publickey, privatekey, address})
  res.send({mnemonic, seed,RootPrivateKey,RootPublicKey, DerivedPrivateKey, DerivedPublicKey, publickey, privatekey, address})

})


router.get('/getalldetails', (req,res) => {
  res.send(store.getAll())
})

router.post('/transfer', (req,res) => {
  let { from, to, privateKey } = req.body

  btctx.getBalance()

})


module.exports = router