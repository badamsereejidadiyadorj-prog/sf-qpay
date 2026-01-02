import React, { useEffect, useState } from "react";

export default function Home() {
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState("");

  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  const fetchOrders = async () => {
    const res = await fetch(
      `/api/orders/list?page=${page}&limit=${limit}&search=${search}`
    );
    const json = await res.json();
    setOrders(json.data || []);
    setTotal(json.count || 0);
  };

  useEffect(() => {
    if (logged) fetchOrders();
  }, [logged, page, search]);

  // --- LOGIN ---
  if (!logged) {
    return (
      <main style={styles.container}>
        <h2>Админ нэвтрэх</h2>
        <input
          type="password"
          placeholder="Нууц үг"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button
          style={styles.button}
          onClick={() => {
            if (password === "admin123") setLogged(true);
            else alert("Нууц үг буруу");
          }}>
          Нэвтрэх
        </button>
      </main>
    );
  }

  // --- ADMIN ---
  return (
    <main style={styles.container}>
      <h1>Захиалгын жагсаалт</h1>

      <input
        type="text"
        placeholder="Нэр, утас, бараа хайх"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        style={styles.input}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Огноо</th>
            <th>Харилцагч</th>
            <th>Утас / И-мэйл</th>
            <th>Нийт дүн</th>
            <th>Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{new Date(o.created_at).toLocaleString()}</td>
              <td>{o.customer_name}</td>
              <td>{o.email}</td>
              <td>{Number(o.total).toLocaleString()} ₮</td>
              <td>
                <button
                  style={styles.detailBtn}
                  onClick={() => {
                    setSelectedOrder(o);
                    setShowDetail(true);
                  }}>
                  Дэлгэрэнгүй
                </button>
              </td>{" "}
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div style={styles.pagination}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ⬅ Өмнөх
        </button>

        <span>
          Хуудас {page} / {Math.ceil(total / limit)}
        </span>

        <button
          disabled={page * limit >= total}
          onClick={() => setPage(page + 1)}>
          Дараах ➡
        </button>
      </div>
      {showDetail && selectedOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Захиалгын дэлгэрэнгүй</h3>

            <p>
              <strong>Харилцагч:</strong> {selectedOrder.customer_name}
            </p>
            <p>
              <strong>Утас / И-мэйл:</strong> {selectedOrder.email}
            </p>
            <p>
              <strong>Нийт дүн:</strong>{" "}
              {Number(selectedOrder.total).toLocaleString()} ₮
            </p>

            <hr />

            {(() => {
              let items = [];
              try {
                items = JSON.parse(selectedOrder.items || "[]");
              } catch (e) {
                return <p>Барааны мэдээлэл уншихад алдаа гарлаа</p>;
              }

              return items.map((item, i) => (
                <div key={i} style={styles.itemCard}>
                  {item.images?.[0] && (
                    <img src={item.images[0]} style={styles.itemImg} />
                  )}

                  <div>
                    <strong>{item.title}</strong>
                    <div>Үнэ: {item.price}</div>
                    <div>Тоо: {item.qty}</div>
                    {item.brand && <div>Брэнд: {item.brand}</div>}
                    {item.itemTag && <div>Төрөл: {item.itemTag}</div>}
                  </div>
                </div>
              ));
            })()}

            <button
              style={styles.closeBtn}
              onClick={() => setShowDetail(false)}>
              Хаах
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: 24,
  },
  input: {
    padding: 8,
    width: "100%",
    marginBottom: 12,
  },
  button: {
    padding: 10,
    width: "100%",
    background: "#ff4757",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 12,
  },
  pagination: {
    marginTop: 16,
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  detailBtn: {
    padding: "6px 10px",
    background: "#1e90ff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    background: "#fff",
    padding: 20,
    maxWidth: 700,
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
    borderRadius: 8,
  },

  itemCard: {
    display: "flex",
    gap: 12,
    marginBottom: 12,
    borderBottom: "1px solid #eee",
    paddingBottom: 10,
  },

  itemImg: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 4,
  },

  closeBtn: {
    marginTop: 12,
    padding: 10,
    width: "100%",
    background: "#ff4757",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
