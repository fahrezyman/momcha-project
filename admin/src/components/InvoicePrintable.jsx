import React from "react";
import { formatCurrency, formatDate, formatTime } from "@/constants";
import Image from "next/image";

const InvoicePrintable = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div ref={ref} style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "40px",
          paddingBottom: "20px",
          borderBottom: "3px solid #E08B8B",
        }}
      >
        <div>
          <Image
            src="/icon.png"
            alt="MomCha Logo"
            width={120}
            height={40}
            style={{ marginBottom: "10px" }}
          />
          <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
            Babycare
          </p>
          <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#666" }}>
            Surabaya, Indonesia
            <br />
            Phone: +62 812-3456-7890
            <br />
            Instagram: @momcha.id
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              margin: "0 0 10px 0",
            }}
          >
            INVOICE
          </h2>
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            <strong>Order Number:</strong>
            <br />
            <span
              style={{ fontSize: "20px", fontWeight: "bold", color: "#E08B8B" }}
            >
              {order.order_number}
            </span>
          </p>
          <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#666" }}>
            <strong>Date:</strong> {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      {/* Customer & Service Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginBottom: "40px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              textTransform: "uppercase",
              marginBottom: "15px",
              color: "#333",
            }}
          >
            Bill To:
          </h3>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0 0 5px 0",
            }}
          >
            {order.customer_name}
          </p>
          <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
            {order.customer_phone}
          </p>
          {order.customer_email && (
            <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
              {order.customer_email}
            </p>
          )}
          {order.customer_address && (
            <p
              style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666" }}
            >
              {order.customer_address}
            </p>
          )}
        </div>
        <div>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              textTransform: "uppercase",
              marginBottom: "15px",
              color: "#333",
            }}
          >
            Service Details:
          </h3>
          <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}>
            <strong>Date:</strong> {formatDate(order.service_date)}
          </p>
          <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}>
            <strong>Time:</strong> {formatTime(order.service_start_time)}
          </p>
          <p style={{ margin: "0", fontSize: "14px" }}>
            <strong>Duration:</strong> {order.total_duration_minutes} minutes
          </p>
        </div>
      </div>

      {/* Services Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "30px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th
              style={{
                textAlign: "left",
                padding: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderBottom: "2px solid #ddd",
              }}
            >
              Service
            </th>
            <th
              style={{
                textAlign: "center",
                padding: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderBottom: "2px solid #ddd",
              }}
            >
              Duration
            </th>
            <th
              style={{
                textAlign: "center",
                padding: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderBottom: "2px solid #ddd",
              }}
            >
              Qty
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderBottom: "2px solid #ddd",
              }}
            >
              Price
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderBottom: "2px solid #ddd",
              }}
            >
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {order.services?.map((service) => (
            <tr key={service.id}>
              <td
                style={{
                  padding: "12px",
                  fontSize: "14px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {service.service_name}
              </td>
              <td
                style={{
                  textAlign: "center",
                  padding: "12px",
                  fontSize: "14px",
                  color: "#666",
                  borderBottom: "1px solid #eee",
                }}
              >
                {service.duration_minutes}m
              </td>
              <td
                style={{
                  textAlign: "center",
                  padding: "12px",
                  fontSize: "14px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {service.quantity}
              </td>
              <td
                style={{
                  textAlign: "right",
                  padding: "12px",
                  fontSize: "14px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {formatCurrency(service.price)}
              </td>
              <td
                style={{
                  textAlign: "right",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  borderBottom: "1px solid #eee",
                }}
              >
                {formatCurrency(service.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "40px",
        }}
      >
        <div style={{ width: "300px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "15px 0",
              borderTop: "2px solid #ddd",
              fontSize: "18px",
            }}
          >
            <span style={{ fontWeight: "bold" }}>Total:</span>
            <span
              style={{
                fontWeight: "bold",
                color: "#E08B8B",
                fontSize: "24px",
              }}
            >
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h3
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            marginBottom: "15px",
          }}
        >
          Payment Information:
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            fontSize: "14px",
          }}
        >
          <div>
            <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>
              Payment Method:
            </p>
            <p style={{ margin: "5px 0 0 0", fontWeight: "bold" }}>
              QRIS (Midtrans)
            </p>
          </div>
          <div>
            <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>
              Payment Status:
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontWeight: "bold",
                color: order.payment_status === "paid" ? "#10b981" : "#f59e0b",
              }}
            >
              {order.payment_status === "paid" ? "PAID" : "PENDING"}
            </p>
          </div>
          {order.paid_at && (
            <div>
              <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>
                Paid At:
              </p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "bold" }}>
                {formatDate(order.paid_at)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "2px solid #ddd",
          paddingTop: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>
          Thank you for choosing MomCha! 💕
        </p>
        <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>
          For questions, please contact us at Instagram @momcha.id or +62
          812-3456-7890
        </p>
      </div>
    </div>
  );
});

InvoicePrintable.displayName = "InvoicePrintable";

export default InvoicePrintable;
