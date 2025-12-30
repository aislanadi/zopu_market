import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Eye, 
  MousePointerClick, 
  Mail, 
  Star, 
  TrendingUp, 
  ArrowLeft,
  Calendar,
  MessageSquare,
  Download
} from "lucide-react";
import { Link } from "wouter";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

export default function PartnerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [wonValue, setWonValue] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  
  // Função para exportar relatório CSV
  const exportMutation = trpc.analytics.exportReport.useQuery(
    {},
    { enabled: false } // Não executar automaticamente
  );
  
  const handleExportCSV = async () => {
    try {
      const result = await exportMutation.refetch();
      
      if (result.data) {
        // Criar blob com conteúdo CSV
        const blob = new Blob([result.data.content], { type: 'text/csv;charset=utf-8;' });
        
        // Criar link temporário para download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', result.data.filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };
  
  // Buscar dados do parceiro do usuário logado
  const { data: partner } = trpc.partner.getById.useQuery(
    { id: user?.partnerId || 0 },
    { enabled: !!user?.partnerId }
  );
  
  // Buscar ofertas do parceiro
  const { data: offers } = trpc.offer.list.useQuery({ 
    partnerId: partner?.id,
    status: "PUBLISHED" 
  });
  
  // Buscar reviews do parceiro
  const { data: reviews } = trpc.review.listByPartner.useQuery(
    { partnerId: partner?.id || 0 },
    { enabled: !!partner }
  );
  
  // Buscar referrals do parceiro
  const { data: referrals, isLoading: loadingReferrals, refetch: refetchReferrals } = trpc.referral.list.useQuery();
  
  // Buscar comissões do parceiro
  const { data: commissions } = trpc.commission.getByPartner.useQuery({
    partnerId: user?.partnerId || undefined,
  });
  
  // Mutation para atualizar status do referral
  const updateStatusMutation = trpc.referral.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!');
      refetchReferrals();
      setSelectedReferral(null);
      setNewStatus('');
      setWonValue('');
      setInternalNotes('');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });
  
  const handleUpdateStatus = () => {
    if (!selectedReferral || !newStatus) {
      toast.error('Selecione um status');
      return;
    }
    
    updateStatusMutation.mutate({
      id: selectedReferral.id,
      status: newStatus as any,
      wonValue: wonValue ? parseInt(wonValue) : undefined,
      internalNotes: internalNotes || undefined,
    });
  };

  // Buscar métricas de analytics
  const { data: metrics } = trpc.analytics.getPartnerMetrics.useQuery(
    {},
    { enabled: !!partner }
  );
  
  // Calcular métricas
  const totalOffers = offers?.length || 0;
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0 
    ? (reviews?.reduce((sum, r) => sum + r.rating, 0) || 0) / totalReviews 
    : 0;
  
  // Métricas reais do analytics
  const totalViews = metrics?.totals.views || 0;
  const totalLeads = metrics?.totals.leads || 0;
  const totalWhatsAppClicks = metrics?.totals.whatsappClicks || 0;
  const conversionRate = metrics?.totals.conversionRate || 0;
  
  // Preparar dados para gráficos
  const profileViewsData = metrics?.profileViews.map(item => ({
    date: new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    visualizações: item.count
  })) || [];

  const leadsData = metrics?.leadsByOffer.map(item => ({
    oferta: item.offerTitle?.substring(0, 20) + "..." || "Sem título",
    leads: item.count
  })) || [];

  const whatsappData = metrics?.whatsappClicks.map(item => ({
    date: new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    cliques: item.count
  })) || [];

  const ratingData = metrics?.ratingEvolution.map(item => ({
    date: new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    rating: parseFloat(item.avgRating.toFixed(1))
  })) || [];
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Faça login como parceiro para acessar o dashboard.
            </p>
            <Button asChild>
              <a href="/api/oauth/login">Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Parceiro Não Encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Você não está associado a nenhum parceiro.
            </p>
            <Link href="/">
              <Button>Voltar à Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Dashboard de Métricas</h1>
              <p className="text-muted-foreground">{partner.companyName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={handleExportCSV}
                disabled={exportMutation.isFetching}
              >
                <Download className="h-4 w-4 mr-2" />
                {exportMutation.isFetching ? "Exportando..." : "Exportar CSV"}
              </Button>
              <Link href="/partner/edit-profile">
                <Button variant="outline">
                  Editar Perfil
                </Button>
              </Link>
              <Badge variant="outline" className="text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                Últimos 30 dias
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        {/* Cards de Métricas Principais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Visualizações de Perfil */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Visualizações de Perfil
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de visualizações
              </p>
            </CardContent>
          </Card>
          
          {/* Cliques WhatsApp */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cliques WhatsApp
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWhatsAppClicks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Leads via WhatsApp
              </p>
            </CardContent>
          </Card>
          
          {/* Leads Recebidos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leads Recebidos
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Formulários enviados
              </p>
            </CardContent>
          </Card>
          
          {/* Rating Médio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rating Médio
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalReviews} avaliações
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Visualizações de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Visualizações do Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              {profileViewsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profileViewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="visualizações" 
                      stroke="#FF6B1A" 
                      strokeWidth={2}
                      dot={{ fill: "#FF6B1A" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Leads por Oferta */}
          <Card>
            <CardHeader>
              <CardTitle>Leads por Oferta</CardTitle>
            </CardHeader>
            <CardContent>
              {leadsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="oferta" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="#FF6B1A" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum lead gerado ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Cliques WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle>Cliques no WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              {whatsappData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={whatsappData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cliques" 
                      stroke="#25D366" 
                      strokeWidth={2}
                      dot={{ fill: "#25D366" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum clique registrado ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Evolução do Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Rating</CardTitle>
            </CardHeader>
            <CardContent>
              {ratingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ratingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#FFD700" 
                      strokeWidth={2}
                      dot={{ fill: "#FFD700" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhuma avaliação ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cards Secundários */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Taxa de Conversão */}
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{conversionRate}%</div>
              <p className="text-sm text-muted-foreground">
                {totalLeads} leads de {totalViews} visualizações
              </p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Meta: 5%</span>
                  <Badge variant={conversionRate >= 5 ? "default" : "secondary"}>
                    {conversionRate >= 5 ? "Atingida" : "Abaixo da meta"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Ofertas Ativas */}
          <Card>
            <CardHeader>
              <CardTitle>Ofertas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{totalOffers}</div>
              <p className="text-sm text-muted-foreground mb-4">
                Ofertas publicadas no marketplace
              </p>
              <Link href="/admin/offers">
                <Button variant="outline" size="sm" className="w-full">
                  Gerenciar Ofertas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Leads Recebidos (Referrals) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Leads Recebidos</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals && referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.slice(0, 10).map((referral: any) => {
                  const isOverdue = referral.status === 'OVERDUE' || (referral.ackDeadline && new Date(referral.ackDeadline) < new Date() && referral.status === 'SENT');
                  const isPending = referral.status === 'SENT';
                  
                  return (
                    <div key={referral.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{referral.buyerContact || 'Cliente'}</span>
                          {referral.buyerCompany && (
                            <span className="text-sm text-muted-foreground">
                              • {referral.buyerCompany}
                            </span>
                          )}
                          <Badge 
                            variant={isPending ? 'default' : 'secondary'}
                            className={isOverdue ? 'bg-red-100 text-red-800' : ''}
                          >
                            {referral.status === 'SENT' && 'Pendente'}
                            {referral.status === 'ACKED' && 'Aceito'}
                            {referral.status === 'IN_NEGOTIATION' && 'Em Negociação'}
                            {referral.status === 'WON' && 'Ganho'}
                            {referral.status === 'LOST' && 'Perdido'}
                            {referral.status === 'OVERDUE' && 'Atrasado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Valor esperado: {referral.expectedValue ? `R$ ${referral.expectedValue.toLocaleString('pt-BR')}` : 'Não informado'}
                        </p>
                        {referral.ackDeadline && isPending && (
                          <p className="text-xs text-muted-foreground">
                            Prazo de aceite: {new Date(referral.ackDeadline).toLocaleDateString('pt-BR')}
                            {isOverdue && <span className="text-red-600 ml-2 font-semibold">VENCIDO</span>}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {isPending ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedReferral(referral);
                                  setNewStatus('ACKED');
                                }}
                              >
                                Aceitar Lead
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Atualizar Status do Lead</DialogTitle>
                                <DialogDescription>
                                  Atualize o status da indicação e adicione informações relevantes.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="status">Novo Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ACKED">Aceito</SelectItem>
                                      <SelectItem value="IN_NEGOTIATION">Em Negociação</SelectItem>
                                      <SelectItem value="WON">Ganho</SelectItem>
                                      <SelectItem value="LOST">Perdido</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {newStatus === 'WON' && (
                                  <div className="space-y-2">
                                    <Label htmlFor="wonValue">Valor Ganho (R$)</Label>
                                    <Input
                                      id="wonValue"
                                      type="number"
                                      placeholder="0"
                                      value={wonValue}
                                      onChange={(e) => setWonValue(e.target.value)}
                                    />
                                  </div>
                                )}
                                
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Observações Internas (opcional)</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Adicione notas sobre esta indicação..."
                                    value={internalNotes}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedReferral(null);
                                    setNewStatus('');
                                    setWonValue('');
                                    setInternalNotes('');
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={handleUpdateStatus}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  {updateStatusMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setSelectedReferral(referral)}
                              >
                                Atualizar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Atualizar Status do Lead</DialogTitle>
                                <DialogDescription>
                                  Atualize o status da indicação e adicione informações relevantes.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="status">Novo Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ACKED">Aceito</SelectItem>
                                      <SelectItem value="IN_NEGOTIATION">Em Negociação</SelectItem>
                                      <SelectItem value="WON">Ganho</SelectItem>
                                      <SelectItem value="LOST">Perdido</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {newStatus === 'WON' && (
                                  <div className="space-y-2">
                                    <Label htmlFor="wonValue">Valor Ganho (R$)</Label>
                                    <Input
                                      id="wonValue"
                                      type="number"
                                      placeholder="0"
                                      value={wonValue}
                                      onChange={(e) => setWonValue(e.target.value)}
                                    />
                                  </div>
                                )}
                                
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Observações Internas (opcional)</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Adicione notas sobre esta indicação..."
                                    value={internalNotes}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedReferral(null);
                                    setNewStatus('');
                                    setWonValue('');
                                    setInternalNotes('');
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={handleUpdateStatus}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  {updateStatusMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum lead recebido ainda
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Comissões */}
        <Card>
          <CardHeader>
            <CardTitle>Comissões do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions && commissions.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Previsto</p>
                    <p className="text-xl font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        commissions.reduce((sum, c) => sum + (c.successFeeExpected || 0), 0)
                      )}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Realizado</p>
                    <p className="text-xl font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        commissions.reduce((sum, c) => sum + (c.successFeeRealized || 0), 0)
                      )}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pendente</p>
                    <p className="text-xl font-bold">
                      {commissions.filter(c => ["SENT", "ACKED", "IN_NEGOTIATION"].includes(c.status)).length}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Total de {commissions.length} indicações</p>
                  <p>{commissions.filter(c => c.status === "WON").length} ganhas • {commissions.filter(c => c.status === "LOST").length} perdidas</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma comissão registrada ainda
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Últimas Avaliações */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.reviewerName}</span>
                        {review.reviewerCompany && (
                          <span className="text-sm text-muted-foreground">
                            • {review.reviewerCompany}
                          </span>
                        )}
                        {review.isVerified === 1 && (
                          <Badge variant="secondary" className="text-xs">Verificado</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < review.rating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-muted"
                            }`} 
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma avaliação ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
