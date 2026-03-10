# Relove Market – E-Preloved Exchanged Store (SaaS) 🛍️

<div align="center">

![Malaysia Preloved Marketplace](https://img.shields.io/badge/Malaysia-Preloved%20Exchange-green)
![SaaS Platform](https://img.shields.io/badge/Model-Software%20as%20a%20Service-blue)
![Laravel React](https://img.shields.io/badge/Stack-Laravel%20%2B%20React%20Vite-orange)
**License: Source Available for Review**

_A modern SaaS platform for buying and selling preloved goods in Malaysia_

[Features](#✨-key-features) • [Tech Stack](#-tech-stack) • [Demo](#-demo) • [Architecture](#-architecture) • [License](#-license)

</div>

---

## 📖 Overview

**Relove Market** is a full-featured, multi-tenant SaaS platform designed to facilitate secure and seamless preloved goods exchange in Malaysia. The platform supports a three-tier user model (Buyer, Seller, Admin) and integrates modern tools such as AI-powered visual search, real-time communication, and secure payment processing via Stripe.
---

## ✨ Key Features

### 👤 **Buyer Features**

-   **🔍 Smart Search & Filtering** – Filter by price, category, condition, and location
-   **🛒 AI-Powered Recommendations** – Personalized product suggestions based on product image similarity
-   **🖼️ Visual Search** – Upload images to find similar products
-   **💬 Real-Time Chat** – Communicate directly with sellers
-   **⭐ Reviews & Ratings** – Leave feedback on purchased items
-   **📦 Order Tracking** – Monitor order status
-   **🔐 Secure Payments** – Integrated Stripe checkout
-   **📱 PWA Support** – Install as a mobile app for better UX

### 🛠️ **Seller Features**

-   **📊 Dashboard Analytics** – Visualize sales, earnings, and order metrics with charts in real-time
-   **📈 Earnings Tracker** – Real-time revenue updates (5-minute refresh)
-   **📦 Product Management** – Add, edit, view, feature, and manage listings
-   **🧾 Order Management** – Process, update, and print order receipts
-   **📄 Report Generation** – Export earning reports by date range

### 👑 **Admin Features**

-   **📊 Admin Dashboard** – Platform-wide stats, revenue monitoring, and KPIs
-   **✅ Seller Approval System** – Review and approve/reject seller applications
-   **💰 Payment Release** – Approve and release earnings to sellers
-   **🛡️ Content Moderation** – Manage users, products, and flagged content
-   **📈 Transaction Oversight** – Monitor all platform transactions and commissions (8% fee)

---

## 🛠️ Tech Stack

| Layer         | Technology                       |
| ------------- | -------------------------------- |
| **Backend**   | Laravel 11, PHP 8.2, Supabase    |
| **Frontend**  | React 18, Vite, TailwindCSS      |
| **AI/ML**     | Python Clip Model   |
| **Real-Time** | Pusher (WebSockets)              |
| **Payments**  | Stripe API                       |
| **Database**  | Supabase (PostgreSQL)            |
| **Tools**     | Git, Figma, Postman, SweetAlert2 |

---

## 🏗️ Architecture

The platform follows a **modular SaaS architecture** with clear separation between frontend, backend, and external services:

-   **Frontend**: React PWA with Vite and TailwindCSS for responsive UI
-   **Backend**: Laravel REST API with MVC structure and role-based auth
-   **Real-Time**: Pusher channels for chat, notifications, and live updates
-   **AI Module**: Python Clip Model for visual search and recommendations
-   **Database**: Supabase for relational data

---

## 📸 Demo & Screenshots

### Buyer Experience

| Product Listing & Filtering                    | AI Visual Search                                         | Secure Checkout                                |
| ---------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| ![Shopping](./project%20resource/shopping.png) | ![Visual Search](./project%20resource/visual_search.png) | ![Checkout](./project%20resource/checkout.png) |

### Seller Dashboard

![Seller Dashboard](./project%20resource/seller_dashboard.png)

### Real-Time Chat & Mobile PWA

| Live Chat                              | Mobile PWA View                      |
| -------------------------------------- | ------------------------------------ |
| ![Chat](./project%20resource/chat.png) | ![PWA](./project%20resource/pwa.png) |

---

## 🔗 Youtube Link for Demostration
[![Watch the video](./project%20resource/home_page.png)](https://www.youtube.com/playlist?list=PL1g-r8O3UZXMblL-TWcMFa7Sa-A9IYHP5)

---

## 📌 Project Context

This project was developed as my **Final Year Degree Project** (BSc in Information Technology), showcasing full-stack development skills, system design, and integration of modern SaaS tools.

---

## 📫 Contact

If you'd like to discuss this project, collaborate, or learn more about licensing:

-   **Email**: [chengyangho14@gmail.com](mailto:chengyangho14@gmail.com)
---
