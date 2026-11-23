import { useMemo, useState } from 'react'
import { getCustomers, saveCustomer, deleteCustomer } from '../../../core/store'

const initialFilters = { query: '', customerType: 'all', status: 'all', fromDate: '', toDate: '' }

export default function useCustomers() {
  const [, setTick] = useState(0)
  const [filters, setFilters] = useState(initialFilters)

  const refresh = () => setTick((tick) => tick + 1)

  const visibleCustomers = useMemo(() => {
    const { query, customerType, status, fromDate, toDate } = filters
    const q = String(query ?? '').trim().toLocaleLowerCase()
    return getCustomers().filter((customer) => {
      if (q) {
        const haystack = [
          customer.name,
          customer.code,
          customer.contactPerson,
          customer.phone,
          customer.email,
          customer.city,
        ].join(' ').toLocaleLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (customerType !== 'all' && customer.customerType !== customerType) return false
      if (status !== 'all' && customer.status !== status) return false
      if (fromDate && String(customer.createdAt).slice(0, 10) < fromDate) return false
      if (toDate && String(customer.createdAt).slice(0, 10) > toDate) return false
      return true
    })
  }, [filters])

  return {
    customers: visibleCustomers,
    filters,
    setFilters,
    refresh,
    saveCustomer: (customerId, customerData) => {
      const customer = saveCustomer(customerId, customerData)
      refresh()
      return customer
    },
    deleteCustomer: (customerId) => {
      deleteCustomer(customerId)
      refresh()
    },
  }
}
