[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

# QuickShop API

> Building a REST API with endpoints for e-commerce product browsing, cart management, user authentication, order placement, and category filtering. 

## Prerequisites

This project requires Node.js (version 14 or later), a package manager like npm or yarn, Postman for API testing, and a database (such as MongoDB or MySQL) for data storage and retrieval.
To make sure you have them available on your machine,
try running the following command.

```sh
node -v      
npm -v 
```

## Table of contents

- [Project Name](#quickshop-api)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Serving the app](#running-the-server)


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

1. Clone the repository:

```sh
git clone https://github.com/Bala2516/quickshop-api.git
cd e-commerce-api
```

2. Install dependencies:

```sh
npm install
```

3. Set up .env file:

```sh
MYSQL_password=your_mysql_password
MYSQL_database=onlineShopping
```

4. Create and initialize the database:

```sh
// Uncomment and run createDatabase() and createTable() in models.js
```

## Usage

### Running the Server

```sh
npm start
```

Server will start on http://localhost:3000

