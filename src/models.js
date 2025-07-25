const mysql = require("mysql2/promise")
const dotenv = require("dotenv")
dotenv.config()

let createDB = {
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_password,
}

let db = {
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_password,
    database: process.env.MYSQL_database,
}

let createDatabase = async () => {
    try {
        let connection = await mysql.createConnection(createDB)
        console.log("connected")
        let sql = `create database onlineShopping`
        await connection.query(sql)
        console.log("database created")
    } catch (error) {
        console.log("Database not created")
    }
}
// createDatabase()

let createTable = async () => {
    try {
        let connection = await mysql.createConnection(db)
        console.log("connected")
        let userTable = `create table userDetails(
                userid varchar(50) UNIQUE,
                id int AUTO_INCREMENT PRIMARY KEY ,
                username varchar(20) NOT NULL ,
                mobileno varchar(50) NOT NULL UNIQUE,
                address varchar(20) NOT NULL,
                emailId varchar(50) NOT NULL UNIQUE,
                is_admin boolean,
                created_at varchar(50) NOT NULL)`
        await connection.query(userTable)
        let adminTable = `create table admin(
                id int AUTO_INCREMENT PRIMARY KEY,
                user_id int ,
                username varchar(20) NOT NULL ,
                mobileno varchar(50) NOT NULL ,
                emailId varchar(50) NOT NULL ,
                foreign key(user_id) references userDetails(id)
                )`
        await connection.query(adminTable)
        let registerTable = `create table register(
                id int AUTO_INCREMENT primary key,
                mobileno varchar(100) UNIQUE,
                otp int,
                expire_otp varchar(50),
                foreign key(id) references userDetails(id)
                )`
        await connection.query(registerTable)
        let authenticateTable = `create table authenticate(
                id int AUTO_INCREMENT primary key,
                userId varchar(100),
                token varchar(300),
                created_at varchar(50),
                updated_at varchar(50),
                foreign key(id) references userDetails(id))`
        await connection.query(authenticateTable)
        let categoryTable = `create table category (
                id int AUTO_INCREMENT primary key,
                category_name varchar(100) NOT NULL UNIQUE,
                created_at varchar(50)
                )`
        await connection.query(categoryTable)
        let productTable = `create table products (
                id int AUTO_INCREMENT primary key,
                name varchar(100) NOT NULL,
                description varchar(200),
                price int,
                stock int,
                category_id int,
                created_at varchar(50),
                updated_at varchar(50),
                foreign key (category_id) references category(id)
                )`
        await connection.query(productTable)
        let orderTable = `CREATE TABLE orders (
                id int AUTO_INCREMENT primary key,
                user_id int,
                product_id int,
                quantity int,
                price int,
                status varchar(20) default 'pending',
                category varchar(100) NOT NULL,
                product varchar(100) NOT NULL,
                order_date TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES userDetails(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
                )`
        await connection.query(orderTable)
        let cartTable = `create table cart (
                id int AUTO_INCREMENT primary key,
                user_id int NOT NULL,
                product_id int NOT NULL,
                quantity int NOT NULL,
                price int,
                created_at varchar(50),
                updated_at varchar(50),
                FOREIGN KEY (user_id) references userDetails(id),
                FOREIGN KEY (product_id) references products(id)
                )`
        await connection.query(cartTable)
        console.log("table created")
    } catch (error) {
        console.log(error)
        console.log("table creation failed")
    }
}
// createTable()     

let alter = async () => {
    try {
        let connection = await mysql.createConnection(db)
        console.log("connected")
        let sql = `alter table userdetails modify is_admin BOOLEAN`
        await connection.query(sql)
        console.log("successfully altered")
    } catch (error) {
        console.log(error)
    }
}
// alter()

let alterTable=async () => {
    try {
        let connection=await mysql.createConnection(db)
        console.log("connected")
        let sql=`alter table authenticate drop column logedIn`
        await connection.query(sql)
        console.log("column added")
    } catch (error) {
        console.log(error)
    }
}
// alterTable()

module.exports = { db, mysql }

