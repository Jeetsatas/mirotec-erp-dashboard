import { MachineType } from '@/types/erp';

// Raw material keys that map to inventory nameKey
export type RawMaterialKey = 'silver' | 'copper' | 'polyesterYarn';

// Consumption rate per machine start (in kg)
export interface ConsumptionRate {
  materialKey: RawMaterialKey;
  amountPerStart: number; // kg consumed when machine starts
}

// Machine type to raw material consumption mapping
// This defines what materials each machine type consumes when started
export const machineConsumptionConfig: Record<MachineType, ConsumptionRate[]> = {
  [MachineType.WIRE_DRAWING]: [
    { materialKey: 'silver', amountPerStart: 2 },
    { materialKey: 'copper', amountPerStart: 3 },
  ],
  [MachineType.FLATTENING]: [
    { materialKey: 'copper', amountPerStart: 2 },
  ],
  [MachineType.WINDING]: [
    { materialKey: 'polyesterYarn', amountPerStart: 5 },
  ],
  [MachineType.ELECTROPLATING]: [
    { materialKey: 'silver', amountPerStart: 1 },
    { materialKey: 'copper', amountPerStart: 4 },
  ],
};

// Get consumption info for a machine type
export function getMachineConsumption(machineType: MachineType): ConsumptionRate[] {
  return machineConsumptionConfig[machineType] || [];
}

// Get all unique materials consumed by a machine type
export function getMachineConsumedMaterials(machineType: MachineType): RawMaterialKey[] {
  return getMachineConsumption(machineType).map(c => c.materialKey);
}

// Check if a machine type consumes any inventory
export function machineConsumesInventory(machineType: MachineType): boolean {
  return getMachineConsumption(machineType).length > 0;
}
