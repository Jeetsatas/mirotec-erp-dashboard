import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Invoice, InvoiceLineItem, GSTType, InvoiceStatus } from '@/types/erp';
import { indianStates } from '@/i18n/translations';

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onPreview: (invoice: Omit<Invoice, 'id'>) => void;
}

const HSN_CODES: Record<string, string> = {
  realJari: '5605',
  imitationJari: '5605',
  silver: '7106',
  copper: '7403',
  polyesterYarn: '5402',
};

const PRODUCT_RATES: Record<string, number> = {
  realJari: 15000,
  imitationJari: 3000,
  silver: 75000,
  copper: 800,
  polyesterYarn: 200,
};

export function InvoiceForm({ open, onClose, onPreview }: InvoiceFormProps) {
  const { t } = useLanguage();
  const { orders, addInvoice } = useERP();

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientGSTIN, setClientGSTIN] = useState('');
  const [clientState, setClientState] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [gstType, setGstType] = useState<GSTType>(GSTType.CGST_SGST);

  const companyState = 'gujarat';
  const gstRate = 18;

  // Generate invoice number
  useEffect(() => {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    setInvoiceNumber(`INV-${year}-${num}`);
  }, [open]);

  // Auto-fill from order
  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find(o => o.id === selectedOrderId);
      if (order) {
        setClientName(order.clientName);
        setClientAddress('');
        setClientGSTIN('');
        setClientState('');
        setLineItems([{
          id: `li${Date.now()}`,
          productKey: order.productKey,
          hsnCode: HSN_CODES[order.productKey] || '5605',
          quantity: order.quantity,
          rate: PRODUCT_RATES[order.productKey] || order.amount / order.quantity,
          taxableValue: order.amount,
        }]);
      }
    }
  }, [selectedOrderId, orders]);

  // Auto-detect GST type based on state
  useEffect(() => {
    if (clientState && clientState !== companyState) {
      setGstType(GSTType.IGST);
    } else if (clientState) {
      setGstType(GSTType.CGST_SGST);
    }
  }, [clientState]);

  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: `li${Date.now()}`,
      productKey: 'realJari',
      hsnCode: '5605',
      quantity: 1,
      rate: 15000,
      taxableValue: 15000,
    }]);
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      updated[index].taxableValue = updated[index].quantity * updated[index].rate;
    }
    
    if (field === 'productKey') {
      updated[index].hsnCode = HSN_CODES[value] || '5605';
      updated[index].rate = PRODUCT_RATES[value] || 15000;
      updated[index].taxableValue = updated[index].quantity * updated[index].rate;
    }
    
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.taxableValue, 0);
  const cgstAmount = gstType === GSTType.CGST_SGST ? subtotal * (gstRate / 2) / 100 : 0;
  const sgstAmount = gstType === GSTType.CGST_SGST ? subtotal * (gstRate / 2) / 100 : 0;
  const igstAmount = gstType === GSTType.IGST ? subtotal * gstRate / 100 : 0;
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const grandTotal = subtotal + totalTax;

  const handlePreview = () => {
    const invoice: Omit<Invoice, 'id'> = {
      invoiceNumber,
      invoiceDate,
      orderId: selectedOrderId,
      clientName,
      clientAddress,
      clientGSTIN,
      clientState,
      companyState,
      lineItems,
      gstType,
      cgstRate: gstType === GSTType.CGST_SGST ? gstRate / 2 : 0,
      sgstRate: gstType === GSTType.CGST_SGST ? gstRate / 2 : 0,
      igstRate: gstType === GSTType.IGST ? gstRate : 0,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTax,
      grandTotal,
      status: InvoiceStatus.DRAFT,
    };
    onPreview(invoice);
  };

  const handleSave = () => {
    const invoice: Omit<Invoice, 'id'> = {
      invoiceNumber,
      invoiceDate,
      orderId: selectedOrderId,
      clientName,
      clientAddress,
      clientGSTIN,
      clientState,
      companyState,
      lineItems,
      gstType,
      cgstRate: gstType === GSTType.CGST_SGST ? gstRate / 2 : 0,
      sgstRate: gstType === GSTType.CGST_SGST ? gstRate / 2 : 0,
      igstRate: gstType === GSTType.IGST ? gstRate : 0,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTax,
      grandTotal,
      status: InvoiceStatus.ISSUED,
    };
    addInvoice(invoice);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            {t('createInvoice')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('selectOrder')}</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('selectOrder')} />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('invoiceNumber')}</Label>
                <Input 
                  value={invoiceNumber} 
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('invoiceDate')}</Label>
                <Input 
                  type="date" 
                  value={invoiceDate} 
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="glass p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-foreground">{t('clientDetails')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('clientName')}</Label>
                <Input 
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('clientGSTIN')}</Label>
                <Input 
                  value={clientGSTIN} 
                  onChange={e => setClientGSTIN(e.target.value.toUpperCase())}
                  placeholder="24AABCT1234E1ZQ"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t('clientAddress')}</Label>
                <Input 
                  value={clientAddress} 
                  onChange={e => setClientAddress(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('clientState')}</Label>
                <Select value={clientState} onValueChange={setClientState}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map(state => (
                      <SelectItem key={state} value={state}>
                        {t(state as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="glass p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">{t('lineItems')}</h3>
              <Button size="sm" onClick={addLineItem} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                {t('addLineItem')}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/50">
                    <th className="text-left py-2 px-2">{t('productName')}</th>
                    <th className="text-left py-2 px-2">{t('hsnSacCode')}</th>
                    <th className="text-right py-2 px-2">{t('quantity')}</th>
                    <th className="text-right py-2 px-2">{t('rate')}</th>
                    <th className="text-right py-2 px-2">{t('taxableValue')}</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-border/30">
                      <td className="py-2 px-2">
                        <Select 
                          value={item.productKey} 
                          onValueChange={v => updateLineItem(index, 'productKey', v)}
                        >
                          <SelectTrigger className="w-[140px] bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realJari">{t('realJari')}</SelectItem>
                            <SelectItem value="imitationJari">{t('imitationJari')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        <Input 
                          value={item.hsnCode}
                          onChange={e => updateLineItem(index, 'hsnCode', e.target.value)}
                          className="w-20 bg-background/50"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={e => updateLineItem(index, 'quantity', Number(e.target.value))}
                          className="w-20 text-right bg-background/50"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input 
                          type="number"
                          value={item.rate}
                          onChange={e => updateLineItem(index, 'rate', Number(e.target.value))}
                          className="w-24 text-right bg-background/50"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-foreground">
                        {formatCurrency(item.taxableValue)}
                      </td>
                      <td className="py-2 px-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => removeLineItem(index)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GST Calculation */}
          <div className="glass p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-foreground">{t('gstCalculation')}</h3>
            
            <div className="space-y-2">
              <Label>{t('gstType')}</Label>
              <Select value={gstType} onValueChange={(v: GSTType) => setGstType(v)}>
                <SelectTrigger className="w-[250px] bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GSTType.CGST_SGST}>{t('cgstSgst')}</SelectItem>
                  <SelectItem value={GSTType.IGST}>{t('igst')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">{t('subtotal')}</span>
                  <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                {gstType === GSTType.CGST_SGST ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">{t('cgst')} @ 9%</span>
                      <span className="text-foreground">{formatCurrency(cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">{t('sgst')} @ 9%</span>
                      <span className="text-foreground">{formatCurrency(sgstAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">IGST @ 18%</span>
                    <span className="text-foreground">{formatCurrency(igstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">{t('totalTax')}</span>
                  <span className="font-medium text-foreground">{formatCurrency(totalTax)}</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 rounded-lg px-3 -mx-3">
                  <span className="font-semibold text-foreground">{t('grandTotal')}</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              {t('invoicePreview')}
            </Button>
            <Button onClick={handleSave} disabled={!clientName || lineItems.length === 0}>
              {t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}