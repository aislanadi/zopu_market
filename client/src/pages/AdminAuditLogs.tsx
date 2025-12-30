import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { FileText, Filter, X, Eye } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminAuditLogs() {
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | undefined>(undefined);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs, isLoading } = trpc.adminDashboard.getAuditLogs.useQuery({
    limit: 100,
    entityType: entityTypeFilter,
  });

  const entityTypes = Array.from(new Set(logs?.map((log) => log.entityType).filter(Boolean)));

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE") || action.includes("CREATED")) {
      return <Badge className="bg-green-500 hover:bg-green-600">Criação</Badge>;
    }
    if (action.includes("UPDATE") || action.includes("UPDATED")) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Atualização</Badge>;
    }
    if (action.includes("DELETE") || action.includes("DELETED")) {
      return <Badge className="bg-red-500 hover:bg-red-600">Exclusão</Badge>;
    }
    if (action.includes("LOGIN") || action.includes("LOGOUT")) {
      return <Badge className="bg-purple-500 hover:bg-purple-600">Autenticação</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleClearFilters = () => {
    setEntityTypeFilter(undefined);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Auditoria e Logs
          </h1>
          <p className="text-muted-foreground mt-2">
            Histórico completo de ações realizadas no sistema
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Tipo de Entidade</label>
              <Select value={entityTypeFilter || "all"} onValueChange={(v) => setEntityTypeFilter(v === "all" ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type || "unknown"}>
                      {type || "Desconhecido"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {entityTypeFilter && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Ações</CardTitle>
            <CardDescription>
              {logs?.length || 0} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Data/Hora</th>
                      <th className="text-left p-3 font-semibold">Usuário</th>
                      <th className="text-left p-3 font-semibold">Ação</th>
                      <th className="text-left p-3 font-semibold">Entidade</th>
                      <th className="text-left p-3 font-semibold">ID</th>
                      <th className="text-left p-3 font-semibold">IP</th>
                      <th className="text-right p-3 font-semibold">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-accent/50">
                        <td className="p-3 text-sm">{formatDate(log.createdAt)}</td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{log.userName || "Usuário Desconhecido"}</span>
                            <span className="text-xs text-muted-foreground">{log.userEmail}</span>
                          </div>
                        </td>
                        <td className="p-3">{getActionBadge(log.action)}</td>
                        <td className="p-3 text-sm">{log.entityType || "-"}</td>
                        <td className="p-3 text-sm">{log.entityId || "-"}</td>
                        <td className="p-3 text-sm text-muted-foreground">{log.ipAddress || "-"}</td>
                        <td className="p-3 text-right">
                          {(log.oldValue || log.newValue) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Nenhum log encontrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
            <DialogDescription>
              Ação: {selectedLog?.action} | Entidade: {selectedLog?.entityType} #{selectedLog?.entityId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Usuário</label>
                <p className="text-sm">{selectedLog?.userName || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{selectedLog?.userEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data/Hora</label>
                <p className="text-sm">{formatDate(selectedLog?.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                <p className="text-sm">{selectedLog?.ipAddress || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ação</label>
                <p className="text-sm">{selectedLog?.action}</p>
              </div>
            </div>

            {/* Valores Antigos e Novos */}
            {(selectedLog?.oldValue || selectedLog?.newValue) && (
              <div className="grid md:grid-cols-2 gap-4">
                {selectedLog?.oldValue && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Valor Anterior
                    </label>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2)}
                    </pre>
                  </div>
                )}
                {selectedLog?.newValue && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Valor Novo
                    </label>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.newValue), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
