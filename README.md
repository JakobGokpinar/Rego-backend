<p align="center">
    <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" align="center" width="30%">
</p>
<p align="center"><h1 align="center">REGO-BACKEND</h1></p>
<p align="center">
	<img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license">
	<img src="https://img.shields.io/github/last-commit/JakobGokpinar/Rego-backend?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/JakobGokpinar/Rego-backend?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/JakobGokpinar/Rego-backend?style=default&color=0080ff" alt="repo-language-count">
</p>

## Description

Rego-backend is the backend code for the project [www.rego.live](https://www.rego.live). 
It provides the server-side logic for a secondhand shopping website similar to ebay.com or finn.no. 
For frontend code, see [rego-frontend](https://github.com/JakobGokpinar/Rego-frontend).
The backend code handles various functionalities such as user authentication, product search, and communication between users.

## Features

### User Functions
- **Open an account**: Users can register to create a new account.
- **Log in to an existing account**: Existing users can log in with their credentials.
- **Creating an announce**: Users can create new listings for items they want to sell.
- **Previewing an announce**: Users can preview their listings.
- **Editing an announce**: Users can edit their existing listings.
- **Deleting an announce**: Users can delete their listings.

### Product Search
- **Search by title**: Search products based on their title.
- **Search by category**: Search products by category.
- **Search by price**: Filter products based on price range.
- **Search by brand**: Search products by brand.
- **Search by date**: Filter products based on the date they were added.
- **Search by location**: Search products by location.

### Additional Features
- **User authentication**: User authentication is handled using Passport.js.
- **Image uploading**: Images are uploaded using Amazon AWS S3 buckets.
- **Account verification**: Verification emails are sent to new users for account verification. Users need to verify their accounts before they can list any products.
- **Communication and chat**: Communication between users is handled using web sockets.
- **Encrypted passwords**: User passwords are stored encrypted in the database.

## Technologies Used

### Backend
- **Node.js**
- **Express.js**: Server framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling tool
- **Passport.js**: Authentication middleware
- **Amazon AWS S3**: For image storage
- **WebSockets**: For real-time communication

## Table of Contents
- [License](#license)
- [Contact](#contact)


## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contact

JakobGokpinar - [GitHub Profile](https://github.com/JakobGokpinar)
