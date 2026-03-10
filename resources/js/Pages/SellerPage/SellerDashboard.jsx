import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import {
    faBoxOpen,
    faCartShopping,
    faMoneyBillTrendUp,
    faBell,
    faMoneyCheck,
    faCalendarAlt,
    faTruck,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

import { Link, usePage } from "@inertiajs/react";

import React, { useEffect, useMemo, useState, useCallback } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { SellerSidebar } from "@/Components/SellerPage/SellerSidebar";
import { StatCard } from "@/Components/SellerPage/SellerDashboard/StatCard";
import { OrderStatusBadge } from "@/Components/SellerPage/SellerDashboard/OrderStatusBadge";
import { Badge } from "@/Components/SellerPage/SellerDashboard/Badge";
import { Money } from "@/Components/SellerPage/SellerDashboard/Money";
import { NotificationModal } from "@/Components/SellerPage/SellerDashboard/NotificationModal";

export default function SellerDashboard() {
    const [sellerData, setSellerData] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({});
    const [realTimeOrders, setRealTimeOrders] = useState([]);
    const [orderData, setOrderData] = useState([]);
    const [newOrders, setNewOrders] = useState(new Set());
    const [showNewOrderBadge, setShowNewOrderBadge] = useState(false);
    const [listedProducts, setListedProducts] = useState([]);
    const [timeFilter, setTimeFilter] = useState("daily"); // 'daily', 'monthly', 'yearly'
    const [featuredProducts, setFeaturedProducts] = useState([]);

    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [readNotifications, setReadNotifications] = useState(new Set());

    const { auth } = usePage().props;

    // Function to show notification
    const showNotification = useCallback(
        (message, type = "info", data = null) => {
            const newNotification = {
                id: Date.now(),
                message,
                type,
                data,
                timestamp: new Date(),
                read: false,
            };

            setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
            setNotificationCount((prev) => prev + 1);

            // Auto-remove notification after 8 seconds if unread
            const notificationId = newNotification.id;
            setTimeout(() => {
                setNotifications((prev) =>
                    prev.filter((n) => n.id !== notificationId || n.read)
                );
                setNotificationCount((prev) =>
                    Math.max(0, prev - (prev > 0 ? 1 : 0))
                );
            }, 8000);
        },
        []
    );

    // Function to filter orders for current date only
    const getTodayOrders = useCallback((orders) => {
        if (!orders || !Array.isArray(orders)) return [];

        const currentDate = new Date();
        const todayString = currentDate.toDateString();

        return orders.filter((order) => {
            if (!order.created_at) return false;

            const orderDate = new Date(order.created_at);
            return orderDate.toDateString() === todayString;
        });
    }, []);

    const handleOpenNotificationModal = () => {
        setShowNotificationModal(true);

        // Mark all current notifications as read
        const unreadNotifications = notifications.filter((n) => !n.read);
        if (unreadNotifications.length > 0) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setNotificationCount(0);
            setReadNotifications(
                (prev) =>
                    new Set([...prev, ...unreadNotifications.map((n) => n.id)])
            );
        }
    };

    // Remove individual notification
    const removeNotification = (notificationId) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setNotificationCount((prev) => Math.max(0, prev - 1));
    };

    // CALCULATE EARNINGS BASED ON TIME FILTER
    const calculateEarnings = useCallback((orders, filterType) => {
        if (!orders || !Array.isArray(orders)) return 0;

        const currentDate = new Date();

        const filteredOrders = orders.filter((order) => {
            if (!order.created_at || !order?.seller_earning[0]?.payout_amount)
                return false;

            // Only include completed order
            if (order.order_status !== "Completed") return false;

            // Must be released payout
            if (order?.seller_earning[0]?.status != "Released") return false;

            const orderDate = new Date(order.created_at);

            switch (filterType) {
                case "daily":
                    return (
                        orderDate.getDate() === currentDate.getDate() &&
                        orderDate.getMonth() === currentDate.getMonth() &&
                        orderDate.getFullYear() === currentDate.getFullYear()
                    );
                case "monthly":
                    return (
                        orderDate.getMonth() === currentDate.getMonth() &&
                        orderDate.getFullYear() === currentDate.getFullYear()
                    );
                case "yearly":
                    return (
                        orderDate.getFullYear() === currentDate.getFullYear()
                    );
                default:
                    return false;
            }
        });

        return filteredOrders.reduce((sum, order) => {
            const orderAmount =
                parseFloat(order?.seller_earning[0]?.payout_amount) || 0;
            return sum + orderAmount;
        }, 0);
    }, []);

    // CALCULATE ORDERS BASED ON TIME FILTER
    const calculateOrders = useCallback((orders, filterType) => {
        if (!orders || !Array.isArray(orders)) return 0;

        const currentDate = new Date();

        const filteredOrders = orders.filter((order) => {
            if (!order.created_at) return false;

            const orderDate = new Date(order.created_at);

            switch (filterType) {
                case "daily":
                    return (
                        orderDate.getDate() === currentDate.getDate() &&
                        orderDate.getMonth() === currentDate.getMonth() &&
                        orderDate.getFullYear() === currentDate.getFullYear()
                    );
                case "monthly":
                    return (
                        orderDate.getMonth() === currentDate.getMonth() &&
                        orderDate.getFullYear() === currentDate.getFullYear()
                    );
                case "yearly":
                    return (
                        orderDate.getFullYear() === currentDate.getFullYear()
                    );
                default:
                    return false;
            }
        });

        return filteredOrders.length;
    }, []);

    // CALCULATE CONVERSION RATE
    const calculateConversionRate = useCallback((orders, traffic) => {
        if (!traffic || traffic === 0) return 0;

        const totalOrders = orders?.length || 0;
        const conversionRate = (totalOrders / traffic) * 100;
        return parseFloat(conversionRate.toFixed(2));
    }, []);

    // CALCULATE TOTAL ORDERS
    const calculateTotalOrders = useCallback((orders) => {
        return orders?.length || 0;
    }, []);

    // CALCULATE ALL KPIs
    const calculateAllKPIs = useCallback(
        (orders, products, filterType = "monthly") => {
            const earnings = calculateEarnings(orders, filterType);
            const ordersCount = calculateOrders(orders, filterType);
            const totalOrders = calculateTotalOrders(orders);
            const conversionRate = calculateConversionRate(orders);
            const totalProducts =
                products?.filter(
                    (product) => product.product_status !== "blocked"
                ).length || 0;

            return {
                earnings,
                ordersCount,
                totalOrders,
                conversionRate,
                totalProducts,
            };
        },
        [
            calculateEarnings,
            calculateOrders,
            calculateConversionRate,
            calculateTotalOrders,
        ]
    );

    // Clear new order badge when user views orders
    const handleViewOrders = () => {
        setShowNewOrderBadge(false);
        setNewOrders(new Set());
    };

    // Add this function to refresh dashboard data
    const refreshDashboardData = useCallback(async () => {
        try {
            const { data } = await axios.get(route("dashboard-data"));
            const featured_products = await axios.get(
                route("featured-products")
            );

            setSellerData(data.seller_storeInfo[0]);
            setShop(data);
            setFeaturedProducts(featured_products.data.featured_products);

            const orders = data.order_data || [];
            const products = data.seller_storeInfo[0]?.product || [];

            const calculatedKPIs = calculateAllKPIs(
                orders,
                products,
                timeFilter
            );
            setKpis(calculatedKPIs);
            setRealTimeOrders(orders);
            setOrderData(orders);
        } catch (error) {
            console.error("Error refreshing dashboard data:", error);
        }
    }, [calculateAllKPIs, timeFilter]);

    // GENERATE EARNINGS CHART DATA BASED ON TIME FILTER
    const generateEarningsChartData = useCallback((orders, filterType) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        switch (filterType) {
            case "daily":
                // Last 7 days
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    days.push({
                        name: date.toLocaleDateString("en-US", {
                            weekday: "short",
                        }),
                        fullDate: date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        }),
                        date: new Date(date),
                    });
                }

                return days.map((day) => {
                    const dayOrders =
                        orders?.filter((order) => {
                            if (!order.created_at) return false;

                            const orderDate = new Date(order.created_at);
                            return (
                                orderDate.getDate() === day.date.getDate() &&
                                orderDate.getMonth() === day.date.getMonth() &&
                                orderDate.getFullYear() ===
                                    day.date.getFullYear()
                            );
                        }) || [];

                    // Calculate released earnings
                    const releasedEarnings = dayOrders.reduce((sum, order) => {
                        if (
                            order.order_status === "Completed" &&
                            order?.seller_earning?.[0]?.status === "Released" &&
                            order?.seller_earning[0]?.payout_amount
                        ) {
                            return (
                                sum +
                                parseFloat(
                                    order.seller_earning[0].payout_amount
                                )
                            );
                        }
                        return sum;
                    }, 0);

                    // Calculate pending earnings (completed but not released)
                    const pendingEarnings = dayOrders.reduce((sum, order) => {
                        if (
                            order.order_status === "Completed" &&
                            (!order?.seller_earning?.[0]?.status ||
                                order?.seller_earning?.[0]?.status !==
                                    "Released")
                        ) {
                            const amount =
                                parseFloat(
                                    order?.seller_earning?.[0]?.payout_amount
                                ) ||
                                parseFloat(order.amount) ||
                                0;
                            return sum + amount;
                        }
                        return sum;
                    }, 0);

                    const ordersCount = dayOrders.length;

                    return {
                        name: day.name,
                        fullName: day.fullDate,
                        earnings: parseFloat(releasedEarnings.toFixed(2)),
                        pending: parseFloat(pendingEarnings.toFixed(2)),
                        orders: ordersCount,
                    };
                });

            case "monthly":
                // Last 6 months
                const months = [];
                for (let i = 5; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    months.push({
                        name: date.toLocaleDateString("en-US", {
                            month: "short",
                        }),
                        fullName: date.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        }),
                        month: date.getMonth(),
                        year: date.getFullYear(),
                    });
                }

                return months.map((month) => {
                    const monthOrders =
                        orders?.filter((order) => {
                            if (!order.created_at) return false;
                            const orderDate = new Date(order.created_at);
                            return (
                                orderDate.getMonth() === month.month &&
                                orderDate.getFullYear() === month.year
                            );
                        }) || [];

                    // Calculate released earnings
                    const releasedEarnings = monthOrders.reduce(
                        (sum, order) => {
                            if (
                                order.order_status === "Completed" &&
                                order?.seller_earning?.[0]?.status ===
                                    "Released" &&
                                order?.seller_earning[0]?.payout_amount
                            ) {
                                return (
                                    sum +
                                    parseFloat(
                                        order.seller_earning[0].payout_amount
                                    )
                                );
                            }
                            return sum;
                        },
                        0
                    );

                    // Calculate pending earnings (completed but not released)
                    const pendingEarnings = monthOrders.reduce((sum, order) => {
                        if (
                            order.order_status === "Completed" &&
                            (!order?.seller_earning?.[0]?.status ||
                                order?.seller_earning?.[0]?.status !==
                                    "Released")
                        ) {
                            const amount =
                                parseFloat(
                                    order?.seller_earning?.[0]?.payout_amount
                                ) ||
                                parseFloat(order.amount) ||
                                0;
                            return sum + amount;
                        }
                        return sum;
                    }, 0);

                    const ordersCount = monthOrders.length;

                    return {
                        name: month.name,
                        fullName: month.fullName,
                        earnings: parseFloat(releasedEarnings.toFixed(2)),
                        pending: parseFloat(pendingEarnings.toFixed(2)),
                        orders: ordersCount,
                    };
                });

            case "yearly":
                // Last 5 years
                const years = [];
                for (let i = 4; i >= 0; i--) {
                    const year = currentYear - i;
                    years.push({
                        name: year.toString(),
                        fullName: year.toString(),
                        year: year,
                    });
                }

                return years.map((yearData) => {
                    const yearOrders =
                        orders?.filter((order) => {
                            if (!order.created_at) return false;
                            const orderDate = new Date(order.created_at);
                            return orderDate.getFullYear() === yearData.year;
                        }) || [];

                    // Calculate released earnings
                    const releasedEarnings = yearOrders.reduce((sum, order) => {
                        if (
                            order.order_status === "Completed" &&
                            order?.seller_earning?.[0]?.status === "Released" &&
                            order?.seller_earning[0]?.payout_amount
                        ) {
                            return (
                                sum +
                                parseFloat(
                                    order.seller_earning[0].payout_amount
                                )
                            );
                        }
                        return sum;
                    }, 0);

                    // Calculate pending earnings (completed but not released)
                    const pendingEarnings = yearOrders.reduce((sum, order) => {
                        if (
                            order.order_status === "Completed" &&
                            (!order?.seller_earning?.[0]?.status ||
                                order?.seller_earning?.[0]?.status !==
                                    "Released")
                        ) {
                            const amount =
                                parseFloat(
                                    order?.seller_earning?.[0]?.payout_amount
                                ) ||
                                parseFloat(order.amount) ||
                                0;
                            return sum + amount;
                        }
                        return sum;
                    }, 0);

                    const ordersCount = yearOrders.length;

                    return {
                        name: yearData.name,
                        fullName: yearData.fullName,
                        earnings: parseFloat(releasedEarnings.toFixed(2)),
                        pending: parseFloat(pendingEarnings.toFixed(2)),
                        orders: ordersCount,
                    };
                });

            default:
                return [];
        }
    }, []);

    // Generate chart data with real order data and time filter
    const earningsChartData = useMemo(() => {
        return generateEarningsChartData(orderData, timeFilter);
    }, [orderData, timeFilter, generateEarningsChartData]);

    // Custom tooltip formatter for the charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = earningsChartData.find(
                (item) => item.name === label
            );
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">
                        {dataPoint?.fullName || label}
                    </p>
                    {payload.map((entry, index) => (
                        <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                        >
                            {entry.name === "earnings"
                                ? "Released: "
                                : entry.name === "pending"
                                ? "Pending: "
                                : "Orders: "}
                            <span className="font-medium">
                                {entry.name === "earnings" ||
                                entry.name === "pending"
                                    ? `RM ${entry.value}`
                                    : entry.value}
                            </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Get filter display name
    const getFilterDisplayName = (filter) => {
        switch (filter) {
            case "daily":
                return "Daily";
            case "monthly":
                return "Monthly";
            case "yearly":
                return "Yearly";
            default:
                return "Monthly";
        }
    };

    // Update KPIs when time filter changes
    useEffect(() => {
        if (orderData.length > 0) {
            const products = sellerData?.product || [];
            const updatedKPIs = calculateAllKPIs(
                orderData,
                products,
                timeFilter
            );
            setKpis(updatedKPIs);
        }
    }, [timeFilter, orderData, sellerData, calculateAllKPIs]);

    // Fetch initial data
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const { data } = await axios.get(route("dashboard-data"));
                const featured_products = await axios.get(
                    route("featured-products")
                );

                if (!mounted) return;

                setSellerData(data.seller_storeInfo[0]);
                setShop(data);
                setFeaturedProducts(featured_products.data.featured_products);

                const orders = data.order_data || [];
                const products = data.seller_storeInfo[0]?.product || [];

                const calculatedKPIs = calculateAllKPIs(
                    orders,
                    products,
                    timeFilter
                );
                setKpis(calculatedKPIs);
                setRealTimeOrders(orders);
                setOrderData(orders);
            } catch (e) {
                console.error("Error fetching dashboard data:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [calculateAllKPIs, timeFilter]);

    // Real-time order updates with Echo - CORRECTED VERSION
    useEffect(() => {
        if (!auth?.user?.seller_id || !window.Echo) {
            console.log("Echo not available or seller_id missing");
            return;
        }

        // CORRECT CHANNEL NAME - Match what Laravel is broadcasting to
        const channelPayment = `seller.payment.${auth.user.seller_id}`;
        const channelOrders = `seller.orders.${auth.user.seller_id}`;

        const listen_channelPayment = window.Echo.private(channelPayment);
        const listen_channelOrders = window.Echo.private(channelOrders);

        window.Echo.connector.pusher.connection.bind("error", (err) => {
            console.error("❌ ECHO CONNECTION ERROR:", err);
        });

        // Enhanced Payment released notification
        listen_channelPayment.listen(".payment.released", (e) => {
            console.log("💰💰💰 PAYMENT RELEASED EVENT RECEIVED:", e);

            // Show notification
            showNotification(
                `💰 Payment Released!\nOrder #${e.seller_earning.order_id}\nAmount: RM ${e.seller_earning.payout_amount}`,
                "success"
            );

            // Refresh dashboard data to update earnings
            refreshDashboardData();
        });

        listen_channelOrders.listen(".new.order.created", (e) => {
            console.log("✅ Real-time new order received:", e);

            const newOrder = e.order;
            const orderId = newOrder.order_id;

            // Add to new orders set
            setNewOrders((prev) => {
                const newSet = new Set(prev);
                newSet.add(orderId);
                return newSet;
            });

            // Show new order badge
            setShowNewOrderBadge(true);

            // Create detailed notification message
            const productName =
                newOrder.order_items.product?.product_name || "Unknown Product";
            const customerName = newOrder.user?.name || "Unknown Customer";
            const orderAmount = newOrder.amount
                ? `RM ${newOrder.amount}`
                : "N/A";

            const notificationMessage = `🆕 New Order Received \nFrom: ${customerName}\nAmount: ${orderAmount}`;

            // Add notification
            showNotification(notificationMessage, "success", {
                type: "new_order",
                orderId,
                productName,
                customerName,
                amount: orderAmount,
            });

            // Update recent orders by prepending the new order
            setRealTimeOrders((prev) => {
                const updatedOrders = [newOrder, ...prev];
                return updatedOrders.slice(0, 5);
            });

            // Update order data for charts
            setOrderData((prev) => [newOrder, ...prev]);

            // Update KPIs
            setKpis((prev) => {
                const updatedOrders = [newOrder, ...orderData];
                const products = sellerData?.product || [];
                return calculateAllKPIs(updatedOrders, products, timeFilter);
            });
        });
    }, [auth?.user?.seller_id, showNotification, refreshDashboardData]);

    // Fetch listed products
    useEffect(() => {
        if (sellerData?.seller_store?.store_id) {
            const fetchListedProducts = async () => {
                try {
                    const response = await axios.get(
                        route("featured-products")
                    );
                    setListedProducts(response.data.featured_products || []);
                } catch (error) {
                    console.error("Error fetching listed products:", error);
                    setListedProducts([]);
                }
            };

            fetchListedProducts();
        }
    }, [sellerData?.seller_store?.store_id]);

    if (loading || !shop) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <span className="animate-spin h-5 w-5 inline-block rounded-full border-2 border-gray-300 border-t-gray-600" />
                    Loading dashboard…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <SellerSidebar />

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 md:ml-0">
                {/* Top header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                            Welcome back, {auth.seller.name || ""}!
                        </h1>
                        <div className="text-sm text-gray-500">
                            Here's what's happening today.
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto md:relative">
                        {/* Notification Bell with Modal */}
                        <div className="md:relative">
                            <button
                                className="md:relative p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                                onClick={handleOpenNotificationModal}
                            >
                                <FontAwesomeIcon
                                    icon={faBell}
                                    className="text-gray-600 h-5 w-5"
                                />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-medium shadow-lg animate-pulse">
                                        {notificationCount > 9
                                            ? "9+"
                                            : notificationCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Add Product Button */}
                        <Link
                            href={route("seller-manage-product")}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm whitespace-nowrap font-medium shadow-sm transition-colors flex items-center gap-2"
                        >
                            <FontAwesomeIcon
                                icon={faBoxOpen}
                                className="h-4 w-4"
                            />
                            Add Product
                        </Link>

                        {/* Notification Modal */}
                        <NotificationModal
                            notifications={notifications}
                            showNotificationModal={showNotificationModal}
                            setShowNotificationModal={setShowNotificationModal}
                            setNotifications={setNotifications}
                            removeNotification={removeNotification}
                        />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <StatCard
                        icon={faBoxOpen}
                        title="Products"
                        value={kpis.totalProducts || 0}
                        sub="Active listings"
                    />
                    <StatCard
                        icon={faCartShopping}
                        title="Orders"
                        value={kpis.ordersCount || 0}
                        sub={`${getFilterDisplayName(timeFilter)} orders`}
                    />
                    <StatCard
                        icon={faMoneyBillTrendUp}
                        title={`${getFilterDisplayName(timeFilter)} Earnings`}
                        value={<Money>{kpis.earnings || 0}</Money>}
                        sub={`Current ${timeFilter}`}
                    />
                </div>

                {/* Charts with order and earning data */}
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mb-6">
                    {/* Earnings Bar Chart */}
                    <div className="col-span-1 xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                            <div className="font-semibold text-gray-800">
                                {getFilterDisplayName(timeFilter)} Earnings &
                                Orders
                            </div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="text-gray-400"
                                />
                                <select
                                    value={timeFilter}
                                    onChange={(e) =>
                                        setTimeFilter(e.target.value)
                                    }
                                    className="px-3 py-1.5 w-full md:w-40 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="daily">Daily View</option>
                                    <option value="monthly">
                                        Monthly View
                                    </option>
                                    <option value="yearly">Yearly View</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-64 md:h-80">
                            {earningsChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart
                                        data={earningsChartData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#6b7280",
                                                fontSize: 12,
                                            }}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#6b7280",
                                                fontSize: 12,
                                            }}
                                            tickFormatter={(value) =>
                                                `RM${value}`
                                            }
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#6b7280",
                                                fontSize: 12,
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="earnings"
                                            fill="#4f46e5"
                                            radius={[4, 4, 0, 0]}
                                            name="earnings"
                                            maxBarSize={40}
                                        />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="pending"
                                            fill="#f59e0b"
                                            radius={[4, 4, 0, 0]}
                                            name="pending"
                                            maxBarSize={40}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="orders"
                                            fill="#10b981"
                                            radius={[4, 4, 0, 0]}
                                            name="orders"
                                            maxBarSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <BarChart
                                        size={48}
                                        className="text-gray-300 mb-3"
                                    />
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        No data available
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {orderData.length === 0
                                            ? "Start selling to see your earnings data"
                                            : "No data for the selected time period"}
                                    </p>
                                </div>
                            )}
                        </div>
                        {earningsChartData.length > 0 && (
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-indigo-600 rounded min-h-[1rem]"></div>
                                    <span className="text-xs text-gray-600">
                                        Released Earnings (RM)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-amber-500 rounded min-h-[1rem]"></div>
                                    <span className="text-xs text-gray-600">
                                        Pending Earnings (RM)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded min-h-[1rem]"></div>
                                    <span className="text-xs text-gray-600">
                                        Orders
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                        {
                            title: "Add New Product",
                            desc: "Create a new listing",
                            href: "/seller-manage-product",
                            color: "indigo",
                            icon: faBoxOpen,
                        },
                        {
                            title: "Product Earning",
                            desc: "Manage product earning",
                            href: "/seller-manage-earning",
                            color: "blue",
                            icon: faMoneyCheck,
                        },
                        {
                            title: "Order Management",
                            desc: "Checks and manage orders",
                            href: "/seller-manage-order",
                            color: "emerald",
                            icon: faTruck,
                        },
                    ].map((a) => (
                        <a
                            key={a.title}
                            href={a.href}
                            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm md:text-base">
                                        {a.title}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500">
                                        {a.desc}
                                    </div>
                                </div>
                                <span
                                    className={`h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center
                    ${a.color === "indigo" && "bg-indigo-50 text-indigo-600"}
                    ${a.color === "blue" && "bg-sky-50 text-sky-600"}
                    ${a.color === "emerald" && "bg-emerald-50 text-emerald-600"}
                  `}
                                >
                                    <FontAwesomeIcon icon={a.icon} />
                                </span>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Content Row: Recent Orders + Products Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Orders */}
                    <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                                Recent Orders
                                {showNewOrderBadge && (
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                            <Link
                                href={route("seller-manage-order")}
                                className="text-sm text-indigo-600 hover:underline"
                                onClick={handleViewOrders}
                            >
                                View all
                            </Link>
                        </div>
                        {/* Recent Orders Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="p-2">Order ID</th>
                                        <th className="p-2">Customer</th>
                                        <th className="p-2">Order Status</th>
                                        <th className="p-2">Payment</th>
                                        <th className="p-2">Total</th>
                                        <th className="p-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const todayOrders =
                                            getTodayOrders(realTimeOrders);
                                        const displayOrders = todayOrders.slice(
                                            0,
                                            5
                                        );

                                        if (displayOrders.length > 0) {
                                            return displayOrders.map(
                                                (order) => (
                                                    <tr
                                                        key={order.order_id}
                                                        className={`border-t hover:bg-gray-50 transition-colors ${
                                                            newOrders.has(
                                                                order.order_id
                                                            )
                                                                ? "bg-green-50 border-l-4 border-l-green-500"
                                                                : ""
                                                        }`}
                                                    >
                                                        <td className="p-2 font-medium text-gray-700 whitespace-nowrap">
                                                            {order.order_id}
                                                            {newOrders.has(
                                                                order.order_id
                                                            ) && (
                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    New
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-2 text-black whitespace-nowrap">
                                                            {order.user?.name ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-2">
                                                            <OrderStatusBadge
                                                                status={
                                                                    order.order_status
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            {order.payment_status ? (
                                                                <Badge color="green">
                                                                    Paid
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="orange">
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="p-2 whitespace-nowrap">
                                                            <Money>
                                                                {order.amount}
                                                            </Money>
                                                        </td>
                                                        <td className="p-2 text-black whitespace-nowrap">
                                                            {new Date(
                                                                order.created_at
                                                            ).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                )
                                            );
                                        } else {
                                            return (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        className="p-4 text-center text-gray-500"
                                                    >
                                                        <div className="flex flex-col items-center justify-center py-8">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faCartShopping
                                                                }
                                                                className="text-gray-300 h-12 w-12 mb-3"
                                                            />
                                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                                No orders today
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Orders placed
                                                                today will
                                                                appear here
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-gray-800">
                                Featured Products
                            </div>
                            <Badge color="gray">
                                {listedProducts.length} listed
                            </Badge>
                        </div>

                        {/* Show listed products with scrollbar */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {listedProducts.length > 0 ? (
                                listedProducts.map((product) => (
                                    <div
                                        key={product.product_id}
                                        className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="truncate flex-1 min-w-0">
                                            <div className="font-medium text-gray-800 truncate">
                                                {product.product_name}
                                            </div>
                                            <div className="text-xs text-gray-500 flex gap-4 flex-wrap">
                                                <span>
                                                    Stock:{" "}
                                                    {product.product_quantity ||
                                                        0}
                                                </span>
                                                <span>
                                                    Price:{" "}
                                                    <Money>
                                                        {product.product_price}
                                                    </Money>
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={`text-xs px-2 py-1 rounded flex-shrink-0 ml-2 ${
                                                product.product_status ===
                                                "available"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {product.product_status || "draft"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <FontAwesomeIcon
                                        icon={faBoxOpen}
                                        className="text-gray-300 h-12 w-12 mb-3 mx-auto"
                                    />
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        No products listed yet
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Start adding products to showcase in
                                        your store
                                    </p>
                                    <Link
                                        href="/seller-manage-product"
                                        className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
                                    >
                                        Add Your First Product
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
