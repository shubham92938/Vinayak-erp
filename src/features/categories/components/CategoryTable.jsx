import { Edit3, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { RecordedTable } from '../../../components/recorded'
import { getFirms } from '../../../core/firmStore'
import { CATEGORY_STATUSES } from '../services/categoryService'
import { formatRecordedCategoryDate, getCategorySlug } from '../services/categoryUtils'
import '../styles/categories.css'

function RecordedCategoryAction({ icon: Icon, label, tone, onClick, disabled }) {
  return (
    <button
      type="button"
      className={['recorded-category-action', tone && `recorded-category-action--${tone}`].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <Icon size={14} strokeWidth={1.8} />
      <span>{tone === 'delete' ? 'Remove' : 'Edit'}</span>
    </button>
  )
}

export default function CategoryTable({
  categories,
  filters,
  onFiltersChange,
  onRowEdit,
  onRowDelete,
  canEdit = true,
  canDelete = true,
  showAdvancedFilters = false,
}) {
  const orderedCategories = useMemo(
    () => [...categories].sort((first, second) => {
      if (first.recordedOrder !== undefined && second.recordedOrder !== undefined) {
        return first.recordedOrder - second.recordedOrder
      }
      if (first.recordedOrder !== undefined) return -1
      if (second.recordedOrder !== undefined) return 1
      return String(first.name ?? '').localeCompare(String(second.name ?? ''))
    }),
    [categories],
  )

  const categoryColumns = useMemo(() => [
    {
      key: 'number',
      label: 'ID',
      width: '54px',
      align: 'center',
      render: (_category, index) => index + 1,
    },
    {
      key: 'name',
      label: 'NAME ↕',
      minWidth: '210px',
      render: (category) => category.name,
    },
    {
      key: 'slug',
      label: 'SLUG ↕',
      minWidth: '190px',
      render: (category) => getCategorySlug(category),
    },
    {
      key: 'description',
      label: 'DESCRIPTION ↕',
      minWidth: '200px',
      render: (category) => category.description || '—',
    },
    {
      key: 'createdAt',
      label: 'CREATED AT ↕',
      width: '145px',
      align: 'center',
      render: (category) => formatRecordedCategoryDate(category.createdAt),
    },
    {
      key: 'actions',
      label: 'ACTION',
      width: '132px',
      align: 'center',
      render: (category) => (
        <span className="recorded-category-actions">
          <RecordedCategoryAction
            icon={Edit3}
            label={`Edit ${category.name}`}
            tone="edit"
            onClick={() => onRowEdit(category.id)}
            disabled={!canEdit}
          />
          <RecordedCategoryAction
            icon={Trash2}
            label={`Remove ${category.name}`}
            tone="delete"
            onClick={() => onRowDelete(category.id)}
            disabled={!canDelete}
          />
        </span>
      ),
    },
  ], [canDelete, canEdit, onRowDelete, onRowEdit])

  const firms = useMemo(() => getFirms(), [])

  const advancedFilters = showAdvancedFilters ? (
    <div className="recorded-category-filters">
      <label>
        <span>Firm:</span>
        <select
          value={filters.firmId}
          onChange={(event) => onFiltersChange((current) => ({ ...current, firmId: event.target.value }))}
          aria-label="Filter categories by firm"
        >
          <option value="all">All firms</option>
          {firms.map((firm) => <option key={firm.id} value={firm.id}>{firm.name}</option>)}
        </select>
      </label>
      <label>
        <span>Status:</span>
        <select
          value={filters.status}
          onChange={(event) => onFiltersChange((current) => ({ ...current, status: event.target.value }))}
          aria-label="Filter categories by status"
        >
          <option value="all">All statuses</option>
          {CATEGORY_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
      </label>
    </div>
  ) : null

  return (
    <RecordedTable
      className="recorded-category-table"
      rows={orderedCategories}
      columns={categoryColumns}
      getRowId={(category) => category.id}
      initialPageSize={5}
      pageSizeOptions={[5, 10, 15, 25]}
      showFirstLast={false}
      search={filters.search}
      onSearchChange={(search) => onFiltersChange((current) => ({ ...current, search }))}
      getSearchText={(category) => [category.name, category.code, category.description]}
      searchPlaceholder="Name, code or description"
      searchLabel="Search categories by name, code or description"
      filters={advancedFilters}
      ariaLabel="Categories"
      minWidth={840}
      emptyMessage="No categories found."
    />
  )
}
