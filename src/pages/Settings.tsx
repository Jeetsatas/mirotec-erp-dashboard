import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Building2, Upload, X, Save, RotateCcw, Check } from 'lucide-react';

const indianStates = [
  { value: 'gujarat', labelKey: 'gujarat' as const },
  { value: 'maharashtra', labelKey: 'maharashtra' as const },
  { value: 'rajasthan', labelKey: 'rajasthan' as const },
  { value: 'madhyaPradesh', labelKey: 'madhyaPradesh' as const },
  { value: 'uttarPradesh', labelKey: 'uttarPradesh' as const },
  { value: 'delhi', labelKey: 'delhi' as const },
  { value: 'karnataka', labelKey: 'karnataka' as const },
  { value: 'tamilNadu', labelKey: 'tamilNadu' as const },
  { value: 'westBengal', labelKey: 'westBengal' as const },
  { value: 'telangana', labelKey: 'telangana' as const },
];

export default function Settings() {
  const { t } = useLanguage();
  const { company, updateCompany, resetCompany } = useCompany();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: company.name,
    gstin: company.gstin,
    address: company.address,
    phone: company.phone,
    email: company.email,
    state: company.state,
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logo);
  const [gstinError, setGstinError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Validate GSTIN format
    if (field === 'gstin') {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (value && !gstinRegex.test(value)) {
        setGstinError(t('invalidGstin'));
      } else {
        setGstinError(null);
      }
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('error'),
          description: t('logoSizeError'),
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (gstinError) {
      toast({
        title: t('error'),
        description: t('fixErrors'),
        variant: 'destructive',
      });
      return;
    }

    updateCompany({
      ...formData,
      logo: logoPreview,
    });

    setHasChanges(false);
    toast({
      title: t('saved'),
      description: t('companyProfileSaved'),
    });
  };

  const handleReset = () => {
    resetCompany();
    setFormData({
      name: 'Shree Jari Industries',
      gstin: '24AABCS1234D1ZA',
      address: 'Plot No. 45, GIDC Industrial Estate, Surat - 395003, Gujarat',
      phone: '+91 261 2345678',
      email: 'accounts@shreejari.com',
      state: 'gujarat',
    });
    setLogoPreview(null);
    setHasChanges(false);
    toast({
      title: t('reset'),
      description: t('companyProfileReset'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('companyProfile')}</h1>
          <p className="text-sm text-muted-foreground">{t('companyProfileDescription')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Logo Upload Card */}
        <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{t('companyLogo')}</CardTitle>
            <CardDescription>{t('logoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="h-40 w-40 mx-auto rounded-2xl border-2 border-dashed border-border/70 bg-muted/30 flex items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">{t('uploadLogo')}</p>
                  </div>
                )}
              </div>
              {logoPreview && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-1/2 translate-x-[70px] -translate-y-2 h-7 w-7 rounded-full shadow-lg"
                  onClick={removeLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('selectImage')}
            </Button>
            <p className="text-xs text-muted-foreground text-center">{t('logoFormats')}</p>
          </CardContent>
        </Card>

        {/* Company Information Form */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{t('companyInformation')}</CardTitle>
            <CardDescription>{t('companyInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t('companyNameLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('companyNamePlaceholder')}
                  className="bg-background/50"
                />
              </div>

              {/* GSTIN */}
              <div className="space-y-2">
                <Label htmlFor="gstin" className="text-sm font-medium">
                  {t('gstinLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                  placeholder="24AABCS1234D1ZA"
                  className={`bg-background/50 uppercase ${gstinError ? 'border-destructive' : ''}`}
                  maxLength={15}
                />
                {gstinError && (
                  <p className="text-xs text-destructive">{gstinError}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t('phoneLabel')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="bg-background/50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('emailLabel')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="accounts@company.com"
                  className="bg-background/50"
                />
              </div>

              {/* State */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  {t('stateLabel')}
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleInputChange('state', value)}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder={t('selectState')} />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {t(state.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  {t('addressLabel')}
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('addressPlaceholder')}
                  className="bg-background/50 min-h-[100px] resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={handleReset}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('resetToDefault')}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={!hasChanges || !!gstinError}
                className="bg-primary hover:bg-primary/90"
              >
                {hasChanges ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('saveChanges')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('saved')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
