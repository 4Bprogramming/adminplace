import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  invoiceTitle: {
    fontSize: 12,
    textAlign: "right",
    fontWeight: "bold",
  },
  invoiceDetails: {
    textAlign: "right",
  },
  customerSection: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingBottom: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
  },
  tableCol: {
    width: "25%",
    paddingRight: 5,
  },
  totalSection: {
    marginTop: 10,
    textAlign: "right",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    fontSize: 8,
    textAlign: "center",
    color: "#555",
  },
});

function Factura({ invoiceData }) {
  const {
    employeeId,
    customerName,
    email,
    phone,
    address,
    date,
    items,
    total,
  } = invoiceData;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Char Fix</Text>
          <Text>Char fix | Sagunto | 46500</Text>
          <Text>Email: info@charfix.com</Text>
          <Text>Tel: (123) 456-7890</Text>
        </View>

        <View style={styles.invoiceDetails}>
          <Text style={styles.invoiceTitle}>FACTURA</Text>
          <Text>Factura #: INV-2025-001</Text>
          <Text>Fecha: {date}</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <Text style={{ fontWeight: "bold" }}>Facturado a:</Text>
          <Text>{customerName}</Text>
          <Text>{email}</Text>
          <Text>{phone}</Text>
          <Text>{address}</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableCol}>Producto</Text>
          <Text style={styles.tableCol}>Cantidad</Text>
          <Text style={styles.tableCol}>Precio</Text>
          <Text style={styles.tableCol}>Total</Text>
        </View>

        {/* Table Rows */}
        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.tableCol}>{item.name}</Text>
            <Text style={styles.tableCol}>{item.quantity}</Text>
            <Text style={styles.tableCol}>${item.price.toFixed(2)}</Text>
            <Text style={styles.tableCol}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text>Total: ${total.toFixed(2)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Gracias por confiar en nosotros.</Text>
          <Text>Términos de pago: dentro de 30 días</Text>
        </View>
      </Page>
    </Document>
  );
}

export default Factura;
