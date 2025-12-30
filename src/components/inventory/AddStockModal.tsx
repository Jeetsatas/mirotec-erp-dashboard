import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useERP } from '@/contexts/ERPContext';
import { InventoryCategory, StockStatus } from '@/types/erp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface AddStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStockModal({ open, onOpenChange }: AddStockModalProps) {
  const { t } = useLanguage();
  const { addInventoryItem } = useERP();
  
  const [formData, setFormData] = useState({
    nameKey: '',
    category: InventoryCategory.RAW_MATERIAL,
    quantity: 0,
    unit: 'kg',
    estimatedValue: 0,
    minStock: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let stockStatus = StockStatus.IN_STOCK;
    if (formData.quantity === 0) stockStatus = StockStatus.OUT_OF_STOCK;
    else if (formData.quantity < formData.minStock) stockStatus = StockStatus.LOW_STOCK;

    addInventoryItem({
      ...formData,
      stockStatus,
    });

    setFormData({
      nameKey: '',
      category: InventoryCategory.RAW_MATERIAL,
      quantity: 0,
      unit: 'kg',
      estimatedValue: 0,
      minStock: 10,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] glass-card border-border/50 animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('addStock')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="itemName" className="text-sm font-medium">{t('itemName')}</Label>
            <Input
              id="itemName"
              value={formData.nameKey}
              onChange={(e) => setFormData({ ...formData, nameKey: e.target.value })}
              className="rounded-xl bg-background/50 border-border/50 focus:bg-background transition-smooth"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">{t('category')}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as InventoryCategory })}
            >
              <SelectTrigger className="rounded-xl bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/50">
                <SelectItem value={InventoryCategory.RAW_MATERIAL}>{t('rawMaterials')}</SelectItem>
                <SelectItem value={InventoryCategory.FINISHED_GOODS}>{t('finishedGoods')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">{t('quantity')}</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="rounded-xl bg-background/50 border-border/50 focus:bg-background transition-smooth"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium">{t('unit')}</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger className="rounded-xl bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/50">
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedValue" className="text-sm font-medium">{t('estimatedValue')} (₹)</Label>
            <Input
              id="estimatedValue"
              type="number"
              min="0"
              value={formData.estimatedValue}
              onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
              className="rounded-xl bg-background/50 border-border/50 focus:bg-background transition-smooth"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              {t('cancel')}
            </Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-primary/20">
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
