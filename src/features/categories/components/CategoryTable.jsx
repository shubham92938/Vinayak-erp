import { useMemo } from 'react'
import { ActionMenu, Badge, Button, Select } from '../../../components/ui'
import { DataTable } from '../../../components/data-table'
import { FirmFilter } from '../../../components/filters'
import { getFirmLabel } from '../../users/utils/userUtils'
import { CATEGORY_STATUSES } from '../services/categoryService'
import { formatCategoryDate } from '../services/categoryUtils'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...CATEGORY_STATUSES,
]

function CategoryName({ category }) {
  return (
    <span className="categories-name">
      <span className="categories-name__name">{category.name}</span>
      <span className="categories-name__code">{category.code}</span>
    </span>
  )
}

export default function CategoryTable({
  categories,
  filters,
  onFiltersChange,
  onClearFilters,
  onRowView,
  onRowEdit,
  onRowActivate,
  onRowDeactivate,
  onRowDelete,
  downloadCategories,
}) {
  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: 'Category Name',
        accessor: 'name',
        minWidth: '180px',
        cell: (category) => <CategoryName category={category} />,
      },
      {
        id: 'description',
        header: 'Description',
        accessor: 'description',
        minWidth: '190px',
      },
      {
        id: 'firm',
        header: 'Firm',
        accessor: (category) => getFirmLabel(category.firmId),
        width: '160px',
        cell: (category) => <span className="categories-firm">{getFirmLabel(category.firmId)}</span>,
      },
      {
        id: 'productCount',
        header: 'Products',
        accessor: 'productCount',
        width: '90px',
        align: 'center',
        cell: (category) => <span className="categories-product-count">{category.productCount ?? 0}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: '110px',
        cell: (category) => (
          <Badge variant={category.status === 'active' ? 'success' : 'neutral'} size="sm">
            {category.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created Date',
        accessor: 'createdAt',
        width: '120px',
        cell: (category) => <span className="categories-date">{formatCategoryDate(category.createdAt)}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '72px',
        sortable: false,
        cell: (category) => (
          <ActionMenu
            label="Category actions"
            triggerLabel={`Actions for ${category.name}`}
            items={[
              { label: 'View', onSelect: () => onRowView(category.id) },
              { label: 'Edit category', onSelect: () => onRowEdit(category.id) },
              {
                label: category.status === 'active' ? 'Deactivate category' : 'Activate category',
                onSelect: () =>
                  category.status === 'active'
                    ? onRowDeactivate(category.id)
                    : onRowActivate(category.id),
              },
              { label: 'Delete category', danger: true, onSelect: () => onRowDelete(category.id) },
            ]}
          />
        ),
      },
    ],
    [onRowView, onRowEdit, onRowActivate, onRowDeactivate, onRowDelete],
  )

  const isFiltered =
    Boolean(filters.search) ||
    filters.firmId !== 'all' ||
    filters.status !== 'all'

  return (
    <div className="categories-table">
      <DataTable
        data={categories}
        columns={columns}
        getRowId={(category) => category.id}
        search={filters.search}
        onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
        searchPlaceholder="Search category name or code..."
        searchLabel="Search categories"
        minWidth={920}
        filtersActive={isFiltered}
        onClearFilters={onClearFilters}
        selectable={false}
        actions={
          <Button variant="secondary" size="sm" onClick={() => downloadCategories(categories)}>
            Export CSV
          </Button>
        }
        filters={
          <div className="categories-filters">
            <FirmFilter value={filters.firmId} onChange={(firmId) => onFiltersChange({ firmId })} />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(event) => onFiltersChange({ status: event.target.value })}
              aria-label="Filter by status"
            />
          </div>
        }
      />
    </div>
  )
}
