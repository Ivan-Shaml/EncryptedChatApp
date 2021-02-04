# Encrypted Chat Web App 
[![Build Status](https://travis-ci.org/p4nd4ta/EncryptedChatApp.svg?branch=master)](https://travis-ci.org/p4nd4ta/EncryptedChatApp)


This is an end-to-end encrypted real time chat web application.
* Based on ASP.NET Core 3.1
* Real Time functionality - SignalR based 
 
   * using **WSS** (Web Secure Socket) and **HTTPS** protocols for all data transport
   * **client side encryption/decryption via [Travis Tidwell
's JSEncrypt library](https://github.com/travist/jsencrypt). Using RSA Public/Private Key Pair.**

## Presentation Slides
* [Google Slides Presentation](https://docs.google.com/presentation/d/1AbauGXLBdV4uF-oerZFivuX-xrY4E11HB9zsrIR7uZM/edit?usp=sharing)

## Documentation
* [GitHub Documentation Wiki Page](https://github.com/p4nd4ta/EncryptedChatApp/wiki)

## What is End-to-end Encryption ?
End-to-end encryption (E2EE) is a system of communication where only the communicating users can read the messages. In principle, it prevents potential eavesdroppers – including telecom providers, Internet providers, Law enforcement, and even the provider of the communication service – from being able to access the cryptographic keys needed to decrypt the conversation.

**In short**, even me the developer, can't get your private data.

## More on the RSA Algorithm
RSA (Rivest–Shamir–Adleman) is a public-key cryptosystem that is widely used for secure data transmission. It is also one of the oldest. The acronym RSA comes from the surnames of Ron Rivest, Adi Shamir, and Leonard Adleman, who publicly described the algorithm in 1977. An equivalent system was developed secretly, in 1973 at GCHQ (the British signals intelligence agency), by the English mathematician Clifford Cocks. That system was declassified in 1997.

In a public-key cryptosystem, the encryption key is public and distinct from the decryption key, which is kept secret (private). An RSA user creates and publishes a public key based on two large prime numbers, along with an auxiliary value. The prime numbers are kept secret. Messages can be encrypted by anyone, via the public key, but can only be decoded by someone who knows the prime numbers (private key).

The security of RSA relies on the practical difficulty of factoring the product of two large prime numbers, the "factoring problem". Breaking RSA encryption is known as the RSA problem. Whether it is as difficult as the factoring problem is an open question. **There are no published methods to defeat the system if a large enough key is used.**

## Generate Key Pair
#### Option 1:
In Git Bash, change to your desired directory and type:

To generate private key:
```bash
openssl genrsa -out rsa_2048_priv.pem 2048
```

To generate public key:
```bash
openssl rsa -pubout -in rsa_2048_priv.pem -out rsa_2048_pub.pem
```
#### Option 2:
Click on `Encryption Keys` and then `Add New Key`. You can click on `Generate Key Pair`, to call the JSEncrypt script which will generate a pair for you. Make sure you copy and save your private key, and click on `Add Public Key` .


**Disclaimer:** With the effectively more powerfull machines coming in the next years ([Moore's law](https://en.wikipedia.org/wiki/Moore%27s_law)), RSA 2048 can become vulnerable, to mitigate that use 4096 keys(realy slows down the decryption proccess if there are many messages sent), or switch to elliptical curve cryptography([EdDSA](https://en.wikipedia.org/wiki/EdDSA) algorithm for example).

### Operation
After you create an account in the app, submit the PUBLIC key in the `Encryption Keys` section.
By submiting the public key, every participant of the chat will get an update on their client side JS that a new Public Key has been added to the database and will start encrtypting their messages with it.

**You can't join if you don't have a public/private key pair!**

When you open `Chat`, the client side JS will prompt you to input your PRIVATE KEY. The private key is used to decrypt the database records loaded on page and as well as the Real Time chat communications. Also it is used to cryptographically sign the messages for authenticity.

**The PRIVATE KEY stays within the context of the JS in the local browser, it is not submitted to the server!**
After that SignalR sends you the list of the public keys and User IDs of all users, and you start encrypting the messages you send with their public keys one by one.

All messages are encrypted with the user's public key and also cryptographically signed with the private key, for authenticity, thus preventing MITM attacks and tampering.
After that you have 2 options to send messages:

**Option 1:** The message is send to all users in the chat, it is a group chat none the less.

**Option 2:** If you type a `@` symbol before typing anything in the message box, you enter `whisper mode`. Where you send your message only to a specific user. _Example:_ `@user1 message body` .

 The Messages are logged and stored for up to 3 days in the database, **but they are all encrypted with the user's public key.**


### Possible Security Vulnerabilities
* Well, in our app as well as many other web apps, the whole crypto is on JavaScript(JQuery), which is downloaded remotely from the server and ran inside the client's browser.
   
   What if somebody compromised the server and replaced the JS with something that would still work, but send your private key else where and for some 3rd party to obtain it.
* Or using [XSS](https://owasp.org/www-community/attacks/xss/) to hijack your key. We have implemented `Reflected XSS Attack` protection on the messages part, but it is only client side.
