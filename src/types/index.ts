export interface Customer {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  customerId: string;
  customerName: string;
  moldName: string;
  moldType: string;
  cavityQty: number;
  productMaterial: string;
  estimatedTonnage: number;
  estimatedCycles: number;
  materialCost: number;
  machiningCost: number;
  electrodeCost: number;
  assemblyCost: number;
  tryMoldCost: number;
  otherCost: number;
  totalCost: number;
  profitMargin: number;
  profitAmount: number;
  quotationPrice: number;
  deliveryDays: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  approvedAt?: string;
  remark?: string;
}

export interface MoldProject {
  id: string;
  projectNo: string;
  quotationId: string;
  moldName: string;
  customerId: string;
  customerName: string;
  moldBaseCode: string;
  status: 'design' | 'machining' | 'assembly' | 'trymold' | 'completed' | 'maintenance' | 'scrapped';
  totalCycles: number;
  currentCycles: number;
  createdAt: string;
  plannedDeliveryDate: string;
  actualDeliveryDate?: string;
}

export interface MoldBase {
  id: string;
  code: string;
  type: string;
  series: string;
  plateThickness: {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
  };
  length: number;
  width: number;
  guidePillar: string;
  ejectorType: string;
  material: string;
  weight: number;
  price: number;
  imageUrl: string;
}

export interface CavityTask {
  id: string;
  projectId: string;
  projectNo: string;
  partName: string;
  partType: 'cavity' | 'core' | 'slide' | 'lifter';
  material: string;
  hardness: string;
  processRoute: string[];
  currentProcess: number;
  programNo: string;
  cncMachine: string;
  operator: string;
  planHours: number;
  actualHours: number;
  status: 'pending' | 'programming' | 'machining' | 'inspection' | 'completed';
  startDate: string;
  finishDate?: string;
}

export interface WireCutTask {
  id: string;
  projectId: string;
  projectNo: string;
  partName: string;
  wireType: string;
  wireDiameter: number;
  cutLength: number;
  planHours: number;
  actualHours: number;
  tolerance: string;
  status: 'pending' | 'processing' | 'completed';
  operator: string;
}

export interface Electrode {
  id: string;
  projectId: string;
  projectNo: string;
  electrodeNo: string;
  partName: string;
  material: string;
  size: string;
  usedCount: number;
  maxUseCount: number;
  edmParams: {
    voltage: number;
    current: number;
    pulseOn: number;
    pulseOff: number;
  };
  planHours: number;
  actualHours: number;
  status: 'pending' | 'machining' | 'using' | 'worn';
  operator: string;
}

export interface AssemblyStep {
  id: string;
  name: string;
  order: number;
  done: boolean;
  hours: number;
}

export interface AssemblyTask {
  id: string;
  projectId: string;
  projectNo: string;
  steps: AssemblyStep[];
  inspector: string;
  fitter: string;
  planHours: number;
  actualHours: number;
  status: 'pending' | 'in_progress' | 'inspection' | 'completed';
  issues: string[];
}

export interface TryMoldApply {
  id: string;
  projectId: string;
  projectNo: string;
  tryNo: number;
  machineNo: string;
  material: string;
  materialBatch: string;
  planDate: string;
  applicant: string;
  status: 'pending' | 'approved' | 'ongoing' | 'completed';
}

export interface TryMoldRecord {
  id: string;
  applyId: string;
  sampleQty: number;
  parameters: {
    temperature: number[];
    injectionPressure: number;
    holdingPressure: number;
    injectionSpeed: number;
    coolingTime: number;
    cycleTime: number;
  };
  defects: string[];
  adjustment: string;
  operator: string;
  recordDate: string;
  images: string[];
}

export interface InspectionItem {
  id: string;
  name: string;
  dimension: string;
  tolerance: string;
  measured: string;
  result: 'pass' | 'fail';
}

export interface Inspection {
  id: string;
  tryRecordId: string;
  sampleNo: string;
  items: InspectionItem[];
  result: 'pass' | 'fail' | 'conditional';
  inspector: string;
  reportDate: string;
  remark: string;
}

export interface ConsumableUsage {
  id: string;
  partId: string;
  partName: string;
  qty: number;
  unitPrice: number;
}

export interface RepairOrder {
  id: string;
  projectId: string;
  projectNo: string;
  orderNo: string;
  faultType: string;
  faultDescription: string;
  rootCause: string;
  solution: string;
  parts: ConsumableUsage[];
  repairHours: number;
  repairer: string;
  status: 'pending' | 'repairing' | 'testing' | 'completed';
  applyDate: string;
  finishDate?: string;
}

export interface ConsumableParts {
  id: string;
  code: string;
  name: string;
  spec: string;
  unit: string;
  stock: number;
  minStock: number;
  supplier: string;
  unitPrice: number;
}

export interface MoldLedger {
  id: string;
  projectId: string;
  projectNo: string;
  moldNo: string;
  location: string;
  status: 'in_stock' | 'loaned' | 'using' | 'repaired' | 'scrapped';
  inDate: string;
  outDate?: string;
  borrower?: string;
  lastCycles: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'sales' | 'designer' | 'manager' | 'operator' | 'inspector' | 'warehouse';
  avatar: string;
  email: string;
  phone: string;
}
