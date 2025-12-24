import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { Home } from "./features/pos";
import { Login, AuthProvider } from "./features/auth";
import { Reports } from "./features/reports";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Transactions } from "./features/transactions";
import { Products, ProductDetail } from "./features/products";
import { Logs } from "./features/logHistories";
import { Categories } from "./features/productCategories";
import { StockHistory } from "./features/stockMovements";
import { PettyCash } from "./features/pettyCash";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute>
                  <Logs />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-history"
              element={
                <ProtectedRoute>
                  <StockHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/petty-cash"
              element={
                <ProtectedRoute>
                  <PettyCash />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
