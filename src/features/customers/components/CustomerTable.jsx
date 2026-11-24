import { useMemo } from 'react'
import { DataTable } from '../../../components/data-table'
import { ActionMenu, Badge, Button, Select } from '../../../components/ui'
import { DateRangeFilter } from '../../../components/filters'
import { getFirmLabel } from '../utils/customerUtils'
import { formatMoney } from '../utils/customerUtils'
import { CUSTOMER_TYPES, CUSTOMER_STATUSES } from '../utils/customerUtils'
import { downloadCsv } from '../../../utils/csv'
import { getCustomerFields, getCustomersCsvRows } from '../services/customerService'

const STATUS_BADGE_VARIANTS = { Active: 'success', Inactive: 'neutral' }

export default function CustomerTable({
  customers,
  filters,
  onFiltersChange,
  onClearFilters,
  onRowView,
  onRowEdit,
  onRowDelete,
  onRowDeactivate,
  onRowActivate,
  canEdit = true,
  canDelete = true,
  canExport = true,
}) {
  const columns = useMemo(
    () => [
      {
        id: 'initials',
        header: 'Customer',
        sortable: false,
        width: '80px',
        cell: (customer) => (
          <div className="customers-initials" style={{ backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue-hover)' }}>
            {customer.initials ?? customer.code?.slice(0, 4)}
          </div>
        ),
      },
      {
        id: 'name',
        header: 'Name',
        accessor: 'name',
        minWidth: '200px',
      },
      {
        id: 'code',
        header: 'Code',
        accessor: 'code',
        width: '90px',
      },
      {
        id: 'customerType',
        header: 'Type',
        accessor: 'customerType',
        width: '130px',
        cell: (customer) => <Badge variant="info" size="sm">{customer.customerType}</Badge>,
      },
      {
        id: 'contact',
        header: 'Contact Person',
        accessor: 'contactPerson',
        width: '170px',
      },
      {
        id: 'phone',
        header: 'Phone',
        accessor: 'phone',
        width: '120px',
      },
      {
        id: 'email',
        header: 'Email',
        accessor: 'email',
        width: '180px',
      },
      {
        id: 'city',
        header: 'City',
        accessor: 'city',
        width: '110px',
      },
      {
        id: 'balance',
        header: 'Outstanding Balance',
        accessor: (customer) => customer.openingBalance ?? 0,
        width: '150px',
        align: 'right',
        cell: (customer) => <span className="customers-money">{formatMoney(customer.openingBalance)}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: '110px',
        cell: (customer) => <Badge variant={STATUS_BADGE_VARIANTS[customer.status] ?? 'neutral'} size="sm">{customer.status}</Badge>,
      },
      {
        id: 'firm',
        header: 'Firm',
        accessor: (customer) => getFirmLabel(customer.firmId),
        width: '150px',
        cell: (customer) => <span className="customers-firm">{getFirmLabel(customer.firmId)}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '70px',
        sortable: false,
        cell: (customer) => (
          <ActionMenu
            label="Customer actions"
            triggerLabel={`Actions for ${customer.name}`}
            items={[
              { label: 'View details', onSelect: () => onRowView(customer.id) },
              { label: 'Edit customer', disabled: !canEdit, onSelect: () => onRowEdit(customer.id) },
              {
                label: customer.status === 'Active' ? 'Deactivate' : 'Activate',
                disabled: !canEdit,
                onSelect: () => customer.status === 'Active' ? onRowDeactivate(customer.id) : onRowActivate(customer.id),
              },
              { label: 'Delete customer', danger: true, disabled: !canDelete, onSelect: () => onRowDelete(customer.id) },
            ]}
          />
        ),
      },
    ],
    [onRowView, onRowEdit, onRowDelete, onRowActivate, onRowDeactivate, canEdit, canDelete],
  )

  const isFiltered = Boolean(filters.query || filters.customerType !== 'all' || filters.status !== 'all' || filters.fromDate || filters.toDate)

  return (
    <div className="customers-table">
      <DataTable
        data={customers}
        columns={columns}
        getRowId={(customer) => customer.id}
        search={filters.query}
        onSearchChange={(query) => onFiltersChange({ query })}
        searchPlaceholder="Search name, code or phone..."
        searchLabel="Search customers"
        minWidth={1050}
        filtersActive={isFiltered}
        onClearFilters={onClearFilters}
        filter={(customer) =>
          (filters.customerType === 'all' || customer.customerType === filters.customerType) &&
          (filters.status === 'all' || customer.status === filters.status) &&
          (!filters.fromDate || String(customer.createdAt).slice(0, 10) >= filters.fromDate) &&
          (!filters.toDate || String(customer.createdAt).slice(0, 10) <= filters.toDate)
        }
        selectable
        initialPageSize={10}
        actions={
          <Button variant="secondary" size="sm" onClick={() => downloadCsv({ filename: 'vinayak-customers.csv', columns: getCustomerFields().map((field) => ({ key: field.key, label: field.label })), rows: getCustomersCsvRows(customers) })} disabled={!canExport}>
            Export CSV
          </Button>
        }
        filters={
          <div className="customers-filters">
            <Select
              label="Customer Type"
              options={CUSTOMER_TYPES}
              value={filters.customerType}
              onChange={(event) => onFiltersChange({ customerType: event.target.value })}
              aria-label="Filter by type"
            />
            <Select
              label="Status"
              options={CUSTOMER_STATUSES}
              value={filters.status}
              onChange={(event) => onFiltersChange({ status: event.target.value })}
              aria-label="Filter by status"
            />
            <DateRangeFilter
              label="Date Added"
              value={{ preset: filters.fromDate || filters.toDate ? 'custom' : 'all', start: filters.fromDate, end: filters.toDate }}
              onChange={({ start, end }) => onFiltersChange({ fromDate: start ?? '', toDate: end ?? '' })}
            />
          </div>
        }
      />
    </div>
  )
}
