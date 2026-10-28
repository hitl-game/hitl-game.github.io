import { defineFieldGroup } from '../fieldGroup';

// Load is stored in thousandths because a Metis answer costs half a load unit.
export const computeTuning = defineFieldGroup({
  gpuUnitLoad: 'milli',
  selfServeCustomerLoad: 'milli',
  teamCustomerLoad: 'milli',
  enterpriseCustomerLoad: 'milli',
  metisAnswerLoad: 'milli',
  churnUtilizationThreshold: 'percent',
  extraChurnPerDayPerUtilizationPoint: 'percent',
  capacityOfferTargetUtilization: 'percent',
  capacityOfferMinGpuUnits: 'count',
  capacityOfferRepeat: 'days',
});
