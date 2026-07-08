import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Share2,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Layers,
  Check,
  AlertTriangle,
  FileText,
  UserPlus,
  History,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Facebook,
  Instagram,
  X,
  Printer,
  Copy,
  Clock,
  Filter,
  CheckCircle,
  HelpCircle,
  MessageSquare
} from "lucide-react";

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  code: string;
  size: string; // e.g. '1" x 1/8" x 6m'
  type: "Ángulos" | "PTR / Tubulares" | "Vigas / Canales" | "Varillas / Refuerzos" | "Láminas / Mallas" | "Herrajes / Otros";
  pricePerPza: number;
  pricePerMeter?: number;
  pricePerKg?: number;
  weightFactor?: number; // kg per meter
  stock: number;
  minStock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitType: "pza" | "metro" | "kg";
  customLength?: number; // in meters if custom
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
}

interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: "entrada" | "merma" | "ajuste" | "venta";
  quantity: number;
  unit: string;
  note: string;
  date: string;
}

interface Sale {
  id: string;
  ticketNumber: string;
  date: string;
  items: {
    productName: string;
    quantity: number;
    unitType: string;
    price: number;
    total: number;
  }[];
  subtotal: number;
  iva: number;
  total: number;
  paymentMethod: "Efectivo" | "Transferencia" | "Tarjeta";
  clientName?: string;
  clientPhone?: string;
  operator: string;
  profitEstimated: number;
}

// --- INITIAL DATA ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Ángulo de Acero Comercial",
    code: "ANG118",
    size: "1\" x 1/8\" x 6m",
    type: "Ángulos",
    pricePerPza: 345.00,
    pricePerMeter: 65.00,
    pricePerKg: 42.00,
    weightFactor: 1.4, // kg per meter
    stock: 45,
    minStock: 10
  },
  {
    id: "p2",
    name: "PTR Cuadrado Calibre 14",
    code: "PTR22",
    size: "2\" x 2\" x 6m",
    type: "PTR / Tubulares",
    pricePerPza: 890.00,
    pricePerMeter: 160.00,
    pricePerKg: 48.00,
    weightFactor: 3.1,
    stock: 12,
    minStock: 5
  },
  {
    id: "p3",
    name: "Tubo Cédula 40 Negro",
    code: "TUBC40",
    size: "1 1/2\" Diámetro x 6m",
    type: "PTR / Tubulares",
    pricePerPza: 1240.00,
    pricePerMeter: 220.00,
    stock: 3, // Low stock on purpose
    minStock: 5
  },
  {
    id: "p4",
    name: "Solera de Acero",
    code: "SOL316",
    size: "3/16\" x 2\" x 6m",
    type: "Vigas / Canales",
    pricePerPza: 215.50,
    pricePerMeter: 40.00,
    pricePerKg: 38.00,
    weightFactor: 0.95,
    stock: 88,
    minStock: 15
  },
  {
    id: "p5",
    name: "Viga IPR Estructural",
    code: "VIGIPR",
    size: "4\" x 4\" x 12m",
    type: "Vigas / Canales",
    pricePerPza: 4500.00,
    pricePerMeter: 395.00,
    pricePerKg: 45.00,
    weightFactor: 9.5,
    stock: 5,
    minStock: 2
  },
  {
    id: "p6",
    name: "Varilla Corrugada de Grado 42",
    code: "VAR38",
    size: "3/8\" Diámetro x 9m",
    type: "Varillas / Refuerzos",
    pricePerPza: 145.00,
    pricePerMeter: 18.00,
    pricePerKg: 28.00,
    weightFactor: 0.56,
    stock: 120,
    minStock: 30
  },
  {
    id: "p7",
    name: "Lámina Galvanizada R-101",
    code: "LAM101",
    size: "Medida 3 x 10 pies",
    type: "Láminas / Mallas",
    pricePerPza: 580.00,
    stock: 22,
    minStock: 8
  },
  {
    id: "p8",
    name: "Disco de Corte Esmeril",
    code: "DIS412",
    size: "4 1/2\" x 1/16\" metal",
    type: "Herrajes / Otros",
    pricePerPza: 45.00,
    stock: 150,
    minStock: 20
  }
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Felipe Cardona",
    phone: "5512345678",
    email: "felipe.estructuras@gmail.com",
    company: "Estructuras Metálicas Cardona",
    notes: "Cliente frecuente. Prefiere pago por transferencia."
  },
  {
    id: "c2",
    name: "María Gómez",
    phone: "3398765432",
    email: "maria.arq@outlook.com",
    company: "Proyectos y Diseños Arq",
    notes: "Desarrolladora de condominios. Solicita e-ticket siempre."
  },
  {
    id: "c3",
    name: "Ing. Arturo Mendoza",
    phone: "8122334455",
    email: "amendoza@acerosnorte.mx",
    company: "Constructora Delta",
    notes: "Compra volúmenes grandes de vigas e IPR."
  }
];

const INITIAL_LOGS: InventoryLog[] = [
  {
    id: "l1",
    productId: "p1",
    productName: "Ángulo de Acero Comercial",
    type: "entrada",
    quantity: 50,
    unit: "Pzas",
    note: "Abastecimiento mensual del distribuidor nacional",
    date: "2026-07-01T09:00:00"
  },
  {
    id: "l2",
    productId: "p3",
    productName: "Tubo Cédula 40 Negro",
    type: "merma",
    quantity: 2,
    unit: "Pzas",
    note: "Daño por doblez incorrecto durante descarga",
    date: "2026-07-05T14:30:00"
  }
];

const INITIAL_SALES: Sale[] = [
  {
    id: "s1",
    ticketNumber: "FAC-1001",
    date: "2026-07-08T08:15:00-07:00",
    items: [
      { productName: "Ángulo de Acero Comercial", quantity: 2, unitType: "pza", price: 345.00, total: 690.00 },
      { productName: "PTR Cuadrado Calibre 14", quantity: 1, unitType: "pza", price: 890.00, total: 890.00 }
    ],
    subtotal: 1580.00,
    iva: 252.80,
    total: 1832.80,
    paymentMethod: "Transferencia",
    clientName: "Felipe Cardona",
    clientPhone: "5512345678",
    operator: "Juan Pérez",
    profitEstimated: 316.56
  },
  {
    id: "s2",
    ticketNumber: "FAC-1002",
    date: "2026-07-08T09:40:00-07:00",
    items: [
      { productName: "Varilla Corrugada de Grado 42", quantity: 10, unitType: "pza", price: 145.00, total: 1450.00 },
      { productName: "Disco de Corte Esmeril", quantity: 5, unitType: "pza", price: 45.00, total: 225.00 }
    ],
    subtotal: 1675.00,
    iva: 268.00,
    total: 1943.00,
    paymentMethod: "Efectivo",
    clientName: "Público General",
    operator: "Juan Pérez",
    profitEstimated: 388.60
  }
];

