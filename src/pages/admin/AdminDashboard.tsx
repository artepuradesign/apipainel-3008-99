import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Package,
  ShoppingCart,
  DollarSign,
  LogOut,
  Plus,
  List,
  Clock,
  FolderTree,
  Menu,
  ChevronDown,
  User,
} from "lucide-react";
import { fetchAdminStats, fetchAdminPedidos, AdminPedido } from "@/services/adminApi";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser") || sessionStorage.getItem("adminUser");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (user) {
      try {
        const parsed = JSON.parse(user);
        setAdminUser({ name: parsed.nome ?? parsed.name ?? "Admin", email: parsed.email ?? "" });
      } catch {
        // ignore
      }
    }
  }, [navigate]);

  // Buscar estatísticas
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  // Buscar pedidos recentes
  const { data: pedidosData, isLoading: loadingPedidos } = useQuery({
    queryKey: ["admin-pedidos-recentes"],
    queryFn: () => fetchAdminPedidos(5, 1),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aguardando_pagamento: "Aguardando",
      pendente: "Pendente",
      pago: "Pago",
      preparando: "Preparando",
      enviado: "Enviado",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aguardando_pagamento: "bg-yellow-100 text-yellow-700",
      pendente: "bg-yellow-100 text-yellow-700",
      pago: "bg-green-100 text-green-700",
      preparando: "bg-blue-100 text-blue-700",
      enviado: "bg-purple-100 text-purple-700",
      entregue: "bg-green-100 text-green-700",
      cancelado: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const statsCards = [
    {
      title: "Total de Vendas",
      value: stats ? formatCurrency(stats.totalVendas) : "R$ 0,00",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Pedidos",
      value: stats?.totalPedidos?.toString() ?? "0",
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Produtos",
      value: stats?.totalProdutos?.toString() ?? "0",
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Categorias",
      value: stats?.totalCategorias?.toString() ?? "0",
      icon: FolderTree,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header - Mobile optimized like reference image */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container py-3">
          {/* Top row - Menu, Logo, User, Cart */}
          <div className="flex items-center justify-between">
            {/* Left - Menu + Logo */}
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-foreground hover:text-primary py-2">
                      <DollarSign className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <Link to="/admin/produtos" className="flex items-center gap-2 text-foreground hover:text-primary py-2">
                      <Package className="w-5 h-5" />
                      Produtos
                    </Link>
                    <Link to="/admin/categorias" className="flex items-center gap-2 text-foreground hover:text-primary py-2">
                      <FolderTree className="w-5 h-5" />
                      Categorias
                    </Link>
                    <Link to="/admin/pedidos" className="flex items-center gap-2 text-foreground hover:text-primary py-2">
                      <ShoppingCart className="w-5 h-5" />
                      Pedidos
                    </Link>
                    <hr className="my-2" />
                    <button onClick={handleLogout} className="flex items-center gap-2 text-destructive py-2">
                      <LogOut className="w-5 h-5" />
                      Sair
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
              <Link to="/" className="flex items-center">
                <span className="text-lg font-bold text-primary">iPlace</span>
                <span className="text-xs text-muted-foreground ml-1">seminovos</span>
              </Link>
            </div>

            {/* Right - User dropdown + Cart (mobile) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
              <Link to="/carrinho" className="p-2 relative lg:hidden">
                <ShoppingCart className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Desktop - Title and logout */}
          <div className="hidden lg:flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">Painel Administrativo</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Olá, {adminUser?.name || "Admin"}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4 lg:py-8 flex-1">
        {/* Quick Actions - responsive grid */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:gap-4 mb-6 lg:mb-8">
          <Button asChild size="sm" className="lg:size-default">
            <Link to="/admin/produtos/novo">
              <Plus className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Novo</span> Produto
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="lg:size-default">
            <Link to="/admin/produtos">
              <Package className="w-4 h-4 mr-1 lg:mr-2" />
              Produtos
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="lg:size-default">
            <Link to="/admin/categorias">
              <FolderTree className="w-4 h-4 mr-1 lg:mr-2" />
              Categorias
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="lg:size-default">
            <Link to="/admin/pedidos">
              <List className="w-4 h-4 mr-1 lg:mr-2" />
              Pedidos
            </Link>
          </Button>
        </div>

        {/* Stats Grid - responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs lg:text-sm text-muted-foreground truncate">{stat.title}</p>
                    {loadingStats ? (
                      <Skeleton className="h-6 lg:h-8 w-16 lg:w-24 mt-1" />
                    ) : (
                      <p className="text-lg lg:text-2xl font-bold mt-1 truncate">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-2 lg:p-3 rounded-full bg-muted ${stat.color} flex-shrink-0`}>
                    <stat.icon className="w-4 h-4 lg:w-6 lg:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders - mobile optimized */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between px-4 lg:px-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
              Pedidos Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/pedidos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-4 lg:px-6">
            {loadingPedidos ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pedidosData?.pedidos && pedidosData.pedidos.length > 0 ? (
              <>
                {/* Mobile - Cards */}
                <div className="lg:hidden space-y-3">
                  {pedidosData.pedidos.map((pedido: AdminPedido) => (
                    <div key={pedido.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">#{pedido.numero}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.status)}`}>
                          {getStatusLabel(pedido.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[150px]">{pedido.nome_cliente}</span>
                        <span className="font-medium">{formatCurrency(Number(pedido.total))}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Desktop - Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Pedido</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Valor</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosData.pedidos.map((pedido: AdminPedido) => (
                        <tr key={pedido.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">#{pedido.numero}</td>
                          <td className="p-3">{pedido.nome_cliente}</td>
                          <td className="p-3">{formatCurrency(Number(pedido.total))}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.status)}`}>
                              {getStatusLabel(pedido.status)}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground text-sm">
                            {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum pedido encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;