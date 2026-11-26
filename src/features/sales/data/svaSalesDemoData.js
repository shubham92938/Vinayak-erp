import { SAMPLE_FIRMS } from '../../../config/firms'

const SVA_FIRM_ID = SAMPLE_FIRMS[3].id
const PIPE_AGENCY = 'SHREE SIDDHIVINAYAK PIPE AGENCY'

function recordedSale({
  id,
  number,
  documentNumber,
  date,
  customerName,
  total,
  advance = 0,
  due = total - advance,
  paymentMode,
  buyerType = 'Customer',
  items = [],
  ...details
}) {
  return {
    id,
    number,
    type: 'Invoice',
    documentNumber,
    customerId: null,
    customerName,
    date: `${date}T00:00:00`,
    items,
    discount: 0,
    subtotal: total,
    taxTotal: 0,
    total,
    advance,
    paid: advance,
    due,
    paymentMode,
    buyerType,
    status: 'APPROVED',
    firmId: SVA_FIRM_ID,
    ...details,
  }
}

// Transcribed from Sale_25Nov26_01_58_SVA.pdf. The report calls this an
// Expenses Report, but its columns and the supplied recording show the Sales
// list with order, invoice/challan, buyer, payment and due information.
export const SVA_SALES_DEMO_DATA = [
  recordedSale({
    id: 'sva-sale-01',
    number: 'ORD-001919',
    documentNumber: 'CHL-20261004-019',
    date: '2026-10-04',
    customerId: 'CUST-010',
    customerName: PIPE_AGENCY,
    total: 7500,
    paymentMode: 'Online',
    buyerType: 'Dealer',
    dealer: 'Shree Vinayak Agency',
    printDetails: {
      billFrom: {
        name: 'Shree Vinayak Agency',
        phone: '8989938999',
        email: 'patidaraksh03@gmail.com',
        address: 'Shop No. 136, Agar Road, Ujjain, 456001',
      },
    },
    suppliedTo: PIPE_AGENCY,
    vehicleNumber: 'BUS',
    driverNumber: 'BUS',
    notes: 'BY BUS',
    items: [{ productId: 'sva-prod-44', name: 'J-PORTEBAL NOZZLE METAL JI3', qty: 10, unit: 'nos', price: 750, taxPct: 0 }],
  }),
  recordedSale({ id: 'sva-sale-02', number: 'ORD-001754', documentNumber: 'VA-016', date: '2026-08-20', customerName: PIPE_AGENCY, total: 28238, paymentMode: 'N/A', buyerType: 'Dealer' }),
  recordedSale({ id: 'sva-sale-03', number: 'ORD-001752', documentNumber: '19', date: '2026-08-17', customerName: PIPE_AGENCY, total: 302490, paymentMode: 'Online', buyerType: 'Dealer' }),
  recordedSale({ id: 'sva-sale-04', number: 'ORD-001751', documentNumber: 'VA-18', date: '2026-08-17', customerName: PIPE_AGENCY, total: 357015, paymentMode: 'Online', buyerType: 'Dealer' }),
  recordedSale({ id: 'sva-sale-05', number: 'ORD-001735', documentNumber: 'VA-17', date: '2026-08-10', customerName: 'VIKEY BHIYA KHEDA KHAJURIYA', total: 62110, advance: 50000, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-06', number: 'ORD-001734', documentNumber: 'return', date: '2026-08-10', customerName: PIPE_AGENCY, total: 700, paymentMode: 'N/A', buyerType: 'Dealer' }),
  recordedSale({ id: 'sva-sale-07', number: 'ORD-001733', documentNumber: '16', date: '2026-08-09', customerName: 'Kannu Agritech', total: 20300, paymentMode: 'Cash' }),
  recordedSale({ id: 'sva-sale-08', number: 'ORD-001731', documentNumber: '15', date: '2026-08-09', customerName: 'CUSTOMER', total: 10400, advance: 10400, due: 0, paymentMode: 'Cash' }),
  recordedSale({ id: 'sva-sale-09', number: 'ORD-001681', documentNumber: 'VA-014-26/27', date: '2026-07-15', customerName: 'SHER SINGH', total: 8400, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-10', number: 'ORD-001680', documentNumber: '13', date: '2026-07-15', customerName: 'jitendra jatt', total: 10400, paymentMode: 'N/A' }),
  recordedSale({ id: 'sva-sale-11', number: 'ORD-001678', documentNumber: 'VA-012-26/27', date: '2026-07-15', customerName: 'hakam singh', total: 8400, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-12', number: 'ORD-001677', documentNumber: 'VA-011-26/27', date: '2026-07-15', customerName: 'rahul', total: 10400, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-13', number: 'ORD-001676', documentNumber: 'VA-010-26/27', date: '2026-07-15', customerName: 'Gupta Electrical', total: 81000, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-14', number: 'ORD-001675', documentNumber: 'VA-009-26/27', date: '2026-07-15', customerName: 'Prem Engineering', total: 73350, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-15', number: 'ORD-001670', documentNumber: 'VA-008-26/27', date: '2026-07-11', customerName: 'Kannu Agritech', total: 10150, paymentMode: 'N/A' }),
  recordedSale({ id: 'sva-sale-16', number: 'ORD-001663', documentNumber: '09', date: '2026-07-09', customerName: 'shiv shakti irrigation', total: 8200, paymentMode: 'N/A' }),
  recordedSale({ id: 'sva-sale-17', number: 'ORD-001649', documentNumber: '07', date: '2026-07-08', customerName: 'Kannu Agritech', total: 24150, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-18', number: 'ORD-001648', documentNumber: '06', date: '2026-07-08', customerName: 'National Machinery', total: 202000, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-19', number: 'ORD-001647', documentNumber: '2', date: '2026-07-08', customerName: 'Prem Engineering', total: 49150, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-20', number: 'ORD-001646', documentNumber: '05', date: '2026-07-08', customerName: 'Gupta Electrical', total: 48600, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-21', number: 'ORD-001645', documentNumber: '04', date: '2026-07-08', customerName: 'Prem Engineering', total: 51250, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-22', number: 'ORD-001644', documentNumber: '03', date: '2026-07-08', customerName: 'Kannu Agritech', total: 16100, paymentMode: 'Online' }),
  recordedSale({ id: 'sva-sale-23', number: 'ORD-001640', documentNumber: '01', date: '2026-07-07', customerName: 'National Machinery', total: 81000, paymentMode: 'Online' }),
]
