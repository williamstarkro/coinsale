# How to run

First install truffle and ganache globally:

```sh
npm install -g truffle
npm install -g ganache-cli
```

Now run `ganache-cli` on port `8545`:

```sh
ganache-cli -b 3 -p 8545
```

Run the migrations (might need to compile contracts):

```sh
truffle migrate
```

Go to `/front` folder install dependencies and run the app:

```sh
cd front
yarn
yarn start
```

Web app should be available on `http://localhost:3000`.

To run the tests, simply create a new instance of ganache-cli
Then run in a new tab:

```sh
truffle test
```