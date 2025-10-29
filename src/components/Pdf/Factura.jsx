import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  leftHeader: {
    flexDirection: "column",
    width: "35%",
  },
  logo: {
    width: 80,
    marginBottom: 8,
  },
  centerHeader: {
    textAlign: "center",
    flex: 1,
  },
  rightHeader: {
    textAlign: "right",
    width: "35%",
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    fontWeight: "bold",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  colNum: { width: "10%" },
  colDesc: { width: "45%" },
  colPrice: { width: "15%", textAlign: "right" },
  colQty: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  totalsSection: {
    marginTop: 10,
    marginLeft: "auto",
    width: "50%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  highlight: {
    backgroundColor: "#ff0000",
    color: "#fff",
    padding: 3,
    borderRadius: 3,
    textAlign: "center",
    marginTop: 5,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#555",
  },
});

function Factura({ invoiceData }) {
  const {
    customerName,
    date,
    items,
    subtotal,
    discountAmount,
    discountType,
    discountValue,
    ivaAmount,
    ivaRate,
    total,
  } = invoiceData;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Text style={{ fontWeight: "bold" }}>Presupuesto</Text>
            <Image src="/favico.png" style={styles.logo} />
            <Text>info@chairfix.es</Text>
            <Text>(34) 685 572 880</Text>
          </View>

          <View style={styles.centerHeader}>
            <Text style={styles.docTitle}>Restauración del sillón</Text>
            <Text>{customerName || "Cliente nuevo"}</Text>
          </View>

          <View style={styles.rightHeader}>
            <Text>{date}</Text>
            <Text>INSTAGRAM @CHAIRFIX</Text>
            <Text style={{ marginTop: 8 }}>nº 12006</Text>
          </View>
        </View>

        {/* TABLA */}
        <View style={styles.tableHeader}>
          <Text style={styles.colNum}>#</Text>
          <Text style={styles.colDesc}>Descripción de servicios</Text>
          <Text style={styles.colPrice}>Precio</Text>
          <Text style={styles.colQty}>Qt.</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>

        {items.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.colNum}>{i + 1}</Text>
            <Text style={styles.colDesc}>{item.name}</Text>
            <Text style={styles.colPrice}>{item.price.toFixed(2)} €</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colTotal}>
              {(item.price * item.quantity).toFixed(2)} €
            </Text>
          </View>
        ))}

        {/* TOTALES */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text>Subtotal:</Text>
            <Text>{subtotal.toFixed(2)} €</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text>
                Descuento{" "}
                {discountType === "percent" ? `(${discountValue}%)` : ""}:
              </Text>
              <Text>-{discountAmount.toFixed(2)} €</Text>
            </View>
          )}

          {ivaAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text>IVA ({ivaRate}%):</Text>
              <Text>{ivaAmount.toFixed(2)} €</Text>
            </View>
          )}

          <View
            style={[
              styles.totalsRow,
              { marginTop: 5, borderTopWidth: 1, paddingTop: 5 },
            ]}
          >
            <Text style={{ fontWeight: "bold" }}>TOTAL:</Text>
            <Text style={{ fontWeight: "bold" }}>{total.toFixed(2)} €</Text>
          </View>

        
        </View>

        <View style={styles.footer}>
          <Text>CHAIR FIX — Restauración de sillas y sillones</Text>
        </View>
      </Page>
    </Document>
  );
}

export default Factura;
