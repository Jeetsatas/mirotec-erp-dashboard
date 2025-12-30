import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { ClientDetailsModal } from '@/components/clients/ClientDetailsModal';
import { ClientFormData, ClientSummary } from '@/types/client';
import { 
  Plus, 
  Search, 
  Users, 
  IndianRupee, 
  AlertTriangle,
  TrendingUp,
  Phone,
  Building2,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Clients() {
  const { t } = useLanguage();
  const { 
    clients, 
    addClient, 
    updateClient,
    getClientSummary,
    orders,
    invoices
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClient, setEditClient] = useState<ClientSummary['client'] | null>(null);
  const [selectedClientSummary, setSelectedClientSummary] = useState<ClientSummary | null>(null);

  // Calculate summaries for all clients
  const clientSummaries = useMemo(() => {
    return clients.map(client => getClientSummary(client.id));
  }, [clients, getClientSummary]);

  // Filter clients by search
  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return clientSummaries;
    const query = searchQuery.toLowerCase();
    return clientSummaries.filter(summary => 
      summary.client.clientName.toLowerCase().includes(query) ||
      summary.client.companyName.toLowerCase().includes(query) ||
      summary.client.phone.includes(query) ||
      summary.client.gstin.toLowerCase().includes(query)
    );
  }, [clientSummaries, searchQuery]);

  // Summary stats
  const totalClients = clients.length;
  const totalOutstanding = clientSummaries.reduce((sum, s) => sum + s.outstandingBalance, 0);
  const totalSales = clientSummaries.reduce((sum, s) => sum + s.totalSalesValue, 0);
  const overLimitCount = clientSummaries.filter(s => s.isOverCreditLimit).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSaveClient = (data: ClientFormData) => {
    if (editClient) {
      updateClient(editClient.id, data);
    } else {
      addClient(data);
    }
    setEditClient(null);
  };

  const handleViewClient = (summary: ClientSummary) => {
    setSelectedClientSummary(summary);
  };

  const handleEditFromDetails = () => {
    if (selectedClientSummary) {
      setEditClient(selectedClientSummary.client);
      setSelectedClientSummary(null);
      setShowAddModal(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('clients')}</h1>
          <p className="text-muted-foreground mt-1">{t('clientManagement')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addClient')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="glass-card card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('totalClients')}</p>
              <p className="text-2xl font-bold">{totalClients}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[hsl(var(--success))]/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('totalSales')}</p>
              <p className="text-xl font-bold">{formatCurrency(totalSales)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[hsl(var(--warning))]/10 flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('totalOutstanding')}</p>
              <p className="text-xl font-bold">{formatCurrency(totalOutstanding)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('overCreditLimit')}</p>
              <p className="text-2xl font-bold">{overLimitCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Client List */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold">{t('clientList')}</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredSummaries.length > 0 ? (
          <div className="grid gap-4">
            {filteredSummaries.map((summary, index) => {
              const { client } = summary;
              return (
                <div
                  key={client.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold truncate">{client.clientName}</h4>
                        {summary.isOverCreditLimit && (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            {t('overCreditLimit')}
                          </Badge>
                        )}
                      </div>
                      {client.companyName && (
                        <p className="text-sm text-muted-foreground truncate">{client.companyName}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                        <span>{t(client.state as any)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('totalOrders')}</p>
                      <p className="font-semibold">{summary.totalOrders}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('totalSales')}</p>
                      <p className="font-semibold">{formatCurrency(summary.totalSalesValue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('outstandingBalance')}</p>
                      <p className={cn(
                        "font-semibold",
                        summary.outstandingBalance > 0 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--success))]"
                      )}>
                        {formatCurrency(summary.outstandingBalance)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewClient(summary)}
                      className="gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      {t('view')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('noRecords')}</p>
            <Button variant="link" onClick={() => setShowAddModal(true)} className="mt-2">
              {t('addClient')}
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddClientModal
        open={showAddModal || !!editClient}
        onClose={() => {
          setShowAddModal(false);
          setEditClient(null);
        }}
        onSave={handleSaveClient}
        editClient={editClient}
      />

      <ClientDetailsModal
        open={!!selectedClientSummary}
        onClose={() => setSelectedClientSummary(null)}
        clientSummary={selectedClientSummary}
        onEdit={handleEditFromDetails}
      />
    </div>
  );
}
