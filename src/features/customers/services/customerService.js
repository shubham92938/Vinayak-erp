/**
 * Customer service — wraps the central store.
 */
import {
  getCustomerById,
  createCustomer,
  saveCustomer,
  deleteCustomer,
} from '../../../core/store'
import { buildCsv } from '../../../utils/csv'

export { getCustomerById, createCustomer, saveCustomer, deleteCustomer }

export function getCustomerFields() {
  return [
    { key: 'id', label: 'Customer ID' },
    { key: 'code', label: 'Customer Code' },
    { key: 'name', label: 'Customer Name' },
    { key: 'customerType', label: 'Customer Type' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { key: 'outstandingBalance', label: 'Outstanding Balance' },
    { key: 'status', label: 'Status' },
  ]
}

export function getCustomersCsvRows(customers) {
  return buildCsv({
    columns: getCustomerFields().map((field) => ({ key: field.key, label: field.label })),
    rows: customers.map((customer) => ({
      id: customer.id,
      code: customer.code,
      name: customer.name,
      customerType: customer.customerType,
      contactPerson: customer.contactPerson,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      outstandingBalance: customer.openingBalance,
      status: customer.status,
      firmId: customer.firmId,
      createdAt: customer.createdAt,
    })),
  })
}
