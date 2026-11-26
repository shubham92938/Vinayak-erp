import { SVA_FIRM_ID } from '../../../config/firms'

// Transcribed only from Sale_25Nov26_01_58_SVA.pdf. The report supplies
// order number, invoice/challan reference, date, buyer, bill total, advance,
// due amount, payment mode, and status. It does not supply product lines or a
// customer master, so those fields remain empty instead of being inferred.
function recordedSale({
  number,
  documentNumber,
  date,
  customerName,
  total,
  advance,
  due,
  paymentMode,
  status,
}) {
  return {
    id: number,
    number,
    type: documentNumber.startsWith('CHL-') ? 'Challan' : 'Invoice',
    documentNumber,
    customerId: null,
    customerName,
    date: `${date}T00:00:00`,
    items: [],
    total,
    advance,
    paid: advance,
    due,
    paymentMode,
    status,
    firmId: SVA_FIRM_ID,
  }
}

export const SVA_SALES_DATA = [
  recordedSale({ number: 'ORD-001919', documentNumber: 'CHL-20261004-019', date: '2026-10-04', customerName: 'SHREE SIDDHIVINAYAK PIPE AGENCY', total: 7500, advance: 0, due: 7500, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001754', documentNumber: 'VA-016', date: '2026-08-20', customerName: 'SHREE SIDDHIVINAYAK PIPE AGENCY', total: 28238, advance: 0, due: 28238, paymentMode: 'N/A', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001752', documentNumber: '19', date: '2026-08-17', customerName: 'SHREE SIDDHIVINAYAK PIPE AGENCY', total: 302490, advance: 0, due: 302490, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001751', documentNumber: 'VA-18', date: '2026-08-17', customerName: 'SHREE SIDDHIVINAYAK PIPE AGENCY', total: 357015, advance: 0, due: 357015, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001735', documentNumber: 'VA-17', date: '2026-08-10', customerName: 'VIKEY BHIYA KHEDA KHAJURIYA', total: 62110, advance: 50000, due: 12110, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001734', documentNumber: 'return', date: '2026-08-10', customerName: 'SHREE SIDDHIVINAYAK PIPE AGENCY', total: 700, advance: 0, due: 700, paymentMode: 'N/A', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001733', documentNumber: '16', date: '2026-08-09', customerName: 'Kannu Agritech', total: 20300, advance: 0, due: 20300, paymentMode: 'Cash', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001731', documentNumber: '15', date: '2026-08-09', customerName: 'CUSTOMER', total: 10400, advance: 10400, due: 0, paymentMode: 'Cash', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001681', documentNumber: 'VA-014-26/27', date: '2026-07-15', customerName: 'SHER SINGH', total: 8400, advance: 0, due: 8400, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001680', documentNumber: '13', date: '2026-07-15', customerName: 'jitendra jatt', total: 10400, advance: 0, due: 10400, paymentMode: 'N/A', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001678', documentNumber: 'VA-012-26/27', date: '2026-07-15', customerName: 'hakam singh', total: 8400, advance: 0, due: 8400, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001677', documentNumber: 'VA-011-26/27', date: '2026-07-15', customerName: 'rahul', total: 10400, advance: 0, due: 10400, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001676', documentNumber: 'VA-010-26/27', date: '2026-07-15', customerName: 'Gupta Electrical', total: 81000, advance: 0, due: 81000, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001675', documentNumber: 'VA-009-26/27', date: '2026-07-15', customerName: 'Prem Engineering', total: 73350, advance: 0, due: 73350, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001670', documentNumber: 'VA-008-26/27', date: '2026-07-11', customerName: 'Kannu Agritech', total: 10150, advance: 0, due: 10150, paymentMode: 'N/A', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001663', documentNumber: '09', date: '2026-07-09', customerName: 'shiv shakti irrigation', total: 8200, advance: 0, due: 8200, paymentMode: 'N/A', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001649', documentNumber: '07', date: '2026-07-08', customerName: 'Kannu Agritech', total: 24150, advance: 0, due: 24150, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001648', documentNumber: '06', date: '2026-07-08', customerName: 'National Machinery', total: 202000, advance: 0, due: 202000, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001647', documentNumber: '2', date: '2026-07-08', customerName: 'Prem Engineering', total: 49150, advance: 0, due: 49150, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001646', documentNumber: '05', date: '2026-07-08', customerName: 'Gupta Electrical', total: 48600, advance: 0, due: 48600, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001645', documentNumber: '04', date: '2026-07-08', customerName: 'Prem Engineering', total: 51250, advance: 0, due: 51250, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001644', documentNumber: '03', date: '2026-07-08', customerName: 'Kannu Agritech', total: 16100, advance: 0, due: 16100, paymentMode: 'Online', status: 'APPROVED' }),
  recordedSale({ number: 'ORD-001640', documentNumber: '01', date: '2026-07-07', customerName: 'National Machinery', total: 81000, advance: 0, due: 81000, paymentMode: 'Online', status: 'APPROVED' }),
]
