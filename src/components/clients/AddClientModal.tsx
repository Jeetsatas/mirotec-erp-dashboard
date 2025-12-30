import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Client, ClientFormData } from '@/types/client';
import { indianStates } from '@/i18n/translations';

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => void;
  editClient?: Client | null;
}

const initialFormData: ClientFormData = {
  clientName: '',
  companyName: '',
  gstin: '',
  billingAddress: '',
  shippingAddress: '',
  contactPerson: '',
  phone: '',
  email: '',
  state: 'gujarat',
  creditLimit: 500000,
};

export function AddClientModal({ open, onClose, onSave, editClient }: AddClientModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

  useEffect(() => {
    if (editClient) {
      setFormData({
        clientName: editClient.clientName,
        companyName: editClient.companyName,
        gstin: editClient.gstin,
        billingAddress: editClient.billingAddress,
        shippingAddress: editClient.shippingAddress,
        contactPerson: editClient.contactPerson,
        phone: editClient.phone,
        email: editClient.email,
        state: editClient.state,
        creditLimit: editClient.creditLimit,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [editClient, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = t('invalidGstin');
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.creditLimit < 0) {
      newErrors.creditLimit = 'Credit limit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const copyBillingToShipping = () => {
    setFormData(prev => ({ ...prev, shippingAddress: prev.billingAddress }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editClient ? t('editClient') : t('addClient')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Row 1: Client Name & Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">{t('clientName')} *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder={t('clientName')}
                className={errors.clientName ? 'border-destructive' : ''}
              />
              {errors.clientName && <p className="text-xs text-destructive">{errors.clientName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('companyNameCRM')}</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder={t('companyNameCRM')}
              />
            </div>
          </div>

          {/* Row 2: GSTIN & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstin">{t('gstin')}</Label>
              <Input
                id="gstin"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                placeholder="24AABCT1234E1ZQ"
                maxLength={15}
                className={errors.gstin ? 'border-destructive' : ''}
              />
              {errors.gstin && <p className="text-xs text-destructive">{errors.gstin}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('stateLabel')}</Label>
              <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectState')} />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map(state => (
                    <SelectItem key={state} value={state}>{t(state as any)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Contact Person & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">{t('contactPerson')}</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                placeholder={t('contactPerson')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneLabel')} *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          {/* Row 4: Email & Credit Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="client@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditLimit">{t('creditLimit')}</Label>
              <Input
                id="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={(e) => handleChange('creditLimit', parseFloat(e.target.value) || 0)}
                placeholder="500000"
                className={errors.creditLimit ? 'border-destructive' : ''}
              />
              {errors.creditLimit && <p className="text-xs text-destructive">{errors.creditLimit}</p>}
            </div>
          </div>

          {/* Row 5: Billing Address */}
          <div className="space-y-2">
            <Label htmlFor="billingAddress">{t('billingAddress')}</Label>
            <Textarea
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) => handleChange('billingAddress', e.target.value)}
              placeholder={t('addressPlaceholder')}
              rows={2}
            />
          </div>

          {/* Row 6: Shipping Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="shippingAddress">{t('shippingAddress')}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyBillingToShipping}
                className="text-xs h-6"
              >
                {t('sameAsBilling')}
              </Button>
            </div>
            <Textarea
              id="shippingAddress"
              value={formData.shippingAddress}
              onChange={(e) => handleChange('shippingAddress', e.target.value)}
              placeholder={t('addressPlaceholder')}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            {editClient ? t('update') : t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
