import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer, X } from 'lucide-react';
import { Invoice, GSTType } from '@/types/erp';

interface InvoicePreviewProps {
  open: boolean;
  onClose: () => void;
  invoice: Omit<Invoice, 'id'> | Invoice | null;
}

export function InvoicePreview({ open, onClose, invoice }: InvoicePreviewProps) {
  const { t } = useLanguage();

  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';
    
    const convert = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };

    return convert(Math.floor(num));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background p-0">
        <DialogHeader className="p-4 border-b border-border flex-row justify-between items-center">
          <DialogTitle className="text-foreground">{t('invoicePreview')}</DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              {t('print')}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Invoice Document - Print Ready */}
        <div className="p-8 bg-white text-black print:p-4" id="invoice-print">
          {/* Header */}
          <div className="border-2 border-black">
            <div className="text-center py-3 border-b-2 border-black bg-gray-100">
              <h1 className="text-2xl font-bold tracking-wider">{t('taxInvoice')}</h1>
            </div>

            {/* Company & Invoice Info */}
            <div className="grid grid-cols-2 border-b-2 border-black">
              {/* Seller Info */}
              <div className="p-4 border-r-2 border-black">
                <h2 className="font-bold text-lg mb-2">{t('companyName')}</h2>
                <p className="text-sm">{t('companyAddress')}</p>
                <p className="text-sm mt-2">
                  <strong>{t('gstin')}:</strong> {t('companyGSTIN')}
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> {t('companyPhone')}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {t('companyEmail')}
                </p>
              </div>

              {/* Invoice Details */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>{t('invoiceNo')}:</strong>
                    <p className="font-mono">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <strong>{t('invoiceDate')}:</strong>
                    <p>{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  {invoice.orderId && (
                    <div>
                      <strong>{t('orderId')}:</strong>
                      <p className="font-mono">{invoice.orderId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="p-4 border-b-2 border-black">
              <h3 className="font-bold text-sm mb-2">{t('to')}:</h3>
              <p className="font-semibold">{invoice.clientName}</p>
              <p className="text-sm">{invoice.clientAddress}</p>
              {invoice.clientGSTIN && (
                <p className="text-sm mt-1">
                  <strong>{t('gstin')}:</strong> {invoice.clientGSTIN}
                </p>
              )}
              {invoice.clientState && (
                <p className="text-sm">
                  <strong>State:</strong> {t(invoice.clientState as any)}
                </p>
              )}
            </div>

            {/* Line Items Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="border-b-2 border-r border-black p-2 text-left w-12">{t('slNo')}</th>
                  <th className="border-b-2 border-r border-black p-2 text-left">{t('productName')}</th>
                  <th className="border-b-2 border-r border-black p-2 text-center w-20">{t('hsnCode')}</th>
                  <th className="border-b-2 border-r border-black p-2 text-right w-16">{t('quantity')}</th>
                  <th className="border-b-2 border-r border-black p-2 text-right w-24">{t('rate')}</th>
                  <th className="border-b-2 border-black p-2 text-right w-28">{t('taxableValue')}</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={item.id} className="text-sm">
                    <td className="border-b border-r border-black p-2 text-center">{index + 1}</td>
                    <td className="border-b border-r border-black p-2">{t(item.productKey as any)}</td>
                    <td className="border-b border-r border-black p-2 text-center font-mono">{item.hsnCode}</td>
                    <td className="border-b border-r border-black p-2 text-right">{item.quantity} kg</td>
                    <td className="border-b border-r border-black p-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="border-b border-black p-2 text-right font-medium">{formatCurrency(item.taxableValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tax Summary */}
            <div className="grid grid-cols-2 border-t-2 border-black">
              <div className="p-4 border-r-2 border-black">
                <h3 className="font-bold text-sm mb-2">{t('amountInWords')}:</h3>
                <p className="text-sm italic">
                  {t('rupees')} {numberToWords(Math.round(invoice.grandTotal))} {t('only')}
                </p>
              </div>

              <div className="p-4 text-sm">
                <div className="flex justify-between py-1">
                  <span>{t('subtotal')}:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.gstType === GSTType.CGST_SGST ? (
                  <>
                    <div className="flex justify-between py-1">
                      <span>{t('cgst')} @ {invoice.cgstRate}%:</span>
                      <span>{formatCurrency(invoice.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>{t('sgst')} @ {invoice.sgstRate}%:</span>
                      <span>{formatCurrency(invoice.sgstAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-1">
                    <span>IGST @ {invoice.igstRate}%:</span>
                    <span>{formatCurrency(invoice.igstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-t border-black mt-2 pt-2">
                  <span className="font-bold">{t('grandTotal')}:</span>
                  <span className="font-bold text-lg">{formatCurrency(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black p-4 flex justify-between items-end">
              <div className="text-xs text-gray-600">
                <p>This is a computer generated invoice.</p>
                <p>Subject to {t(invoice.companyState as any)} jurisdiction.</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-8">{t('companyName')}</p>
                <p className="border-t border-black pt-1 text-sm">{t('authorizedSignatory')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-print, #invoice-print * {
              visibility: visible;
            }
            #invoice-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}