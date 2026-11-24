import { useMemo, useState } from 'react'
import { createCustomer, getCustomers, saveCustomer, deleteCustomer } from '../../../core/store'
import { useAuth, useFirmContext } from '../../../context/hooks'
import { canAccessRecord, enforceCreateFirmId, filterRecordsForUser, getDataPermission } from '../../../core/accessControl'

const initialFilters = { query: '', customerType: 'all', status: 'all', fromDate: '', toDate: '' }

export default function useCustomers() {
  const { currentUser } = useAuth()
  const { currentFirmId } = useFirmContext()
  const [, setTick] = useState(0)
  const [filters, setFilters] = useState(initialFilters)

  const refresh = () => setTick((tick) => tick + 1)
  const canViewAllCustomers = getDataPermission(currentUser, 'Customers', 'view', 'all')
  const customerFirmScope = currentUser?.role === 'super_admin' || canViewAllCustomers ? null : currentFirmId
  // Reading the collection during render keeps the hook in sync after a mock
  // service mutation while the state tick forces a new render.
  const customersSnapshot = filterRecordsForUser(
    getCustomers(),
    currentUser,
    'Customers',
    'view',
    customerFirmScope,
  )

  const visibleCustomers = useMemo(() => {
    const { query, customerType, status, fromDate, toDate } = filters
    const q = String(query ?? '').trim().toLocaleLowerCase()
    return customersSnapshot.filter((customer) => {
      if (q) {
        const haystack = [customer.name, customer.code, customer.contactPerson, customer.phone, customer.email, customer.city]
          .join(' ')
          .toLocaleLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (customerType !== 'all' && customer.customerType !== customerType) return false
      if (status !== 'all' && customer.status !== status) return false
      if (fromDate && String(customer.createdAt).slice(0, 10) < fromDate) return false
      if (toDate && String(customer.createdAt).slice(0, 10) > toDate) return false
      return true
    })
  }, [customersSnapshot, filters])

  return {
    customers: visibleCustomers,
    filters,
    setFilters,
    refresh,
    createCustomer: (customerData) => {
      const firmId = enforceCreateFirmId(currentUser, customerData.firmId ?? currentFirmId, 'Customers')
      if (!firmId || !canAccessRecord(currentUser, { firmId }, 'Customers', 'create')) return null
      const customer = createCustomer({ ...customerData, firmId })
      refresh()
      return customer
    },
    saveCustomer: (customerId, customerData) => {
      const existing = getCustomers().find((customer) => customer.id === customerId)
      if (!existing || !canAccessRecord(currentUser, existing, 'Customers', 'edit')) return null
      const customer = saveCustomer(customerId, { ...customerData, firmId: existing.firmId })
      refresh()
      return customer
    },
    deleteCustomer: (customerId) => {
      const existing = getCustomers().find((customer) => customer.id === customerId)
      if (!existing || !canAccessRecord(currentUser, existing, 'Customers', 'delete')) return null
      deleteCustomer(customerId)
      refresh()
      return customerId
    },
  }
}
