# Bitcoin Indexer

Bitcoin Indexer is a server-side application designed to read data via RPC from a blockchain node and save it into a key-value database (currently supporting RocksDB). The purpose of Bitcoin Indexer is to provide a tool that enables the quick and efficient indexing of data from the blockchain.

## Table of Contents

1. [Key Features](#key-features)
2. [Performance](#performance)
3. [How to Run](#how-to-run)
    - [a) Running from Source via Monorepo](#a-running-from-source-via-monorepo)
    - [b) Creating Your Own Indexer with `@easylayer/bitcoin-indexer`](#b-creating-your-own-indexer-with-easylayerbitcoin-indexer)

## Key Features

- **Self-Hosted Application**: Developers deploy and manage it themselves.
- **Flexible Connectivity**: Works with both your own blockchain node and custom providers like Quicknode.
- **Block Range Flexibility**: Can be started at any blockchain height range and supports real-time mode with automatic blockchain reorganization.
- **Schema Flexibility**: Developers can configure the Indexer to extract data by blocks and load the relevant information into their chosen database schema.
- **High-Performance Database**: Utilizes RocksDB for efficient and rapid data indexing and storage.
- **Configuration Management**: Managed and configured using environment variables.
- **REST API Server**: Includes a ready-to-use REST API server for accessing loaded data.
------------
- **Example applications** based on the indexer are available in the `examples` folder at the root of the `bitcoin-indexer` repository.
- Uses **Node.js** as the engine (version 18 or higher is important).

## Performance

TODO

## How to Run

### a) Running from Source

To run the project from source follow these steps:

1. **Prerequisites**: You will need [Node.js](https://nodejs.org/) v18 or higher.

2. **Clone the `bitcoin-indexer` Repository**:

    ```bash
    git clone https://github.com/easylayer/bitcoin-indexer.git
    ```

3. **Navigate to the Project Folder**:

    ```bash
    cd bitcoin-indexer
    ```

4. **Install Packages**:

    ```bash
    yarn install
    ```

5. **Build All Packages**:

    ```bash
    yarn build:dev
    ```

6. **Find Example Applications**:

    - In the `examples` folder, there are example applications; look for those related to the indexer.

7. **Create Your Own `.env` File** (for each example):

    - Update the `.env` file with your blockchain node URL or a Quicknode provider URL.

8. **Database Configuration**:

    - By default, SQLite is used without any configurations.
    - If you need PostgreSQL, specify the environment variables for PostgreSQL in the `.env` file.

9. **Run the Project**:

    - You can run the project either from the specific example folder or from the root folder.

### b) Creating Your Own Indexer with `@easylayer/bitcoin-indexer`
*Note: Detailed instructions and examples will be provided in future releases.*