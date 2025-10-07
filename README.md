<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  📝 Anvy 2.0 – Blog API

A modern, secure, and scalable Blog API built with NestJS, Prisma, and PostgreSQL.
Includes JWT authentication, role-based access, email verification, OTP-based password reset, file uploads, and rate limiting via ThrottlerModule.

🚀 Features
🔐 Authentication & Security

JWT authentication (access & refresh tokens)

Email verification via secure tokens

Account lockout after multiple failed login attempts

Role-based access control (Admin & User)

Global rate limiting using @nestjs/throttler

CORS enabled and global validation with ValidationPipe

📧 Email & OTP System

Gmail SMTP integration using Nodemailer

Email verification links

OTP (One-Time Password) system for password change and recovery

Protection against brute-force OTP attempts

🧑‍💻 User Management

Register, login, logout, profile view

Change username

Change password with OTP confirmation

Forgot password & reset with OTP

Admin-only role management and user deletion

📰 Post System

Create posts (authenticated users only)

View all posts

View user’s own posts

View single post by ID

(Future) Post deletion/editing

📁 File Uploads

Upload user avatars (JPG, JPEG, PNG)

File validation and size limit (2MB)

Static asset serving from /uploads folder

⚙️ Backend Stack

NestJS – framework

Prisma ORM – database access layer

PostgreSQL – relational database

Nodemailer – email delivery

Bcrypt – password hashing

JWT – authentication tokens

Multer – file upload handling
