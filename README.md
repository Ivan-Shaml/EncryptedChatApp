# Encrypted Chat Web App 

This is an end-to-end encrypted real time chat web application.
* Based on ASP.NET Core 3.1
* Real Time functionality - SignalR based 
 
   * using **WSS** (Web Secure Socket) and **HTTPS** protocols for all data transport
   * **client side encryption/decryption via [Travis Tidwell
's jsencryp library](https://github.com/travist/jsencrypt). Using RSA Public/Private Key Pair.**

## What is End-to-end Encryption ?
End-to-end encryption (E2EE) is a system of communication where only the communicating users can read the messages. In principle, it prevents potential eavesdroppers – including telecom providers, Internet providers, Law enforcement, and even the provider of the communication service – from being able to access the cryptographic keys needed to decrypt the conversation.

In short, even me the developer, can't get your private data.

## Generate Key Pair

In Git Bash, change to your desired directory and type:

To generate private key:
```bash
openssl genrsa -out rsa_4096_priv.pem 4096
```

To generate public key:
```bash
openssl rsa -pubout -in rsa_4096_priv.pem -out rsa_4096_pub.pem
```

### Operation
After you create an account in the app, submit the PUBLIC key in the `Encryption Keys` section.
By submiting the public key, every participant of the chat will get an update on their client side JS that a new Public Key has been added to the database and will start encrtypting their messages with it.

**You can't join if you don't have a public/private key pair!**

When you open chat, the client side JS will prompt you to input your PRIVATE KEY. The private key is used to decrypt the database records loaded on page and as well as the Real Time chat communications. 

**The PRIVATE KEY stays within the context of the JS in the local browser, it is not submitted to the server!**

 After that SignalR sends you the list of the public keys and User IDs of all users, and you start encrypting the messages you send with their public keys one by one.