export default function App() {
  // --- STATE ---
  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem("ferro_products");
    return local ? JSON.parse(local) : INITIAL_PRODUCTS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const local = localStorage.getItem("ferro_clients");
    return local ? JSON.parse(local) : INITIAL_CLIENTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const local = localStorage.getItem("ferro_sales");
    return local ? JSON.parse(local) : INITIAL_SALES;
  });

  const [logs, setLogs] = useState<InventoryLog[]>(() => {
    const local = localStorage.getItem("ferro_logs");
    return local ? JSON.parse(local) : INITIAL_LOGS;
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<"ventas" | "inventario" | "clientes" | "reportes">("ventas");

  // Search and Category states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  // Active Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Cash status
  const [cashRegisterTotal, setCashRegisterTotal] = useState(4250.0);

  // Modals / Overlays
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isInventoryAdjustmentModalOpen, setIsInventoryAdjustmentModalOpen] = useState(false);
  const [inventoryProductTarget, setInventoryProductTarget] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"entrada" | "merma">("entrada");
  const [adjustmentQty, setAdjustmentQty] = useState(1);
  const [adjustmentNote, setAdjustmentNote] = useState("");

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Transferencia" | "Tarjeta">("Efectivo");
  const [cashReceived, setCashReceived] = useState("");

  // Receipt viewer modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastRecordedSale, setLastRecordedSale] = useState<Sale | null>(null);

  // Notification Banner State
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // Filter for reports tab
  const [reportFilter, setReportFilter] = useState<"dia" | "semana" | "mes">("dia");

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    localStorage.setItem("ferro_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("ferro_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("ferro_sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("ferro_logs", JSON.stringify(logs));
  }, [logs]);

  // Alert dismiss helper
  const triggerNotification = (message: string, type: "success" | "info" | "warning") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- SMART PREDICTIVE SEARCH ---
  // Returns products with fuzzy search or predictive matching
  const predictiveProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== "Todos") {
      list = list.filter((p) => p.type === selectedCategory);
    }
    if (!searchQuery.trim()) return list;

    const queryLower = searchQuery.toLowerCase().trim();
    return list.filter((p) => {
      const matchName = p.name.toLowerCase().includes(queryLower);
      const matchCode = p.code.toLowerCase().includes(queryLower);
      const matchSize = p.size.toLowerCase().includes(queryLower);
      const matchType = p.type.toLowerCase().includes(queryLower);
      return matchName || matchCode || matchSize || matchType;
    });
  }, [products, searchQuery, selectedCategory]);

  // Suggested keywords based on available profiles
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return ["Ángulo", "PTR", "Tubo", "Solera", "Varilla", "Lámina", "Grado 42"];
    const queryLower = searchQuery.toLowerCase();
    const allKeywords = ["ángulo", "ptr", "tubo", "solera", "viga", "varilla", "lámina", "herrajes", "disco", "corte", "cedula 40", "comercial"];
    return allKeywords.filter(k => k.includes(queryLower) && k !== queryLower).slice(0, 4);
  }, [searchQuery]);

  // Low stock alerts list
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock);
  }, [products]);

  // --- CART OPERATIONS ---
  const handleAddToCart = (product: Product, unitType: "pza" | "metro" | "kg" = "pza") => {
    if (product.stock <= 0) {
      triggerNotification(`¡Alerta! No hay stock disponible para ${product.name}`, "warning");
    }

    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.unitType === unitType
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: 1, unitType }]);
    }
    triggerNotification(`Se agregó ${product.name} (${unitType.toUpperCase()}) al carrito`, "success");
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      const item = cart[index];
      const updated = cart.filter((_, i) => i !== index);
      setCart(updated);
      triggerNotification(`Se removió ${item.product.name} del carrito`, "info");
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const handleRemoveFromCart = (index: number) => {
    const item = cart[index];
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    triggerNotification(`Se quitó ${item.product.name} (${item.unitType})`, "info");
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient(null);
  };

  // --- PRICING CALCULATION IN CART ---
  const getItemPrice = (item: CartItem) => {
    const p = item.product;
    if (item.unitType === "pza") {
      return p.pricePerPza;
    } else if (item.unitType === "metro") {
      return p.pricePerMeter || (p.pricePerPza / 6); // fallback standard 6m piece ratio
    } else if (item.unitType === "kg") {
      if (p.pricePerKg) return p.pricePerKg;
      // fallback calculated price by weight factor
      const weightFactor = p.weightFactor || 1.5;
      const pricePerMeter = p.pricePerMeter || (p.pricePerPza / 6);
      return Math.round((pricePerMeter / weightFactor) * 10) / 10;
    }
    return p.pricePerPza;
  };

  const cartSummary = useMemo(() => {
    let subtotal = 0;
    cart.forEach((item) => {
      subtotal += getItemPrice(item) * item.quantity;
    });
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [cart]);

  // --- REQUISITE CHECKOUT PROCESS ---
  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      triggerNotification("El carrito está vacío", "warning");
      return;
    }
    setCashReceived("");
    setPaymentMethod("Efectivo");
    setIsCheckoutModalOpen(true);
  };

  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate random Ticket Number e.g. FAC-1084
    const ticketNo = `FAC-${Math.floor(1000 + Math.random() * 9000)}`;

    const saleItems = cart.map((item) => {
      const price = getItemPrice(item);
      return {
        productName: `${item.product.name} ${item.product.size}`,
        quantity: item.quantity,
        unitType: item.unitType,
        price,
        total: Math.round(price * item.quantity * 100) / 100
      };
    });

    const newSale: Sale = {
      id: `s-${Date.now()}`,
      ticketNumber: ticketNo,
      date: new Date().toISOString(),
      items: saleItems,
      subtotal: cartSummary.subtotal,
      iva: cartSummary.iva,
      total: cartSummary.total,
      paymentMethod,
      clientName: selectedClient ? selectedClient.name : "Público General",
      clientPhone: selectedClient?.phone || undefined,
      operator: "Juan Pérez",
      profitEstimated: Math.round(cartSummary.subtotal * 0.20 * 100) / 100 // standard 20% steel average markup profit
    };

    // Update inventories
    const updatedProducts = products.map((prod) => {
      // find total sold for this product in current cart
      const cartEntries = cart.filter((item) => item.product.id === prod.id);
      if (cartEntries.length === 0) return prod;

      let totalPzasDeducted = 0;
      cartEntries.forEach((entry) => {
        if (entry.unitType === "pza") {
          totalPzasDeducted += entry.quantity;
        } else if (entry.unitType === "metro") {
          // 6 meters is a standard piece
          totalPzasDeducted += entry.quantity / 6;
        } else if (entry.unitType === "kg") {
          // weight translation
          const kgPerMeter = entry.product.weightFactor || 1.5;
          const meters = entry.quantity / kgPerMeter;
          totalPzasDeducted += meters / 6;
        }
      });

      const newStock = Math.max(0, Math.round((prod.stock - totalPzasDeducted) * 100) / 100);

      // Add simple movement log
      const newInventoryLog: InventoryLog = {
        id: `l-sales-${Date.now()}-${prod.id}`,
        productId: prod.id,
        productName: prod.name,
        type: "venta",
        quantity: Math.round(totalPzasDeducted * 100) / 100,
        unit: "Pzas eq.",
        note: `Venta POS #${ticketNo}`,
        date: new Date().toISOString()
      };
      setLogs((prev) => [newInventoryLog, ...prev]);

      return {
        ...prod,
        stock: newStock
      };
    });

    setProducts(updatedProducts);

    // Save sales state
    setSales((prevSales) => [newSale, ...prevSales]);

    // Update cash register if payment is cash
    if (paymentMethod === "Efectivo") {
      setCashRegisterTotal((prev) => prev + cartSummary.total);
    }

    setLastRecordedSale(newSale);
    setCart([]);
    setIsMobileCartOpen(false);
    setIsCheckoutModalOpen(false);
    setIsReceiptModalOpen(true);
    triggerNotification(`Venta ${ticketNo} realizada con éxito`, "success");
  };

  // --- INVENTORY ADJUSTMENT HANDLERS ---
  const handleOpenAdjustment = (prod: Product, type: "entrada" | "merma") => {
    setInventoryProductTarget(prod);
    setAdjustmentType(type);
    setAdjustmentQty(1);
    setAdjustmentNote("");
    setIsInventoryAdjustmentModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryProductTarget) return;

    const modifier = adjustmentType === "entrada" ? adjustmentQty : -adjustmentQty;
    const finalStock = Math.max(0, inventoryProductTarget.stock + modifier);

    const updatedProducts = products.map((p) => {
      if (p.id === inventoryProductTarget.id) {
        return { ...p, stock: finalStock };
      }
      return p;
    });
    setProducts(updatedProducts);

    // Log the movement
    const newMovementLog: InventoryLog = {
      id: `l-adj-${Date.now()}`,
      productId: inventoryProductTarget.id,
      productName: inventoryProductTarget.name,
      type: adjustmentType === "entrada" ? "entrada" : "merma",
      quantity: adjustmentQty,
      unit: "Pzas",
      note: adjustmentNote || (adjustmentType === "entrada" ? "Carga express de inventario" : "Ajuste por corte de material"),
      date: new Date().toISOString()
    };
    setLogs((prev) => [newMovementLog, ...prev]);

    setIsInventoryAdjustmentModalOpen(false);
    triggerNotification(`Inventario actualizado para ${inventoryProductTarget.name}`, "success");
  };

  // --- EXPRESS REGISTERING OF PRODUCTS ---
  const handleOpenProductCreate = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
    } else {
      setEditingProduct({
        id: "",
        name: "",
        code: "",
        size: "",
        type: "Ángulos",
        pricePerPza: 0,
        pricePerMeter: 0,
        pricePerKg: 0,
        weightFactor: 1.0,
        stock: 0,
        minStock: 5
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      // Edit mode
      const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
      setProducts(updated);
      triggerNotification(`Producto ${editingProduct.name} modificado`, "success");
    } else {
      // Create mode
      const newProd: Product = {
        ...editingProduct,
        id: `p-${Date.now()}`,
        code: editingProduct.code || `PROD-${Math.floor(100 + Math.random() * 900)}`
      };
      setProducts([...products, newProd]);
      triggerNotification(`Nuevo producto registrado: ${newProd.name}`, "success");
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto del catálogo?")) {
      setProducts(products.filter((p) => p.id !== id));
      triggerNotification("Producto eliminado del catálogo", "info");
    }
  };

  // --- EXPRESS CLIENT REGISTER ---
  const handleOpenClientCreate = (cli: Client | null = null) => {
    if (cli) {
      setEditingClient(cli);
    } else {
      setEditingClient({
        id: "",
        name: "",
        phone: "",
        email: "",
        company: "",
        notes: ""
      });
    }
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (editingClient.id) {
      // Edit
      const updated = clients.map((c) => (c.id === editingClient.id ? editingClient : c));
      setClients(updated);
      triggerNotification(`Cliente ${editingClient.name} actualizado`, "success");
    } else {
      // Create
      const newCli: Client = {
        ...editingClient,
        id: `c-${Date.now()}`
      };
      setClients([...clients, newCli]);
      triggerNotification(`Cliente registrado: ${newCli.name}`, "success");
    }
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este contacto?")) {
      setClients(clients.filter((c) => c.id !== id));
      triggerNotification("Contacto eliminado de la agenda", "info");
    }
  };

  // --- REPORTS AND CAJA COMPUTATIONS ---
  const reportTotals = useMemo(() => {
    const now = new Date();
    let filteredSales = sales;

    if (reportFilter === "dia") {
      // Today only
      const todayStr = now.toISOString().split("T")[0];
      filteredSales = sales.filter((s) => s.date.startsWith(todayStr));
    } else if (reportFilter === "semana") {
      // Last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filteredSales = sales.filter((s) => new Date(s.date) >= oneWeekAgo);
    } else if (reportFilter === "mes") {
      // Current calendar month
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      filteredSales = sales.filter((s) => {
        const d = new Date(s.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }

    let totalVentas = 0;
    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalTarjeta = 0;
    let estimatedProfit = 0;

    filteredSales.forEach((s) => {
      totalVentas += s.total;
      estimatedProfit += s.profitEstimated;
      if (s.paymentMethod === "Efectivo") totalEfectivo += s.total;
      else if (s.paymentMethod === "Transferencia") totalTransferencia += s.total;
      else if (s.paymentMethod === "Tarjeta") totalTarjeta += s.total;
    });

    return {
      salesCount: filteredSales.length,
      totalVentas: Math.round(totalVentas * 100) / 100,
      totalEfectivo: Math.round(totalEfectivo * 100) / 100,
      totalTransferencia: Math.round(totalTransferencia * 100) / 100,
      totalTarjeta: Math.round(totalTarjeta * 100) / 100,
      estimatedProfit: Math.round(estimatedProfit * 100) / 100,
      list: filteredSales
    };
  }, [sales, reportFilter]);

  // One-click cash cut
  const handlePerformCashCut = () => {
    const todayStr = new Date().toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const message = `--- ARQUEO / CORTE DE CAJA DIARIO ---\nFecha: ${todayStr}\nOperador: Juan Pérez\nCaja Inicial: $4,250.00\nVentas en Efectivo del Día: $${reportTotals.totalEfectivo}\nFondo Actualizado en Caja: $${cashRegisterTotal}\nVentas Totales (Todos los medios): $${reportTotals.totalVentas}\nGanancia Estimada: $${reportTotals.estimatedProfit}\n\n¿Deseas guardar y reiniciar el saldo acumulado en efectivo de la caja a $4,250.00?`;

    if (confirm(message)) {
      setCashRegisterTotal(4250.00);
      triggerNotification("Se realizó el cierre de caja diario. Saldo inicial restablecido.", "success");
    }
  };

  // WhatsApp link generator
  const getWhatsAppLink = (sale: Sale) => {
    const text = `*Ferretería de Aceros y Perfiles*\n_¡Gracias por su compra!_ \n\n*Ticket:* ${sale.ticketNumber}\n*Fecha:* ${new Date(sale.date).toLocaleDateString()}\n*Cliente:* ${sale.clientName}\n\n*Productos:*\n${sale.items.map(item => `- ${item.quantity} ${item.unitType.toUpperCase()} x ${item.productName}: $${item.total}`).join("\n")}\n\n*Subtotal:* $${sale.subtotal}\n*IVA (16%):* $${sale.iva}\n*TOTAL:* $${sale.total}\n*Método de Pago:* ${sale.paymentMethod}\n\n_Para cualquier duda, responda a este chat_`;
    const encoded = encodeURIComponent(text);
    const phone = sale.clientPhone ? sale.clientPhone.replace(/\D/g, '') : '';
    // Send to specific contact or general share
    return phone ? `https://api.whatsapp.com/send?phone=52${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
  };

  // Mail share fallback
  const getMailLink = (sale: Sale) => {
    const subject = `Comprobante de compra Ferretería de Aceros ${sale.ticketNumber}`;
    const body = `Hola ${sale.clientName},\n\nLe adjuntamos el resumen de su compra:\n\nTicket: ${sale.ticketNumber}\nTotal: $${sale.total}\nMétodo de Pago: ${sale.paymentMethod}\n\n¡Gracias por su preferencia!\nFerretería de Aceros`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div id="app-container" className="flex h-screen w-full bg-[#F1F5F9] overflow-hidden font-sans">

      {/* LEFT SIDEBAR NAVIGATION */}
      <nav id="sidebar-nav" className="hidden md:flex w-20 bg-[#1E293B] flex-col items-center py-6 gap-8 shrink-0">
        {/* Brand Rounded Logo */}
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/40 cursor-pointer" title="Ferretería POS">
          <Layers className="w-7 h-7 text-white" />
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col gap-6">
          <button
            id="btn-nav-ventas"
            onClick={() => setActiveTab("ventas")}
            className={`p-3 rounded-xl transition-all relative ${
              activeTab === "ventas"
                ? "bg-slate-700/80 text-orange-500 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
            title="Módulo de Ventas"
          >
            <DollarSign className="w-6 h-6" />
            {activeTab === "ventas" && (
              <span className="absolute right-1 top-1 w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
            )}
          </button>

          <button
            id="btn-nav-inventario"
            onClick={() => setActiveTab("inventario")}
            className={`p-3 rounded-xl transition-all relative ${
              activeTab === "inventario"
                ? "bg-slate-700/80 text-orange-500 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
            title="Inventario y Catálogo"
          >
            <Package className="w-6 h-6" />
            {lowStockProducts.length > 0 && (
              <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>

          <button
            id="btn-nav-clientes"
            onClick={() => setActiveTab("clientes")}
            className={`p-3 rounded-xl transition-all relative ${
              activeTab === "clientes"
                ? "bg-slate-700/80 text-orange-500 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
            title="Clientes & Proveedores"
          >
            <Users className="w-6 h-6" />
          </button>

          <button
            id="btn-nav-reportes"
            onClick={() => setActiveTab("reportes")}
            className={`p-3 rounded-xl transition-all relative ${
              activeTab === "reportes"
                ? "bg-slate-700/80 text-orange-500 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
            title="Reportes & Caja"
          >
            <TrendingUp className="w-6 h-6" />
          </button>
        </div>

        {/* Quick External Socials Shortcuts at bottom of sidebar */}
        <div className="mt-auto flex flex-col gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-slate-500 hover:text-[#1877F2] bg-slate-800/30 hover:bg-slate-800 transition-colors"
            title="Atender Inbox Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-slate-500 hover:text-[#E4405F] bg-slate-800/30 hover:bg-slate-800 transition-colors"
            title="Responder Cotizaciones Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
        </div>
      </nav>

      {/* MAIN LAYOUT (Header + Tab Content + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* TOP STATUS NOTIFICATIONS */}
        {notification && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl transition-all animate-bounce bg-slate-900 text-white border-l-4 border-orange-500">
            {notification.type === "warning" ? (
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
        )}

        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-xl">
            {activeTab === "ventas" ? (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm transition-all"
                  placeholder="Buscar perfil, medida o código (ej. Ángulo 1x1/8)..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
                  {activeTab === "inventario" && <><Package className="text-orange-500" /> Catálogo e Inventario Simplificado</>}
                  {activeTab === "clientes" && <><Users className="text-orange-500" /> Directorio de Clientes Frecuentes</>}
                  {activeTab === "reportes" && <><TrendingUp className="text-orange-500" /> Control Diarizado de Reportes & Caja</>}
                </h1>
                <p className="text-xs text-slate-400 font-medium">Ferretería de Aceros S.A. de C.V.</p>
              </div>
            )}
          </div>

          {/* Quick status displays */}
          <div className="ml-4 flex items-center gap-5">
            {/* Quick stock warning shortcut */}
            {lowStockProducts.length > 0 && (
              <div
                onClick={() => {
                  setActiveTab("inventario");
                  setSelectedCategory("Todos");
                  setSearchQuery("");
                }}
                className="hidden md:flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-red-100 transition-colors"
                title="Ver productos con bajo stock"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                <span>{lowStockProducts.length} Stock Bajo</span>
              </div>
            )}

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">Operador: Juan Pérez</p>
              <p className="text-xs text-green-600 font-bold flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                Caja Abierta • ${cashRegisterTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center border border-orange-300">
              JP
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL POR TAB */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] pb-20 md:pb-0">

          {/* TAB 1: VENTAS (POS) */}
          {activeTab === "ventas" && (
            <div className="p-6 flex flex-col h-full">

              {/* Predictor bar shortcut indicators */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Buscador Predictivo:</span>
                {searchSuggestions.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(kw)}
                    className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 rounded-lg text-xs font-semibold transition-all capitalize"
                  >
                    {kw}
                  </button>
                ))}
              </div>

              {/* Categories Navigation Pills */}
              <div className="flex gap-2 overflow-x-auto pb-3 shrink-0">
                {["Todos", "Ángulos", "PTR / Tubulares", "Vigas / Canales", "Varillas / Refuerzos", "Láminas / Mallas", "Herrajes / Otros"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid de Productos */}
              {predictiveProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200 mt-4">
                  <Package className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold text-lg">No encontramos productos con ese término</p>
                  <p className="text-slate-400 text-sm max-w-sm text-center mt-1">Prueba escribiendo "ángulo", "PTR", "tubular" o agrega un producto nuevo al catálogo</p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("Todos"); }}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-4 pb-20">
                  {predictiveProducts.map((p) => {
                    const isLowStock = p.stock <= p.minStock;
                    return (
                      <div
                        key={p.id}
                        id={`product-card-${p.id}`}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 group relative transition-all hover:border-orange-500 hover:shadow-md"
                      >
                        {/* Profile steel geometry render representation */}
                        <div className="h-28 bg-slate-50 rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden border border-slate-100">
                          {p.type === "Ángulos" && (
                            <div className="w-16 h-16 border-l-8 border-b-8 border-slate-700 rounded-bl-sm transform rotate-45"></div>
                          )}
                          {p.type === "PTR / Tubulares" && p.name.includes("PTR") && (
                            <div className="w-14 h-14 border-4 border-slate-700 rounded-md"></div>
                          )}
                          {p.type === "PTR / Tubulares" && p.name.includes("Tubo") && (
                            <div className="w-14 h-14 border-4 border-slate-700 rounded-full"></div>
                          )}
                          {p.type === "Vigas / Canales" && (
                            <div className="flex flex-col items-center">
                              <div className="w-14 h-2 bg-slate-700"></div>
                              <div className="w-2.5 h-10 bg-slate-700"></div>
                              <div className="w-14 h-2 bg-slate-700"></div>
                            </div>
                          )}
                          {p.type === "Varillas / Refuerzos" && (
                            <div className="w-20 h-3 bg-slate-400 border-2 border-dashed border-slate-600 rounded-full"></div>
                          )}
                          {p.type === "Láminas / Mallas" && (
                            <div className="grid grid-cols-4 gap-1 w-16 h-12">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="border border-slate-400"></div>
                              ))}
                            </div>
                          )}
                          {p.type === "Herrajes / Otros" && (
                            <div className="w-12 h-12 rounded-full border-4 border-orange-400 border-t-transparent animate-spin-slow"></div>
                          )}
                          <span className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {p.code}
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{p.type}</span>
                            {isLowStock && (
                              <span className="px-2 py-0.5 bg-red-100 text-[9px] font-black text-red-600 uppercase tracking-wider rounded">Stock Bajo</span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mt-0.5" title={p.name}>{p.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">{p.size}</p>
                        </div>

                        {/* Pricing details by unit */}
                        <div className="space-y-1 pt-1 border-t border-slate-100">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Pieza (Caja/Tramo):</span>
                            <span className="font-bold text-slate-800">${p.pricePerPza}</span>
                          </div>
                          {p.pricePerMeter && (
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>Tramo (Corte/Metro):</span>
                              <span className="font-bold text-slate-800">${p.pricePerMeter}/m</span>
                            </div>
                          )}
                          {p.pricePerKg && (
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>Por peso (kg):</span>
                              <span className="font-bold text-slate-800">${p.pricePerKg}/kg</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="text-left">
                            <span className="text-[10px] block text-slate-400 font-bold uppercase">STOCK DISP.</span>
                            <span className={`text-sm font-black ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                              {p.stock} pzas
                            </span>
                          </div>

                          {/* Action drop-ups/buttons to select units and insert into cart */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAddToCart(p, "pza")}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 text-[10px] font-bold rounded-lg transition-all"
                              title="Vender por Pieza"
                            >
                              Pza
                            </button>
                            {p.pricePerMeter && (
                              <button
                                onClick={() => handleAddToCart(p, "metro")}
                                className="px-2 py-1.5 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 text-[10px] font-bold rounded-lg transition-all"
                                title="Vender por Metro"
                              >
                                Metros
                              </button>
                            )}
                            {p.pricePerKg && (
                              <button
                                onClick={() => handleAddToCart(p, "kg")}
                                className="px-2 py-1.5 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 text-[10px] font-bold rounded-lg transition-all"
                                title="Vender por Peso"
                              >
                                Kg
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVENTARIO / CATALOGO */}
          {activeTab === "inventario" && (
            <div className="p-6 space-y-6">

              {/* Dashboard metrics widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Productos en Catálogo</span>
                    <h4 className="text-3xl font-black text-slate-800 mt-1">{products.length}</h4>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Valor Total del Inventario</span>
                    <h4 className="text-3xl font-black text-slate-800 mt-1">
                      ${products.reduce((acc, curr) => acc + (curr.stock * curr.pricePerPza), 0).toLocaleString("es-MX", { maximumFractionDigits: 2 })}
                    </h4>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Alertas de Reabastecimiento</span>
                    <h4 className={`text-3xl font-black mt-1 ${lowStockProducts.length > 0 ? "text-red-500" : "text-green-600"}`}>
                      {lowStockProducts.length} perfiles
                    </h4>
                  </div>
                  <div className={`p-3 rounded-xl ${lowStockProducts.length > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Express Products Registry and Catalog Controls */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Catálogo Completo de Productos</h3>
                    <p className="text-xs text-slate-400">Edita información básica de productos o realiza entradas/ajustes rápidos de stock</p>
                  </div>
                  <button
                    onClick={() => handleOpenProductCreate(null)}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/10 transition-all self-start sm:self-center"
                  >
                    <Plus className="w-4 h-4" /> REGISTRAR NUEVO PERFIL
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase bg-slate-50/50">
                        <th className="py-3 px-5">Código / Perfil</th>
                        <th className="py-3 px-5">Tipo de Acero</th>
                        <th className="py-3 px-5">Medida</th>
                        <th className="py-3 px-5 text-right">Precio Pza</th>
                        <th className="py-3 px-5 text-right">Precio m / kg</th>
                        <th className="py-3 px-5 text-center">Stock Actual</th>
                        <th className="py-3 px-5 text-center">Estado</th>
                        <th className="py-3 px-5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {products.map((p) => {
                        const isLow = p.stock <= p.minStock;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="font-bold text-slate-800">{p.name}</div>
                              <div className="text-xs font-mono text-slate-400">{p.code}</div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                                {p.type}
                              </span>
                            </td>
                            <td className="py-4 px-5 font-medium text-slate-600">{p.size}</td>
                            <td className="py-4 px-5 text-right font-bold text-slate-900">${p.pricePerPza.toFixed(2)}</td>
                            <td className="py-4 px-5 text-right text-xs text-slate-500 font-medium">
                              {p.pricePerMeter ? `$${p.pricePerMeter}/m` : "—"} / {p.pricePerKg ? `$${p.pricePerKg}/kg` : "—"}
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className={`font-mono text-base font-black ${isLow ? "text-red-600" : "text-slate-800"}`}>
                                {p.stock}
                              </span>
                              <span className="text-xs text-slate-400 font-medium block">Pzas</span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              {isLow ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase">
                                  <AlertTriangle className="w-3 h-3 text-red-500" /> REABASTECER
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">
                                  <Check className="w-3 h-3 text-green-500" /> ÓPTIMO
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Inventory fast adjustments */}
                                <button
                                  onClick={() => handleOpenAdjustment(p, "entrada")}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Entrada de mercancía"
                                >
                                  <ArrowUpRight className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleOpenAdjustment(p, "merma")}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  title="Registrar merma o corte"
                                >
                                  <ArrowDownLeft className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleOpenProductCreate(p)}
                                  className="p-1 text-slate-500 hover:bg-slate-100 rounded text-xs font-bold"
                                  title="Editar producto"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                                  title="Eliminar del catálogo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LOGS / HISTORIAL DE MOVIMIENTOS RAPIDOS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <History className="text-orange-500" /> Historial de Movimientos de Inventario
                    </h3>
                    <p className="text-xs text-slate-400">Entradas de mercancía, mermas por corte y ajustes recientes</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-8">Aún no hay movimientos de inventario registrados.</p>
                  ) : (
                    logs.map((log) => {
                      const isAddition = log.type === "entrada";
                      const isVenta = log.type === "venta";
                      return (
                        <div key={log.id} className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg self-start ${
                              isAddition
                                ? "bg-green-100 text-green-700"
                                : isVenta
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {isAddition ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : isVenta ? (
                                <DollarSign className="w-4 h-4" />
                              ) : (
                                <ArrowDownLeft className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{log.productName}</p>
                              <p className="text-xs text-slate-500 font-medium">
                                <span className="font-bold text-slate-600 capitalize">{log.type}:</span> {log.note}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono text-sm font-black ${isAddition ? "text-green-600" : isVenta ? "text-blue-600" : "text-red-500"}`}>
                              {isAddition ? "+" : "-"}{log.quantity} {log.unit}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">
                              {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CONTACTOS Y DIRECTORIO */}
          {activeTab === "clientes" && (
            <div className="p-6 space-y-6">

              {/* Redes sociales quick integration guides */}
              <div className="bg-[#1E293B] text-white p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <span className="text-[10px] text-orange-400 font-black uppercase tracking-wider">Integración de Canales de Venta</span>
                  <h3 className="text-xl font-bold mt-1 text-orange-100">Atención a Redes Sociales & Inbox</h3>
                  <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                    Copie los tickets digitales directos y use las redes integradas para cotizar o enviar confirmaciones al instante. Responda a los prospectos de Facebook Marketplace o Instagram DM desde los accesos rápidos.
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com/messages"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Facebook className="w-4 h-4" /> IR A FACEBOOK INBOX
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#E4405F] hover:bg-[#D33651] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Instagram className="w-4 h-4" /> IR A INSTAGRAM DM
                  </a>
                </div>
              </div>

              {/* Directory view */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Directorio Express de Clientes</h3>
                    <p className="text-xs text-slate-400">Mantén los datos de tus clientes habituales a un toque de distancia para enviarle tickets digitales</p>
                  </div>
                  <button
                    onClick={() => handleOpenClientCreate(null)}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/10 transition-all self-start sm:self-center"
                  >
                    <UserPlus className="w-4 h-4" /> AGREGAR NUEVO CONTACTO
                  </button>
                </div>

                {clients.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">Agenda de contactos vacía</p>
                    <p className="text-slate-400 text-xs mt-1">Registra tu primer cliente frecuente para asociar ventas y enviar comprobantes por WhatsApp</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
                    {clients.map((cli) => (
                      <div
                        key={cli.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-orange-400 hover:shadow-sm transition-all flex flex-col justify-between gap-4"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-bold flex items-center justify-center border border-orange-200 uppercase">
                              {cli.name.substring(0, 2)}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleOpenClientCreate(cli)}
                                className="p-1 text-slate-500 hover:bg-slate-100 rounded text-xs font-bold"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClient(cli.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3">
                            <h4 className="font-bold text-slate-800 text-base">{cli.name}</h4>
                            {cli.company && (
                              <p className="text-xs text-orange-600 font-bold">{cli.company}</p>
                            )}
                          </div>

                          <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                            <p><strong>WhatsApp:</strong> +52 {cli.phone}</p>
                            {cli.email && <p><strong>Correo:</strong> {cli.email}</p>}
                            {cli.notes && <p className="text-[11px] italic text-slate-400 mt-1">"{cli.notes}"</p>}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex gap-2">
                          {/* Quick assign action button for active checkout cart */}
                          <button
                            onClick={() => {
                              setSelectedClient(cli);
                              triggerNotification(`Cliente ${cli.name} asociado a la venta actual`, "success");
                              setActiveTab("ventas");
                            }}
                            className="flex-1 py-2 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all text-center"
                          >
                            Asociar a Carrito
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?phone=52${cli.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 rounded-xl transition-colors"
                            title="Enviar mensaje rápido por WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: REPORTES & CAJA DIARIOS */}
          {activeTab === "reportes" && (
            <div className="p-6 space-y-6">

              {/* Filters for dynamic query periods */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700">
                  <Filter className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold">Rendimiento Temporal:</span>
                </div>
                <div className="flex gap-1.5">
                  {(["dia", "semana", "mes"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setReportFilter(mode)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        reportFilter === mode
                          ? "bg-orange-500 text-white shadow"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {mode === "dia" ? "Día" : mode === "semana" ? "Semana" : "Mes"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Metric Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Ventas Consolidadas</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-slate-800">${reportTotals.totalVentas.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs text-slate-400">MXN</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-500">
                    Calculado para {reportFilter === "dia" ? "el día de hoy" : reportFilter === "semana" ? "los últimos 7 días" : "el mes en curso"}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-green-600 font-black uppercase tracking-wider block">Ganancia Estimada</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-green-600">${reportTotals.estimatedProfit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs text-green-400">MXN</span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-400">
                    Basado en margen promedio del 20%
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Número de Transacciones</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-slate-800">{reportTotals.salesCount}</span>
                    <span className="text-xs text-slate-400">tickets</span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-400">
                    Ticket promedio: ${reportTotals.salesCount > 0 ? (reportTotals.totalVentas / reportTotals.salesCount).toFixed(2) : "0.00"}
                  </div>
                </div>

                {/* Cash Drawer status */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Fondo de Efectivo en Caja</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">${cashRegisterTotal.toLocaleString("es-MX")}</div>
                  </div>
                  <button
                    onClick={handlePerformCashCut}
                    className="w-full mt-3 py-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all text-center"
                  >
                    HACER CORTE DE CAJA AHORA
                  </button>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider text-slate-400">Canales de Pago</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span> Efectivo
                        </span>
                        <span className="font-bold text-slate-900">${reportTotals.totalEfectivo}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${reportTotals.totalVentas > 0 ? (reportTotals.totalEfectivo / reportTotals.totalVentas) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Transferencia SPEI
                        </span>
                        <span className="font-bold text-slate-900">${reportTotals.totalTransferencia}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${reportTotals.totalVentas > 0 ? (reportTotals.totalTransferencia / reportTotals.totalVentas) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> Tarjeta
                        </span>
                        <span className="font-bold text-slate-900">${reportTotals.totalTarjeta}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${reportTotals.totalVentas > 0 ? (reportTotals.totalTarjeta / reportTotals.totalVentas) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales list breakdown history */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider text-slate-400">Listado de Tickets</h3>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {reportTotals.list.length === 0 ? (
                      <p className="text-center text-slate-400 text-xs py-10">No se encontraron ventas para este período.</p>
                    ) : (
                      reportTotals.list.map((sale) => (
                        <div
                          key={sale.id}
                          className="p-3.5 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50 hover:bg-slate-50 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                {sale.ticketNumber}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {new Date(sale.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 mt-1">
                              {sale.clientName} ({sale.items.length} conceptos)
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                            <div className="text-left sm:text-right">
                              <span className="text-sm font-black text-slate-900 block">${sale.total.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400 block capitalize">{sale.paymentMethod}</span>
                            </div>

                            <button
                              onClick={() => {
                                setLastRecordedSale(sale);
                                setIsReceiptModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-600 text-xs font-bold rounded-lg transition-all"
                            >
                              Ver Ticket
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* BOTTOM ACTIVITY BAR */}
        <footer className="h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex gap-6 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              Sistema POS en Línea
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Operador de Turno: Juan Pérez
            </span>
            <span className="hidden md:flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Local: {new Date().toLocaleDateString("es-MX")}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setActiveTab("reportes");
                setReportFilter("dia");
              }}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              Resumen Diario
            </button>
            <button
              onClick={handlePerformCashCut}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cierre Caja
            </button>
          </div>
        </footer>

      </div>

      {/* RIGHT SIDEBAR - SHOPPING CART (Only visible when active tab is POS/Ventas) */}
      <aside className={`bg-white border-slate-200 flex-col shrink-0 ${activeTab !== "ventas" ? "hidden" : "flex"} ${isMobileCartOpen ? "fixed inset-0 z-40 w-full h-full" : "hidden lg:flex lg:w-96 lg:static lg:border-l"}`}>
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">Orden de Venta Actual</h2>
            <p className="text-xs text-slate-400">Soporte multi-unidades de acero</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-200/60 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all"
              title="Cerrar Carrito"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={clearCart}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
              title="Limpiar Orden"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Selected Customer tag indicator */}
        <div className="px-6 py-3 border-b border-slate-100 bg-orange-50/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-slate-700 font-bold">
              {selectedClient ? selectedClient.name : "Público General"}
            </span>
          </div>
          {selectedClient ? (
            <button
              onClick={() => setSelectedClient(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600"
            >
              Desasociar
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("clientes")}
              className="text-[10px] text-orange-600 hover:text-orange-700 font-bold uppercase"
            >
              Asociar Cliente
            </button>
          )}
        </div>

        {/* Cart items list */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <Layers className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold text-sm">El carrito está vacío</p>
              <p className="text-slate-300 text-xs mt-1 max-w-[200px]">Agrega productos del catálogo para cotizar o cobrar</p>
            </div>
          ) : (
            cart.map((item, index) => {
              const itemPrice = getItemPrice(item);
              const lineTotal = itemPrice * item.quantity;
              return (
                <div key={index} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/40">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{item.product.size}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(index)}
                      className="text-slate-300 hover:text-red-500 p-0.5 rounded transition-colors"
                      title="Quitar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1.5 mt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => handleUpdateCartQty(index, item.quantity - 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-black text-slate-800 min-w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateCartQty(index, item.quantity + 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="px-1.5 py-0.5 bg-orange-100 rounded text-[9px] font-black uppercase text-orange-600 block w-max ml-auto mb-1">
                        {item.unitType === "pza" ? "Piezas" : item.unitType === "metro" ? "Metros" : "Kg"}
                      </span>
                      <span className="text-xs font-black text-slate-900">${lineTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Subtotal summaries */}
        <div className="p-6 bg-slate-50 rounded-t-3xl border-t border-slate-200 shadow-[0_-8px_30px_rgb(0,0,0,0.03)] shrink-0">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Subtotal</span>
              <span>${cartSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>IVA (16%)</span>
              <span>${cartSummary.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL</span>
              <span>${cartSummary.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleOpenCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 text-white rounded-2xl text-base font-black shadow-lg transition-all ${
              cart.length === 0
                ? "bg-slate-300 shadow-none cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/10 hover:shadow-orange-500/20"
            }`}
          >
            REGISTRAR COBRO (${cartSummary.total.toFixed(2)})
          </button>
        </div>
      </aside>

      {/* MODAL: EXPRESS CHECKOUT CONFIRMATION */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800">Finalizar Operación de Venta</h3>
                <p className="text-xs text-slate-400">Total a liquidar: ${cartSummary.total.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSale} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Método de Liquidación</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Efectivo", "Transferencia", "Tarjeta"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        paymentMethod === method
                          ? "bg-orange-500 border-orange-500 text-white shadow"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "Efectivo" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Monto Recibido</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      required
                      placeholder="0.00"
                      className="block w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm font-bold"
                    />
                  </div>
                  {Number(cashReceived) > 0 && (
                    <div className="p-3 bg-green-50 rounded-xl flex justify-between items-center border border-green-100">
                      <span className="text-xs font-bold text-green-700">Cambio a entregar:</span>
                      <span className="text-base font-black text-green-800">
                        ${Math.max(0, Number(cashReceived) - cartSummary.total).toFixed(2)} MXN
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Cliente asociado:</span>
                  <span className="font-bold text-slate-700">{selectedClient ? selectedClient.name : "Público General"}</span>
                </div>
                {selectedClient?.phone && (
                  <div className="flex justify-between">
                    <span>Celular WhatsApp:</span>
                    <span className="font-mono font-bold text-slate-700">+52 {selectedClient.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span className="font-bold text-slate-700">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10"
                >
                  COMPLETAR TRANSACCIÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TICKET / COMPROBANTE DIGITAL VIEW */}
      {isReceiptModalOpen && lastRecordedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-black text-slate-800">Ticket Digital Emitido</h3>
                <p className="text-xs text-slate-400">Entrega rápida sin papel</p>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Paper Invoice Style */}
            <div className="p-6 bg-slate-50/80 border-b border-slate-100">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 font-mono text-xs text-slate-700 space-y-4">
                <div className="text-center">
                  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wide">Ferretería de Aceros</h4>
                  <p className="text-[10px] text-slate-400">Aceros Comerciales y Estructurales</p>
                  <p className="text-[9px] text-slate-400">Tel: (812) 233-4455 • Monterrey, N.L.</p>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>TICKET:</span>
                    <span className="font-bold">{lastRecordedSale.ticketNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FECHA:</span>
                    <span>{new Date(lastRecordedSale.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLIENTE:</span>
                    <span className="font-bold uppercase max-w-[150px] truncate">{lastRecordedSale.clientName}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
                  <div className="font-bold text-[10px] text-slate-500 uppercase pb-1">Conceptos Adquiridos</div>
                  {lastRecordedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between gap-2">
                      <span className="flex-1">
                        {item.quantity} {item.unitType.toUpperCase()} x {item.productName}
                      </span>
                      <span className="font-bold shrink-0">${item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>${lastRecordedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (16%):</span>
                    <span>${lastRecordedSale.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 border-t border-slate-100 pt-1">
                    <span>TOTAL COMPRA:</span>
                    <span>${lastRecordedSale.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 text-center text-[10px] text-slate-400 uppercase">
                  <span>¡Gracias por su preferencia!</span>
                </div>
              </div>
            </div>

            {/* Fast Digital Tickets native buttons for sharing directly via WhatsApp or email */}
            <div className="p-6 space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Compartir Ticket Digital al Instante</span>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={getWhatsAppLink(lastRecordedSale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 bg-white border border-slate-200 hover:border-green-500 text-slate-700 hover:text-green-600 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-green-500" /> WhatsApp
                </a>

                <a
                  href={getMailLink(lastRecordedSale)}
                  className="py-3 bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-blue-500" /> Correo
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Ticket: ${lastRecordedSale.ticketNumber}\nTotal: $${lastRecordedSale.total}\nCliente: ${lastRecordedSale.clientName}`);
                    triggerNotification("Resumen del ticket copiado al portapapeles", "success");
                  }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar Resumen
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir copia
                </button>
              </div>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
              >
                Cerrar Ticket e Iniciar Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER / EDIT PRODUCT */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {editingProduct.id ? "Modificar Perfil de Acero" : "Registrar Nuevo Perfil"}
                </h3>
                <p className="text-xs text-slate-400">Complete los campos mínimos requeridos</p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre o Perfil *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Ej. Ángulo de Acero Estructural o Tubo Cédula"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Acero *</label>
                  <select
                    value={editingProduct.type}
                    onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value as any })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {["Ángulos", "PTR / Tubulares", "Vigas / Canales", "Varillas / Refuerzos", "Láminas / Mallas", "Herrajes / Otros"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medida / Especificación *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.size}
                    onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder='Ej. 1 1/2" x 3/16" x 6m'
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código Corto / SKU</label>
                  <input
                    type="text"
                    value={editingProduct.code}
                    onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm font-mono"
                    placeholder="Ej. ANG15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio por Pieza *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.pricePerPza || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePerPza: Number(e.target.value) })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm font-bold"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio por Metro (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.pricePerMeter || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePerMeter: e.target.value ? Number(e.target.value) : undefined })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Dejar vacío si no aplica"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio por Kg (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.pricePerKg || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePerKg: e.target.value ? Number(e.target.value) : undefined })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Dejar vacío si no aplica"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso Teórico (kg/metro)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.weightFactor || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weightFactor: e.target.value ? Number(e.target.value) : undefined })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Ej. 1.4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Alerta Mínimo *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.minStock || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK INVENTORY ADJUSTMENT (ENTRADA / MERMA) */}
      {isInventoryAdjustmentModalOpen && inventoryProductTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {adjustmentType === "entrada" ? "Registrar Entrada de Mercancía" : "Ajuste por Merma / Recorte"}
                </h3>
                <p className="text-xs text-slate-400">{inventoryProductTarget.name}</p>
              </div>
              <button
                onClick={() => setIsInventoryAdjustmentModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cantidad (Pzas Completas)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nota o Concepto de Ajuste</label>
                <textarea
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  placeholder={adjustmentType === "entrada" ? "Ej. Surtido de distribuidor" : "Ej. Tramo de merma inservible por doblado"}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm min-h-16 resize-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Stock Anterior:</span>
                  <span className="font-bold text-slate-700">{inventoryProductTarget.stock} pzas</span>
                </div>
                <div className="flex justify-between">
                  <span>Modificación:</span>
                  <span className={`font-bold ${adjustmentType === "entrada" ? "text-green-600" : "text-red-500"}`}>
                    {adjustmentType === "entrada" ? `+${adjustmentQty}` : `-${adjustmentQty}`} pzas
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span>Proyección final:</span>
                  <span className="font-black text-slate-800">
                    {adjustmentType === "entrada" ? inventoryProductTarget.stock + adjustmentQty : Math.max(0, inventoryProductTarget.stock - adjustmentQty)} pzas
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInventoryAdjustmentModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10"
                >
                  Aplicar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER / EDIT CLIENT */}
      {isClientModalOpen && editingClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {editingClient.id ? "Modificar Contacto" : "Registrar Cliente Frecuente"}
                </h3>
                <p className="text-xs text-slate-400">Mantenga sus clientes integrados para envío de comprobantes</p>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Ej. Felipe Cardona"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Compañía / Negocio (Opcional)</label>
                <input
                  type="text"
                  value={editingClient.company || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Ej. Estructuras Metálicas Cardona"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono WhatsApp (10 dígitos) *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm font-mono"
                  placeholder="Ej. 5512345678"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Obligatorio para que funcione la mensajería nativa.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  value={editingClient.email || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas de Preferencias</label>
                <textarea
                  value={editingClient.notes || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  placeholder="Ej. Solicita factura, prefiere transferencias o retira en almacén..."
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm min-h-16 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10"
                >
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING CART BUTTON FOR MOBILE SCREEN */}
      {activeTab === "ventas" && cart.length > 0 && (
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 z-30 bg-orange-500 hover:bg-orange-600 text-white font-black px-4 py-3.5 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-2 animate-bounce"
        >
          <Layers className="w-5 h-5 text-white" />
          <span>Ver Carrito ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
          <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
            ${cartSummary.total.toFixed(2)}
          </span>
        </button>
      )}

      {/* RESPONSIVE BOTTOM NAVIGATION BAR FOR MOBILE SCREENS */}
      <nav id="bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1E293B] border-t border-slate-800 flex justify-around items-center z-40 px-2 shadow-2xl">
        <button
          onClick={() => { setActiveTab("ventas"); setIsMobileCartOpen(false); }}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all relative ${
            activeTab === "ventas" ? "text-orange-500 font-bold scale-105" : "text-slate-400"
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Ventas</span>
          {activeTab === "ventas" && (
            <span className="absolute bottom-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("inventario"); setIsMobileCartOpen(false); }}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all relative ${
            activeTab === "inventario" ? "text-orange-500 font-bold scale-105" : "text-slate-400"
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Almacén</span>
          {lowStockProducts.length > 0 && (
            <span className="absolute top-2 right-3 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          {activeTab === "inventario" && (
            <span className="absolute bottom-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("clientes"); setIsMobileCartOpen(false); }}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all relative ${
            activeTab === "clientes" ? "text-orange-500 font-bold scale-105" : "text-slate-400"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Clientes</span>
          {activeTab === "clientes" && (
            <span className="absolute bottom-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("reportes"); setIsMobileCartOpen(false); }}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all relative ${
            activeTab === "reportes" ? "text-orange-500 font-bold scale-105" : "text-slate-400"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Corte</span>
          {activeTab === "reportes" && (
            <span className="absolute bottom-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          )}
        </button>
      </nav>

    </div>
  );
}
